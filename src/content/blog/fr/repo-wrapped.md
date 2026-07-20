---
title: "RepoWrapped : le Spotify Wrapped d'un dépôt GitHub, et l'API qui m'a résisté"
description: "Une idée de week-end — une page de stats partageable et un badge README pour n'importe quel dépôt GitHub et n'importe quel contributeur — qui a viré au combat avec l'API stats de GitHub : des 202 qui ne se résolvent jamais, un mur au top 100, et une date de premier commit qu'il faut extorquer à un header."
pubDate: 2026-07-01
tags: ["Laravel", "PHP", "GitHub API", "Caching", "Side Project"]
cover: ../_assets/repo-wrapped.svg
ogImage: ../_assets/repo-wrapped.png
coverAlt: "Un relevé de stats en vert terminal pour un dépôt GitHub : un gros chiffre de commits, un classement de contributeurs, et une carte SVG embarquable"
translationKey: "repo-wrapped"
---

Chaque mois de décembre, Spotify te sort ton petit bilan de l'année et la moitié de ton feed se transforme en captures d'écran de ce truc. Ça marche parce que les chiffres ont toujours été là — tu n'avais juste jamais eu l'occasion de les voir mis en scène comme une histoire sur *toi*. J'ai voulu ça pour un dépôt GitHub. Tu le pointes sur `owner/repo`, tu choisis un contributeur, et tu obtiens une page qui dit : voilà combien de commits tu as posés, voilà ton classement, voilà la semaine où tu es parti en vrille. Puis tu peux glisser un badge SVG dans ton README pour qu'il vive à côté du build status.

C'était tout le pitch. Un week-end, peut-être. Je l'ai appelé [RepoWrapped](https://repo-wrapped.tom-girou.dev), et la partie front-end a effectivement pris un week-end. Le reste du temps est parti dans un combat que je n'avais pas vu venir : **réussir à sortir les chiffres de GitHub, tout court.**

Ça change des [articles sur la sécurité des IA](/blog/claude-gitlab-ai-review/) que j'écris ces derniers temps — pas de modèle ici, juste une petite app Laravel et une API qui ne veut pas te dire ce que tu lui demandes. C'est le genre d'histoire de side-project plus honnête, celle où l'idée fun est une erreur d'arrondi et où le vrai boulot est quelque part où tu ne l'attendais pas.

## L'idée est triviale. La donnée, non.

**Pourquoi sortir les stats d'un dépôt est-il plus dur qu'il n'y paraît ?** « Récupérer les stats de commits d'un dépôt », ça sonne comme un seul endpoint. Ce n'est pas un seul endpoint, et ceux dont tu as besoin se comportent d'une façon qui ne prend son sens qu'une fois que tu t'y es brûlé.

Voilà ce que je voulais par contributeur : total de commits, lignes ajoutées et supprimées, un sparkline d'activité hebdo, la date de son premier commit, et sa place dans le classement du dépôt. Quatre de ces cinq viennent d'un unique endpoint GitHub — `/stats/contributors`. C'est là que se joue l'essentiel de cette histoire, parce qu'il contient deux pièges, et je suis tombé dans les deux.

## Piège numéro un : le 202 qui veut dire « repasse plus tard »

**Que faire quand GitHub renvoie un 202 sans données ?** La première fois que tu tapes `/stats/contributors` sur un dépôt que GitHub n'a pas crunché récemment, tu n'obtiens pas de données. Tu obtiens un `202 Accepted` et un body vide. GitHub te dit : j'ai lancé le calcul, redemande dans un moment.

Bon. Donc tu retries. Sauf que « dans un moment » n'est pas un chiffre, et sur un gros dépôt ça peut durer. Une boucle de retry naïve soit abandonne trop tôt sur un dépôt lent, soit matraque un dépôt rapide. Donc le fetch fait du backoff — 1, 2, 4, 8, 16 secondes, cinq tentatives — et la plupart des dépôts se résolvent dans cette fenêtre.

La plupart. Pas tous. Et c'est le point qui m'a demandé une deuxième passe : une requête web synchrone ne peut pas rester plantée là à attendre 30 secondes que GitHub finisse un calcul. Le navigateur du visiteur lâche l'affaire, et même s'il tenait, tu retiens un worker PHP en otage pour un job qui n'a rien à voir avec la réponse.

Donc quand le backoff est épuisé et que GitHub renvoie *encore* un 202, j'arrête d'attendre dans la requête et je file le problème à une queue. Un job `RetryContributorStats` est dispatché (5 tentatives, backoff de 30 secondes), la page répond immédiatement avec les données partielles que j'ai — marquées `partial: true` pour que l'UI puisse dire « calcul en cours » honnêtement — et quand le job finit par ramener les vrais chiffres, il les merge dans l'enregistrement stocké. Le visiteur qui a demandé ne voit jamais l'attente. Celui qui charge la page une minute plus tard voit le résultat fini.

La leçon n'est pas subtile, mais elle est facile à zapper quand tu vas vite : **tout calcul externe qui peut durer plus longtemps qu'un chargement de page appartient à une queue, pas au controller.** Le 202, c'est GitHub qui te le dit poliment d'avance. Je ne l'ai juste pas écouté la première fois.

## Piège numéro deux : le mur du top 100

**Que se passe-t-il quand ton contributeur est au-delà du top 100 ?** Le deuxième piège est plus discret, parce qu'il ne renvoie pas d'erreur. `/stats/contributors` renvoie les 100 premiers contributeurs par nombre de commits. Si la personne que tu wrappes est le contributeur 101, l'endpoint renvoie une réponse propre et réussie — et elle n'y est simplement pas. Pas de flag, pas d'avertissement. Ton code a l'air de marcher, puis quelqu'un l'essaie sur `laravel/framework` pour un contributeur du milieu de tableau et récupère une page pleine de zéros.

Il n'y a pas de paramètre « donne-moi le contributeur 143 ». Donc le fallback consiste à faire à la main ce que l'endpoint stats aurait fait pour toi : paginer les commits de cet utilisateur sur le dépôt (`?author=username`), ouvrir chacun, et sommer les ajouts et suppressions à partir des diffs de commits individuels. C'est une boucle N+1 et je le sais — une requête pour lister, une par commit pour les comptes de lignes — donc c'est plafonné à 100 commits. Pas parfait. Mais « à peu près juste pour la longue traîne » vaut mieux que « zéro avec assurance », et l'alternative était de faire comme si le contributeur 101 n'existait pas.

J'ai laissé dans cette méthode un commentaire qui dit juste `// N+1 by design`. Certains des meilleurs commentaires sont ceux qui empêchent le toi-du-futur de « réparer » habilement un truc qui était un compromis délibéré.

## L'astuce du premier commit

**Comment trouver le premier commit de quelqu'un sans endpoint pour ça ?** Le cinquième chiffre — la date du *premier* commit de quelqu'un — n'a aucun endpoint. L'approche évidente est de paginer son historique de commits jusqu'au tout dernier, ce qui, sur un dépôt de longue date, fait beaucoup de requêtes pour répondre à « c'est lequel le plus vieux ».

L'endpoint commits de GitHub est paginé, et les réponses paginées portent un header `Link` avec `rel="first"`, `rel="prev"`, `rel="next"`, et — celui qui sert — `rel="last"`. Donc : demande la liste des commits avec `per_page=1`, lis l'URL `rel="last"` dans le header, et elle pointe droit sur la dernière page, qui est le commit le plus vieux. Une requête pour trouver la page, une pour la récupérer. Sans parcourir l'historique.

J'ai eu l'impression de resquiller. Sauf que c'est juste lire le mode d'emploi de l'API — la métadonnée de pagination était là depuis le début, je n'avais juste jamais eu de raison de me servir de `rel="last"`.

## Le cache, parce que l'API a un budget

**Comment rester dans le rate limit de GitHub ?** Le rate limit de GitHub est bien réel et, avec le fan-out du fallback top 100, plus proche que tu ne crois. Donc rien ne recalcule s'il n'y est pas obligé. Les résultats vivent sur deux couches : Redis avec un TTL d'une heure pour le chemin rapide, et Postgres pendant 24 heures comme copie durable. Une requête vérifie Redis, puis Postgres, et seul un vrai miss dispatche le job de calcul et dépose le visiteur sur une page de loading qui poll un endpoint `/status` jusqu'à ce que l'enregistrement passe `fresh`.

Par-dessus, il y a un rate limiter en token-bucket devant le client GitHub lui-même — 10 requêtes par seconde, 4 500 par heure, tracké dans Redis. La décision dont je suis le moins sûr est ici : si Redis est down, le limiter *bypasse* au lieu de bloquer. Il logge un warning et laisse passer la requête. J'ai choisi « l'app continue de tourner et je risque d'agacer GitHub » plutôt que « Redis a un hoquet et tout le site part en 500 ». Pour un projet perso c'est le bon choix. Pour un truc avec un vrai rayon de dégâts, je voudrais le défaut inverse, et je crois que c'est la façon honnête de décrire un compromis — pas « c'est le bon pattern » mais « voilà pour quoi j'ai optimisé, et voilà quand je basculerais ».

## Le badge devait tenir en un seul fichier

**Pourquoi le badge README doit-il tenir en un seul fichier autonome ?** La partie dont je suis discrètement le plus fier, c'est la carte embarquable. Tu mets ça dans un README :

```markdown
![RepoWrapped](https://repo-wrapped.tom-girou.dev/card/laravel/framework/taylorotwell?theme=dark)
```

et tu obtiens un SVG qui s'affiche inline, façon shields.io, avec `?theme=` et `?hide=` pour le piloter. Le piège dont personne ne te prévient : GitHub sert les images de README à travers son propre proxy d'images (Camo), et ce proxy récupère ton SVG une fois, depuis ses propres serveurs, sans navigateur et sans requête de suivi. Tout ce que ton SVG essaie de charger — un avatar depuis `avatars.githubusercontent.com`, une font externe, une deuxième requête quelle qu'elle soit — n'arrive silencieusement pas. Tu te retrouves avec une carte trouée d'une image cassée là où devrait être le visage.

Donc la carte doit être vraiment autonome. C'est un template Blade rendu avec un content-type `image/svg+xml`, et avant le rendu, le controller récupère l'avatar du contributeur côté serveur et l'inline en base64 directement dans le SVG sous forme de data URI. Un fichier, aucune dépendance externe, rien que le proxy puisse rater. Ça marche comme `<img src>` n'importe où, ce qui est exactement le but d'un badge.

## Le design, en bref

**À quoi ressemble la page, au juste ?** Je t'épargne le détail complet, mais le look est délibéré : un relevé de terminal. Canvas presque noir, IBM Plex Mono, un seul accent vert phosphore tenu sous cinq pour cent de l'écran, le gros chiffre de commits en blanc simple parce que la donnée est la star et n'a pas besoin d'être habillée. Pas d'orbes en gradient, pas de glassmorphism, pas de faux chrome de fenêtre avec ses petits points façon feu tricolore. Ça se lit comme un CLI qui imprime tes stats, ce qui, pour un outil destiné à des gens qui vivent dans un terminal, semblait le seul choix honnête.

## Les morceaux dont je ne suis pas fier

**Qu'est-ce que je changerais encore ?** Deux, dans l'esprit de ne pas écrire une plaquette commerciale.

Il y a une branche de staleness dans le service de cache que j'ai commentée et *contournée* au lieu de la traverser — le controller fait sa propre vérif de fraîcheur en amont pour que le code commenté ne morde jamais, mais quiconque lit le service isolément serait perdu, et « déroutant mais correct » est une dette que je dois encore à ce fichier.

Et il y a un bug de casse que je connais et n'ai pas corrigé : je passe `owner` et `repo` en minuscules avant qu'ils touchent la clé de cache, mais pas `username`. Du coup `/u/laravel/framework/TaylorOtwell` et `/.../taylorotwell` sont deux entrées de cache différentes et deux lignes de base différentes pour la même personne. Ça n'a pas encore posé de vrai problème. Ça en posera absolument le jour où quelqu'un partagera une URL avec une casse différente. C'est noté dans les notes du projet précisément pour ne pas être oublié — ce qui est l'état honnête de la plupart des side-projects : un truc qui marche avec une courte liste de péchés qu'on a choisi d'assumer pour l'instant.

## À retenir

**Qu'est-ce qu'il faut en retenir ?**

1. **L'idée n'est jamais le boulot.** « Spotify Wrapped pour un dépôt », c'était un week-end d'UI. Le vrai projet, c'était trois bizarreries d'un seul endpoint GitHub. Quand un truc sonne trivial, c'est en général la source de données qui cache l'ingénierie réelle.
2. **Un 202 est une instruction de design.** Quand une API te dit qu'il lui faut du temps, c'est ton signal pour sortir le travail du chemin de la requête et le mettre sur une queue — pas pour retry plus fort dans le controller.
3. **Gère le trou silencieux, pas juste l'erreur bruyante.** Le mur du top 100 ne lève jamais d'exception. Les échecs qui ne s'annoncent pas sont ceux qui arrivent en prod déguisés en succès.
4. **Autonome vaut mieux que malin.** Le badge marche partout parce qu'il ne demande rien à celui qui l'embarque. Un fichier, aucun fetch, aucune surprise — cette contrainte l'a rendu robuste, pas limité.

C'est [open source](https://github.com/Kaikina/repo-wrapped), Laravel 13 et PHP 8.3, sous licence MIT. Si tu le pointes sur un dépôt à toi et que les chiffres ont l'air justes, cette exactitude discrète a coûté plus cher que la jolie page. C'est en général comme ça que ça se passe.
