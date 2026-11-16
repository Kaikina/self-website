---
title: "Pourquoi j'ai désinstallé rtk : économiser des tokens ne vaut pas un grep faux"
description: "rtk réécrit les commandes shell d'un agent IA pour alléger leur sortie. Dans mon pipeline Claude Code sans surveillance, il a aussi transformé un grep juste en zéro affirmatif, et l'agent a passé la matinée à me demander d'ajouter une config déjà présente."
pubDate: 2026-11-16
tags: ["Claude Code", "AI Agents", "Developer Tools", "Bash", "Workflow"]
cover: ../_assets/why-we-uninstalled-rtk.svg
ogImage: ../_assets/why-we-uninstalled-rtk.png
coverAlt: "Un terminal où grep -c sur un fichier de réglages affiche « 🔍 0 », à côté du même fichier lu avec jq qui compte 18 entrées"
translationKey: "why-we-uninstalled-rtk"
---

Ce matin, mon pipeline d'agents m'a posé la même question une dizaine de fois. À chaque passe, la boucle de triage vérifiait un fichier de config, ne trouvait rien, et écrivait dans mon briefing qu'une entrée manquait toujours et que je devais l'ajouter.

Je l'avais ajoutée à 09:23. Le fichier contenait 18 lignes correspondantes. L'agent ne mentait pas vraiment : il lançait `grep`, `grep` répondait zéro, et il croyait `grep`. Sauf que ce qui répondait n'était pas vraiment `grep`.

Alors j'ai désinstallé rtk. Voici pourquoi.

## Ce que fait rtk

**C'est quoi, rtk ?** rtk, « Rust Token Killer », est un petit proxy CLI pour agents de code. On le branche dans Claude Code comme hook `PreToolUse`, et chaque commande Bash de l'agent est réécrite au passage : `git status` devient `rtk git status`, `grep` devient `rtk grep`, `cat` devient `rtk read`. rtk lance la vraie commande et compresse la sortie avant que le modèle la voie. La promesse : 60 à 90 % de tokens en moins sur les opérations courantes.

La promesse n'est pas fausse. Un `git log` ou un long `ls`, c'est surtout du bruit pour un modèle, et le contexte est la ressource rare d'une longue session d'agent. Je l'avais installé, j'aimais bien voir `rtk gain` me dire combien il avait économisé, et en usage interactif je l'oubliais presque.

Mais je ne travaille pas qu'en interactif. Je fais tourner un pipeline sans surveillance (celui que j'évoquais dans [le billet sur le disque plein](/fr/blog/disk-full-ssh-rescue/)) qui lit Jira et Gmail, m'écrit un briefing le matin et emmène les tickets en file jusqu'à une merge request en brouillon. Des `claude -p` headless sur des timers systemd, et personne pour regarder le transcript pendant qu'il s'écrit. C'est là que ça a déraillé.

## Le zéro qui n'en était pas un

**Qu'est-ce qui a cassé ?** Un job du worker, sur la boutique d'un client, devait reproduire un bug front dans un vrai navigateur. J'avais accepté de donner au worker les outils MCP `chrome-devtools`, et l'allowlist de `settings.worker.json` avait reçu ses 18 nouvelles entrées. Le triage devait le constater et arrêter de demander.

Voici ce qu'il a lancé, et ce qu'il a reçu :

```bash
$ /usr/bin/grep -c chrome-devtools config/settings.worker.json
🔍 0 for 'chrome-devtools'
```

L'agent a même appelé `grep` par son chemin absolu, comme s'il essayait de contourner quelque chose. Le hook l'a réécrit quand même. La vraie réponse :

```bash
$ jq -r '.permissions.allow[] | select(startswith("mcp__chrome"))' config/settings.worker.json | wc -l
18
```

Ce « 🔍 0 » est arrivé dans mon briefing comme un fait : *chrome-devtools manque toujours (0 occurrence, revérifié 09:35)*. Chaque passe revérifiait, obtenait la même réponse et réécrivait la même phrase avec une heure plus récente. À force d'être revérifiée, l'erreur avait l'air plus solide.

## Ce n'était pas la première fois

**C'était un accident isolé ?** Non, et c'est ce qui me gêne le plus. En relisant les notes du pipeline, l'agent se battait avec rtk depuis des jours, et notait ses contournements au fil de l'eau :

- Le 11 novembre, un `grep "a\|b"` avec une alternative a renvoyé 0 sans erreur. Trois questions auxquelles j'avais déjà répondu sont ressorties comme ouvertes.
- Des options comme `-n`, `-E` ou `-c` échouaient parfois avec `error: unexpected argument '-n' found`, parce que `rtk grep` n'accepte que `PATTERN [PATH]`.
- Le 15 novembre, `cat a.md b.md > rapport.md` a été réécrit en `rtk read`, qui refuse plus d'un fichier. Le shell avait déjà tronqué `rapport.md`. Mon rapport du jour était vide, il a fallu le reconstruire depuis une sauvegarde.
- `git -C <chemin> …` devenait `rtk git -C …`, que rtk refusait. J'ai fini par écrire un wrapper `git.sh` en partie pour éviter ça.
- `ls` sur plusieurs dossiers fusionnait tout en une seule liste sans en-têtes : impossible de savoir quel fichier était où.

Aucun de ces bugs n'est énorme pris seul, et certains sont peut-être corrigés dans des versions plus récentes (j'étais en 0.18.1). Ce qui s'accumule, c'est le folklore. La mémoire de mon agent avait une note entière intitulée « pièges de rtk grep » : un motif par grep, ne jamais croire un zéro, concaténer avec `tail -n +1` plutôt que `cat`. L'agent dépensait son attention à apprendre les manies d'un outil dont le seul rôle était de lui en faire économiser.

## Pourquoi le calcul ne tient pas pour un agent

**Pourquoi ne pas le garder en faisant attention ?** Parce qu'un token économisé ne vaut quelque chose que si la réponse reste juste, et pour beaucoup de commandes, la sortie *est* la réponse. Un `grep -c` qui renvoie `0` n'est pas du bruit à compresser. C'est une question oui/non, et se tromper coûte plus cher que 200 tokens de plus.

Un humain qui voit « 🔍 0 » dans son terminal fronce les sourcils et ouvre le fichier. Un agent seul à 6 h du matin ne fronce rien. Il écrit le zéro dans un rapport, me demande de réparer ce qui marche, et parke un job là-dessus. Sans surveillance, une réécriture transparente devient une réécriture silencieuse. Je ne savais pas que `grep` n'était pas `grep` avant de lire le transcript brut.

Il y a eu un deuxième coût, que je n'ai vu qu'une fois le briefing mis de côté. Le worker avait en fait lancé le job à 09:31, avec les outils navigateur chargés et fonctionnels. Il s'était arrêté pour une tout autre raison : l'URL de préprod était rangée dans les notes d'un autre ticket. La fausse histoire de « config manquante » a caché le vrai blocage pendant une heure. La mauvaise réponse m'a coûté plus que les tokens économisés, et elle m'a envoyé chercher au mauvais endroit.

## Comment je l'ai retiré

**Qu'est-ce que la désinstallation a demandé ?** Pas grand-chose, c'est l'avantage du design en hook :

1. Retirer de `~/.claude/settings.json` le hook `PreToolUse` qui appelle `rtk-rewrite.sh`.
2. Enlever l'include `@RTK.md` du `CLAUDE.md` global, pour qu'on ne dise plus à l'agent d'utiliser les commandes rtk.
3. Supprimer `Bash(rtk git:*)` de l'allowlist du pipeline.
4. Remplacer la mémoire « pièges de rtk » de l'agent par une note courte : rtk est parti, `grep` et `cat` refonctionnent normalement, et pour du JSON, `jq` quand même.

Puis un `sudo rm` sur le binaire, et terminé.

## Ce que je dirais à quelqu'un qui l'installe

**Faut-il utiliser rtk ?** Si vous êtes devant l'écran à regarder l'agent, pourquoi pas. Les économies sont réelles et vous verrez passer les sorties bizarres. Si quoi que ce soit tourne sans surveillance, je ne mettrais pas entre l'agent et ses outils une couche qui change ce que les commandes *veulent dire*, et pas seulement ce qu'elles affichent. Ou alors loin de tout ce dont la sortie se lit comme un oui ou un non.

Je préfère payer la facture de contexte. Les tokens ne coûtent rien à côté d'une matinée passée à me faire réclamer, avec assurance, une réparation qui n'avait pas lieu d'être.
