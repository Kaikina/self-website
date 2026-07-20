---
title: "Markdown pour les agents, en self-hosted : un subscriber Symfony plutôt qu'un plan Cloudflare"
description: "Cloudflare convertit les pages en markdown pour les agents IA via Accept: text/markdown — sur les plans payants. Le même contrat HTTP tient dans un event subscriber Symfony de 144 lignes. Ma homepage est passée de 59 Ko de HTML à 7,7 Ko de markdown, même URL."
pubDate: 2026-07-08
tags: ["Symfony", "PHP", "AI Agents", "HTTP", "SEO"]
cover: ../_assets/markdown-for-agents.svg
ogImage: ../_assets/markdown-for-agents.png
coverAlt: "Une requête curl avec Accept: text/markdown à côté d'un document HTML converti en markdown propre, avec une réduction de taille de 87 %"
translationKey: "markdown-for-agents"
---

Une part croissante du trafic de mon side project n'est pas humaine. [Forgemage](https://forgemage.net) est une marketplace où les joueurs de Dofus trouvent des forgemages, et depuis que la recherche assistée par IA a décollé, une partie de ses « visiteurs » sont des LLM qui récupèrent une page pour répondre à la question de quelqu'un. Ils reçoivent la même chose que les navigateurs : 59 Ko de HTML pour environ mille mots de contenu réel. Le reste, ce sont des classes Bootstrap, des icônes SVG, un bandeau cookies et un footer que l'agent va consciencieusement tokeniser puis ignorer.

En février, Cloudflare a sorti une feature appelée [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) : quand un client envoie `Accept: text/markdown`, leur edge convertit la réponse HTML en markdown à la volée. Ils annoncent environ 80 % de tokens en moins par page. C'est un toggle dans le dashboard — sur les plans Pro et au-dessus.

Sauf qu'il n'y a aucune magie Cloudflare dans ce contrat. C'est de la négociation de contenu HTTP, un mécanisme plus vieux que la plupart des problèmes du web, plus un convertisseur HTML vers markdown. Forgemage est une app Symfony, donc j'ai implémenté le même comportement moi-même : un event subscriber, un package composer, un après-midi tests compris. Ce post détaille l'implémentation et les trois détails qui m'auraient piégé en production si la RFC ne m'avait pas prévenu avant.

## Le contrat avant le code

**Comment servir du HTML et du markdown depuis la même URL ?** Les deux versions vivent à la même URL. Un navigateur qui demande `https://forgemage.net/` reçoit du HTML ; un agent qui envoie `Accept: text/markdown` reçoit du markdown. Pas de préfixe `/md/`, pas de suffixe `.md`, pas de route séparée à maintenir.

Ça, c'est la partie agréable. Les règles de négociation sont l'endroit où les implémentations dérapent en silence :

Le markdown doit être demandé *nommément*. Le header Accept de chaque navigateur se termine par `*/*;q=0.8`, et un wildcard matche techniquement `text/markdown`. Traitez le wildcard comme un opt-in et vous servirez du markdown à Chrome. Je me méfie de celle-là depuis que j'ai lu le header que Firefox envoie réellement.

`q=0` est un refus explicite, pas une préférence faible — la RFC 9110 dit qu'une qualité de zéro signifie « ne m'envoie jamais ça ». Un client qui dit `text/markdown;q=0` reçoit du HTML, point.

En cas d'égalité, le markdown gagne. Si un client liste `text/html` et `text/markdown` à qualité égale, il a nommé le markdown explicitement. Les navigateurs ne font jamais ça. Une machine qui a pris la peine d'écrire `text/markdown` dans son header Accept le veut.

Voilà cette logique dans le subscriber, avec le parser `AcceptHeader` de Symfony pour ne pas réécrire le tri par qualité à la main :

```php
private function prefersMarkdown(Request $request): bool
{
    $accept = AcceptHeader::fromString($request->headers->get('Accept'));

    // Markdown must be asked for by name (case-insensitively, with any
    // media parameters) — a wildcard match is not opt-in.
    $markdown = null;
    foreach ($accept->all() as $item) {
        if (strcasecmp($item->getValue(), 'text/markdown') === 0) {
            $markdown = $item;
            break;
        }
    }

    // q=0 is an explicit refusal per RFC 9110.
    if ($markdown === null || $markdown->getQuality() <= 0.0) {
        return false;
    }

    $html = $accept->get('text/html');

    return $html === null || $markdown->getQuality() >= $html->getQuality();
}
```

La boucle manuelle plutôt que `$accept->get('text/markdown')` est délibérée : elle tolère la casse (`Text/Markdown`) et les paramètres de média (`text/markdown;variant=GFM`), deux choses légales selon la RFC et deux choses qu'un lookup strict par string raterait.

## Où se brancher, et quoi garder

**Où placer la conversion, et qu'est-ce qu'il faut protéger ?** Toute la feature est un subscriber `kernel.response`. Le controller rend son HTML exactement comme avant ; le subscriber décide ensuite s'il remplace le body. Aucun changement de controller, aucun changement de template, et supprimer la classe retire la feature proprement.

Avant de convertir quoi que ce soit, il abandonne sauf si *tout* ceci est vrai : c'est la main request, la méthode est GET ou HEAD, la réponse est `text/html`, le statut est 200, et — le garde-fou qui compte le plus pour moi — la route est indexable.

```php
if (!\in_array($request->getMethod(), [Request::METHOD_GET, Request::METHOD_HEAD], true)
    || !$this->sitemapService->isIndexable($request->attributes->get('_route'))
    || !str_starts_with($response->headers->get('Content-Type') ?? 'text/html', 'text/html')
) {
    return;
}
```

Cet appel à `isIndexable()` réutilise le service qui construit déjà mon sitemap et mon robots.txt. L'app a une seule définition de « page publique », et la version markdown en hérite. Un agent connecté qui frappe `/wishlist` ou un fil de messagerie avec `Accept: text/markdown` reçoit du HTML classique, parce que ces routes n'ont jamais été indexables. Je n'ai pas eu à énumérer les pages privées une deuxième fois, donc je ne peux pas non plus en oublier une une deuxième fois.

## Convertir du HTML qui n'a jamais été écrit pour être du markdown

**Que représente vraiment la conversion d'un HTML de page en markdown propre ?** La conversion elle-même, c'est [`league/html-to-markdown`](https://github.com/thephpleague/html-to-markdown), configuré une fois et mis en cache dans le subscriber :

```php
$this->htmlConverter = new HtmlConverter([
    'strip_tags' => true,
    'strip_placeholder_links' => true,
    'remove_nodes' => 'head script style noscript template iframe canvas svg nav header footer',
]);
$this->htmlConverter->getEnvironment()->addConverter(new TableConverter());
```

La liste `remove_nodes` est la décision éditoriale cachée dans la config. Scripts et styles, évident. `nav`, `header` et `footer`, c'est un choix : un agent qui demande la version markdown veut le contenu de la page, pas quarante liens de navigation et un language switcher répétés sur chaque URL du site. Couper l'habillage est une grosse partie de la réduction. `TableConverter` est opt-in dans le package league, et Forgemage a des tableaux de prix que je préfère voir lus comme des tableaux plutôt que comme du texte à la suite.

Deux petites touches après conversion. Si le résultat ne commence pas par un titre `# `, le subscriber promeut le `<title>` HTML en H1, pour que chaque document markdown s'ouvre sur son sujet — ce qu'un agent scanne en premier. Et toute la conversion est dans un `try/catch (Throwable)` qui retombe sur le HTML intact. Une version markdown, c'est un nice-to-have ; ça n'a pas le droit de mettre une page publique en 500.

## Les trois détails qui comptent vraiment

**Quels détails d'implémentation piègent vraiment en production ?** Tout ce qui précède est direct. Ces trois-là sont la raison pour laquelle j'enverrais un collègue vers ce post plutôt que vers le README du package.

**`Vary: Accept`, sur les deux versions.** Deux bodies différents vivent à une seule URL, donc chaque cache entre l'agent et l'app doit prendre le header Accept dans sa clé. Oubliez-le et un CDN met joyeusement la version markdown en cache, puis la sert au navigateur suivant. Le subscriber le pose avant même de vérifier si le markdown a été demandé, et avant le check du 200, parce que l'URL négocie quelle que soit la nature de cette réponse-là. Le `setVary('Accept', false)` de Symfony ajoute au lieu de remplacer, donc un `Vary` existant posé par un autre listener survit.

**HEAD doit négocier comme GET.** Un agent peut faire un HEAD d'abord pour vérifier le Content-Type avant de s'engager sur le téléchargement. Le `ResponseListener` de Symfony (priorité 0) supprime les bodies des HEAD dans `prepare()`, donc ce subscriber s'enregistre en priorité 10 pour passer avant — la réponse HEAD porte `Content-Type: text/markdown` et `Vary: Accept` exactement comme sa jumelle GET, juste sans body.

**Recalculer ce que le remplacement du body invalide.** Après avoir remplacé le contenu, le `Content-Length` périmé doit sauter (Symfony le recalcule), et le Content-Type devient `text/markdown; charset=utf-8`. Pour la version HTML, le subscriber ajoute à la place un indice de découvrabilité : `Link: <même-url>; rel="alternate"; type="text/markdown"`, ce qui permet à un crawler d'apprendre que le markdown existe sans qu'on le lui dise ailleurs.

## Prouver que ça marche

**Comment prouver que la négociation fonctionne ?** Sept tests `WebTestCase` verrouillent la matrice de négociation : l'Accept d'un navigateur garde le HTML, `*/*` n'est pas un opt-in, `q=0` refuse, `Text/Markdown;variant=GFM` matche, HEAD porte les mêmes headers, et une requête connectée vers une route privée ne convertit jamais. La suite entière est ennuyeuse exprès — chaque test fait quatre lignes de « envoie ce header Accept, vérifie ce Content-Type ».

Contre la production :

```bash
$ curl -sI https://forgemage.net/ | grep -i -e vary -e "text/markdown"
link: <https://forgemage.net/>; rel="alternate"; type="text/markdown"
vary: Accept

$ curl -s -H "Accept: text/markdown" https://forgemage.net/ | head -2
# Trouve tes forgemages sur notre plateforme Forgemage.net

$ curl -so /dev/null -w "%{size_download}\n" https://forgemage.net/
59432
$ curl -so /dev/null -w "%{size_download}\n" -H "Accept: text/markdown" https://forgemage.net/
7670
```

59 432 octets réduits à 7 670 — 87 % de moins sur le réseau, cohérent avec les ~80 % de tokens annoncés par Cloudflare. La version markdown, c'est la page telle qu'un humain la décrirait si vous lui demandiez ce qu'il y a dessus.

## Les limites, honnêtement

**Quand est-ce que servir du markdown comme ça montre ses limites ?**

**Garbage in, garbage out.** Le convertisseur transforme votre HTML rendu ; il ne peut pas ajouter une structure que vos templates n'ont pas. Les templates Twig de Forgemage utilisent de vrais headings et des listes sémantiques, donc le markdown sort lisible. Un front-end en soupe de div produirait de la soupe de markdown.

**Presque personne ne demande encore.** Je n'ai pas vu de crawler mainstream envoyer `Accept: text/markdown` spontanément. Les agents d'aujourd'hui récupèrent surtout du HTML et le convertissent côté client — l'outil WebFetch de Claude Code fait exactement ça. Cette feature est un pari que la convention poussée par Cloudflare devienne la norme, et la mise est faible : une dépendance, 144 lignes, aucun coût récurrent. Servir la conversion depuis l'origin veut aussi dire que le convertisseur de l'agent ne voit jamais mon bandeau cookies.

**Ça complète llms.txt, ça ne le remplace pas.** Ce site-ci a un `/llms.txt` — une carte éditorialisée pour les agents. La négociation de contenu répond à une autre question : « donne-moi *cette page*, pour pas cher ». L'un est une table des matières, l'autre est le livre imprimé dans une police lisible.

## À retenir

**Qu'est-ce qui se transpose à votre propre stack ?**

1. **Le Markdown for Agents de Cloudflare est un contrat, pas un produit.** `Accept: text/markdown` en entrée, body converti plus `Vary: Accept` en sortie. N'importe quel framework avec des events de réponse peut l'honorer.
2. **Les cas limites de la négociation sont la feature.** Le wildcard n'est pas un opt-in, `q=0` veut dire jamais, le matching est insensible à la casse et tolérant aux paramètres. Ratez-les et les navigateurs voient du markdown.
3. **Réutilisez votre logique d'indexabilité comme garde-fou.** Si le sitemap ne la listerait pas, la version markdown ne devrait pas exister. Une seule définition de « public », appliquée deux fois gratuitement.
4. **Coupez l'habillage dans la config du convertisseur.** Retirer `nav`, `header` et `footer`, c'est de là que vient l'essentiel des 87 %, et ça tient dans une string de config.

Un après-midi de travail, passé pour l'essentiel à écrire des tests pour des headers Accept qu'aucun client n'enverra peut-être jamais. Mais le jour où le premier agent demandera du markdown à mon serveur en le nommant, il recevra une réponse propre avec 87 % de remise — et je n'ai pas eu à changer de plan pour ça.
