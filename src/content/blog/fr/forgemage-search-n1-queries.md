---
title: "Chaque nouveau forgemage rendait la recherche plus lente : tuer le N+1 derrière Forgemage.net"
description: "L'annuaire des forgemages de Forgemage.net lançait environ sept requêtes par carte — avis, temps de réponse, statut en ligne, trois relations lazy — plus des compteurs de facettes recalculés à chaque changement de filtre. Voilà comment je suis passé d'une page de 24 cartes à ~168 requêtes à une poignée, avec un cache batch scopé à la requête et une passe paginate-then-hydrate, sans toucher aux pages profil individuelles."
pubDate: 2026-07-20
tags: ["Symfony", "Doctrine", "PHP", "Performance", "N+1"]
cover: ../_assets/forgemage-search-n1-queries.svg
ogImage: ../_assets/forgemage-search-n1-queries.png
coverAlt: "Une page de recherche remplie de cartes de profil, chaque carte lançant sa propre requête, qui se réduit à une seule requête batch pour toute la page"
translationKey: "forgemage-search-n1-queries"
---

[Forgemage.net](https://forgemage.net) est un side-project à moi : une marketplace pour la forgemagie de Dofus, le craft in-game qui consiste à enchanter le stuff. Les joueurs postent ce qu'ils veulent faire FM, et ceux qui font la FM — les forgemages — ont un profil public avec des avis, un temps de réponse moyen, un badge s'ils l'ont mérité. Le cœur du truc, c'est [l'annuaire](https://forgemage.net/s) : une grille paginée de cartes de profil que tu filtres par serveur, spécialité et note.

Cette page était rapide quand j'étais le seul profil en base. Elle devenait un peu plus lente à chaque inscription. Pas d'erreur, pas de timeout, rien qui déclenche une alerte — juste une page qui mettait plus de temps chaque semaine, comme une pièce qui devient le bazar sans qu'il y ait un seul jour dont tu dirais que c'est le jour où c'est devenu le bazar. Puis j'ai ouvert le profiler Symfony sur une page pleine de résultats et le nombre de requêtes m'a fait poser mon café.

Ça change des [tuyauteries d'IA](/blog/markdown-for-agents/) dont je parle ces derniers temps. Pas de modèle, pas d'agent. Juste Doctrine, une page de listing, et le plus vieux bug de perf qui existe, planqué à l'endroit le plus ennuyeux qu'il ait pu trouver.

## Une requête par carte, invisible jusqu'à ce que les cartes se multiplient

**Pourquoi une page qui marchait bien se met soudain à ramer ?** Parce que « bien » se mesurait sur trois profils, et que le coût était par profil depuis le début.

Chaque carte de l'annuaire affiche un petit tas de faits : est-ce que cette personne est active récemment, quelle est sa note moyenne, combien de FM elle a terminées, à quelle vitesse elle répond, quel badge, quels serveurs, quelles spécialités. Dans le template, c'est propre et lisible — une poignée de fonctions Twig, une par fait :

```twig
{% set smithmageActive = smithmage_active(smithmage.user) %}
{% set stats = get_forgemage_stats(smithmage.user) %}
{% set maggingsDoneCount = maggings_done_count(smithmage) %}
{% set answerTime = answer_time(smithmage.user) %}
```

Chacune de ces fonctions était une extension Twig qui appelait un repository, et chaque appel était son propre `SELECT`. Quatre requêtes par carte avant même de compter les relations. Ensuite `smithmage.badge`, `smithmage.gameServers` et `smithmage.specialties` sont des associations Doctrine que je n'ai jamais eager-loadées, donc y toucher dans le template lazy-loadait chacune à la demande — trois requêtes de plus par carte.

Sept requêtes par carte. La page en affiche 24. Donc une seule vue de listing lançait quelque chose comme 160 requêtes bien tassées avant même que les compteurs de facettes de la sidebar aient leur tour. Sur mon laptop, contre une base quasi vide, c'est quelques millisecondes et tu ne remarques jamais rien. En prod, contre une table qui grossit à chaque fois que le truc marche vraiment, c'est la définition même du bug qui débarque à une date que tu n'as pas choisie.

Le plus frustrant, c'est que rien ne paraît faux. Chaque fonction fait exactement une chose sensée. Le N+1 n'est dans aucune ligne — il est dans la boucle que le template enroule autour de toutes, et tu ne peux pas voir une boucle en lisant une seule carte.

## Le fix qui a l'air évident et casse la pagination

**Pourquoi ne pas juste fetch-joindre tout sur la requête de listing ?** C'est le réflexe, et pour le badge — un simple many-to-one — c'est nickel. Pour `gameServers` et `specialties`, ça explose en silence.

La requête de listing est paginée : 24 lignes avec un `LIMIT`. À la seconde où tu fetch-joins une collection to-many sur une requête qui a un `setMaxResults()`, Doctrine ne peut plus faire confiance au limit. Un profil avec quatre spécialités, ça fait quatre lignes dans le result set, donc `LIMIT 24` ne veut plus dire 24 profils — ça veut dire 24 lignes, soit peut-être six profils dont les spécialités du dernier sont coupées en deux. Doctrine le sait, c'est pour ça qu'il arrête d'appliquer le limit en SQL et pagine en mémoire à la place : il charge *toutes* les lignes qui matchent, hydrate le set entier, puis te tend la page une. Tu viens de transformer une requête paginée en chargement de table complète pour économiser quelques allers-retours. Ce n'est pas un fix, c'est une version plus grosse du même problème.

Du coup j'ai gardé la requête de listing maigre — elle sélectionne les 24 profils qu'elle doit sélectionner et rien de plus — et j'hydrate les collections dans une seconde passe, scopée exactement aux ids que j'ai déjà :

```php
public function hydrateListingRelations(array $profiles): void
{
    if ($profiles === []) {
        return;
    }

    $ids = array_map(static fn (ForgemageProfile $p) => $p->getId(), $profiles);

    $this->createQueryBuilder('fp')
        ->addSelect('badge', 'gameServers', 'specialties')
        ->leftJoin('fp.badge', 'badge')
        ->leftJoin('fp.gameServers', 'gameServers')
        ->leftJoin('fp.specialties', 'specialties')
        ->where('fp.id IN (:ids)')
        ->setParameter('ids', $ids)
        ->getQuery()
        ->getResult();
}
```

Il n'y a pas de `LIMIT` ici, donc le fan-out est inoffensif — il est borné par les 24 ids que je passe. Et je ne me sers jamais de la valeur de retour. Ça a l'air d'une erreur jusqu'à ce que tu saches comment Doctrine fonctionne : hydrater ces entités tire leurs collections dans l'identity map de l'unit of work, et les objets profil que le template tient déjà sont les *mêmes* objets. Quand une carte lit ensuite `smithmage.specialties`, la donnée est déjà en mémoire. Pas de requête. Le second `SELECT` les a toutes payées d'un coup.

Trois relations lazy sur 24 cartes — 72 requêtes — sont devenues une seule.

## Batcher les stats par carte au même endroit

**Où mettre les requêtes batchées pour que les cartes les trouvent sans faire passer de l'état à travers chaque template ?** J'ai donné à la requête un objet dont le seul boulot est de tenir les stats de cette page, réchauffé une fois et lu plein de fois.

Les relations, c'était la moitié facile, parce que l'identity map de Doctrine fait le cache pour toi. Les quatre requêtes de stats n'ont pas eu cette chance — ce sont des agrégats (`AVG(rating)`, `COUNT` de FM terminées, une ligne de temps de réponse, une ligne de statut en ligne), pas des chargements d'entité, donc rien ne les dédoublonne gratuitement. J'ai écrit un petit service, `ForgemageCardStatsCache`, qui lance chaque agrégat une fois pour toute la page :

```php
public function warmForProfiles(array $profiles): void
{
    $users = /* dédoublonne les users derrière ces profils */;

    $this->reviewStatsByUserId       = $this->reviewRepository->getForgemageStatsForUsers($users);
    $this->maggingsDoneCountByProfileId = $this->requestRepository->findMaggingsDoneCountForProfiles($profiles);
    $this->responseStatsByUserId     = $this->participantResponseStatsRepository->findByParticipants($users);
    // …statut en ligne, même forme

    $this->warmed = true;
}
```

Chacune de ces méthodes de repository est le jumeau batché d'une méthode single-item existante : `getForgemageStats($user)` a gagné un `getForgemageStatsForUsers($users)` qui fait le même agrégat avec `WHERE reviewee IN (:users)` et un `GROUP BY`, en renvoyant une map keyée par user id. Même requête, lancée une fois pour la page au lieu d'une fois par ligne. Le service de recherche appelle `warmForProfiles()` juste après avoir récupéré la page, et quatre N+1 par carte de plus se réduisent à quatre requêtes à plat.

Un détail qui compte pour la correction : le service `implements ResetInterface`. Symfony appelle `reset()` entre les requêtes, ce qui vide les maps réchauffées. Sans ça, un worker long-running servirait joyeusement à un visiteur les stats cachées d'un autre visiteur — le genre de bug invisible en dev, où chaque requête est un process frais, et discrètement faux le jour où tu mets l'app derrière un runtime persistant.

## Le fallback qui garde les pages profil honnêtes

**Comment batcher la liste sans casser les pages qui rendent un seul profil ?** Tu rends le cache batch optionnel, et tu laisses l'ancien chemin single-item exactement là où il était.

Une page de profil détaillé rend une carte. Un dashboard en rend une. Réchauffer un batch pleine-page pour ça serait idiot, donc rien ne le réchauffe là-bas — et les fonctions Twig doivent composer avec un cache qui n'a jamais été rempli. Elles demandent d'abord au cache et retombent sur l'appel repository d'origine quand il revient vide :

```php
public function maggingsDoneCount(ForgemageProfile $profile): int
{
    return $this->statsCache->getMaggingsDoneCount($profile)
        ?? $this->requestRepository->findMaggingsDoneCount($profile);
}
```

L'annuaire réchauffe le cache, donc les cartes tapent dedans. Toutes les autres pages le laissent froid, donc ces `??` retombent sur la requête qui a toujours été là. Aucune page n'a eu de cas particulier ; le chemin rapide n'est qu'un indice dont le chemin lent n'a pas besoin.

Il y a un endroit où `??` ne suffit pas, et c'est mon bout préféré de tout le changement. Les stats de réponse peuvent légitimement être `null` — un forgemage qui n'a jamais eu de conversation n'a pas de ligne. Mais « pas réchauffé » veut *aussi* dire « va demander au repository ». Si les deux états étaient `null`, un user réellement sans stats sur l'annuaire retomberait sur une requête redondante, réintroduisant discrètement le N+1 pour exactement les gens que le cache était censé couvrir. Donc le signal pas-réchauffé, c'est `false`, une valeur que le vrai résultat ne peut jamais prendre :

```php
public function getResponseStats(User $user): ParticipantResponseStats|false|null
{
    if (!$this->warmed) {
        return false; // pas réchauffé : l'appelant doit retomber sur le repo
    }

    return $this->responseStatsByUserId[$user->getId()] ?? null; // réchauffé, vraiment pas de ligne
}
```

Les retours à trois états ont mauvaise presse, et le méritent souvent. Mais confondre « je ne sais pas » et « je sais qu'il n'y a rien », c'est un vrai bug qui attend son heure, et un type union qui dit `false|null` à voix haute est plus honnête qu'un `null` qui veut dire deux choses différentes selon qui demande.

## Les compteurs de facettes n'ont pas besoin d'être vrais à la seconde

**Pourquoi recalculer les chiffres de la sidebar à chaque frappe ?** Tu n'y es pas obligé, et je le faisais.

La sidebar de filtres montre combien de profils se cachent derrière chaque spécialité et chaque badge. Ce sont des agrégats `GROUP BY` sur tout l'ensemble éligible, et ils étaient recalculés à chaque requête — donc chaque fois que quelqu'un basculait un filtre, le serveur relançait les mêmes gros comptes pour lui dire « 142 profils font du stuff Féca » alors que la vraie réponse n'avait pas bougé depuis une heure. Les compteurs de facettes sont le cas d'école du légèrement périmé : personne ne remarque, et personne n'est lésé, si le chiffre a cinq minutes.

Donc ils passent par le cache de Symfony avec un TTL de cinq minutes, keyé par la combinaison de filtres qui change réellement la réponse :

```php
$cacheKey = sprintf(
    'search_specialty_counts.%s.%s.%s',
    $gameServerId?->value ?? 'all',
    $superSmithmagusOnly ? 1 : 0,
    $minRating ? 1 : 0,
);

return $this->cache->get($cacheKey, function (ItemInterface $item) use (/* … */) {
    $item->expiresAfter(300);
    // …l'agrégat qui tournait à chaque fois
});
```

Bien construire la clé, c'est tout le jeu. Oublies-y un filtre et tu sers les compteurs d'un filtre sous ceux d'un autre — un bug de cache qui ressemble exactement à un bug de comptage et te fait perdre un après-midi avant que tu penses à vérifier la clé. Mets-en trop dedans et le cache ne hit jamais. La règle sur laquelle je reviens toujours : la clé doit nommer chaque input qui change le résultat, et rien d'autre.

## Le check premium que j'ai juste supprimé

**Qu'est-ce qui est plus rapide qu'une requête batchée ?** Pas de requête.

Un des lookups par carte était un check d'abonnement premium, son propre appel repository par user pour demander « est-ce que cette personne est premium ». Mais la requête de l'annuaire eager-loade déjà l'association d'abonnement pour d'autres raisons, donc la réponse était en mémoire depuis le début — je payais un aller-retour pour aller chercher un truc que j'avais déjà. Le fix, c'était de supprimer l'appel repository et de lire l'objet :

```php
public function hasActivePremium(User $user): bool
{
    return $user->isPremium();
}
```

Le hic, et je veux être honnête là-dessus : `hasActivePremium()` suppose maintenant en silence que l'appelant a eager-loadé cette association. Sur l'annuaire, c'est vrai. Si une page future appelle ça sans l'eager-load, ça marchera quand même — Doctrine lazy-loadera la relation — et j'aurai discrètement réintroduit le N+1 que je viens de virer, sans rien pour me prévenir. C'est du vrai couplage. J'ai troqué une requête garantie contre une hypothèse, et l'hypothèse n'est écrite nulle part où le compilateur puisse la voir. J'ai laissé un commentaire ; un commentaire n'est pas un test.

## Les trucs dont je ne suis pas fier

**Qu'est-ce qu'il reste à devoir ?** Deux-trois choses, dans l'esprit de ne pas écrire une brochure.

Le couplage premium au-dessus est le plus bruyant. Il est correct aujourd'hui et load-bearing sur le fait qu'exactement une page soit configurée comme il faut.

L'appel à `warmForProfiles()` vit dans le service de recherche, ce qui veut dire que le batching n'a lieu que parce que ce seul call site pense à le faire. Toute nouvelle page qui liste des profils doit savoir réchauffer le cache, sinon elle récupère silencieusement le chemin lent. Le chemin rapide est opt-in, et la perf opt-in est le genre que tu perds par accident.

Et les cinq minutes de péremption des facettes sont un chiffre que j'ai choisi au feeling, pas en mesurant quoi que ce soit. C'est probablement bien. « Probablement bien » est une description honnête de la plupart des TTL, et je préfère le dire que faire semblant d'avoir dérivé 300 secondes d'une donnée que je n'ai jamais collectée.

## À retenir

1. **Le N+1 est un bug de croissance, pas un bug de code.** Il se lit bien, se review bien, et passe chaque test contre une petite fixture. Il n'apparaît que contre le volume de données qui veut dire que le produit marche. Charge le profiler contre une page *pleine*, pas une fixture.
2. **Fetch-joindre un to-many avec un `LIMIT` est un piège.** Doctrine ne peut pas paginer un result set fanné-out en SQL, donc il le fait en mémoire — transformant ta requête paginée en chargement complet. Pagine la requête maigre, puis hydrate les collections dans une seconde passe keyée sur les ids que tu as déjà.
3. **Batche là où est la boucle, pas là où est la donnée.** Les cartes ne peuvent pas s'empêcher d'être une boucle. Le fix appartient à un niveau au-dessus, dans un service qui réchauffe les stats de toute la page une fois et les rend par id.
4. **Rends le chemin rapide optionnel et le chemin lent par défaut.** Un cache que les pages profil ne remplissent pas, et des fonctions Twig qui retombent dessus quand il est froid, ont fait que le gain n'a rien coûté à ces pages — et ne m'a coûté aucun cas particulier.
5. **Une clé qui oublie un input est un bug qui ressemble à un autre bug.** Le plus dur pour cacher les compteurs de facettes, ce n'était pas le cache. C'était de nommer chaque filtre qui change la réponse, et rien qui ne la change pas.

Forgemage.net est une app Symfony solo que je fais tourner pour un jeu que j'aime. Ce genre de fix est le boulot le moins glamour qui soit — pas de feature, pas de screenshot, rien dont un user te remerciera jamais. Ils remarqueront juste que la page a arrêté de ralentir. C'est généralement comme ça que ça se passe.
