---
title: "Mon disque est tombé à zéro et a figé le laptop. Le setup SSH du téléphone m'a permis d'y revenir"
description: "Un disque plein a figé mon laptop Linux : souris morte, clavier mort, mes sites self-hostés en erreur 500. Le setup Tailscale + Termius de juillet m'a quand même laissé entrer en SSH, et j'ai libéré près de 90 Go depuis mon téléphone avant un reboot."
pubDate: 2026-11-13
tags: ["Tailscale", "SSH", "Termius", "Linux", "Docker"]
cover: ../_assets/disk-full-ssh-rescue.svg
ogImage: ../_assets/disk-full-ssh-rescue.png
coverAlt: "Un terminal affichant un disque de 468 Go plein à 100 % avec 158 Mo libres, à côté d'un téléphone avec une session SSH de nettoyage"
translationKey: "disk-full-ssh-rescue"
---

En juillet, j'ai écrit sur le fait de [piloter Claude Code depuis mon téléphone](/fr/blog/claude-code-from-my-phone/) via Tailscale et Termius. Je le présentais comme un confort : reprendre une session depuis le canapé, checker un container depuis le train. Ce matin, c'était le seul moyen d'entrer dans mon propre ordinateur.

## Moins de 1 Mo libre

**Qu'est-ce qui s'est passé ?** Je me lève, je passe devant mon bureau avant d'aller à la salle, et l'écran est couvert d'alertes. Claude, Brave, d'autres encore, qui disent tous la même chose : moins de 1 Mo d'espace disque libre, fais du ménage si tu veux continuer à utiliser tes applis.

OK, de bonne guerre. J'attrape la souris, le curseur ne bouge pas. Le clavier, rien non plus. Le laptop est figé.

Cette machine héberge aussi des choses. Le blog que tu lis tourne dessus, [Forgemage.net](https://forgemage.net) aussi, les deux sortent par un Cloudflare Tunnel. Je les ouvre sur mon téléphone : erreur 500 sur les deux. Une appli qui ne peut plus écrire son cache ne sert plus de pages.

Puis l'écran passe sur le logo de boot, comme si le laptop essayait de relancer la session. Et il reste là. Pas d'écran de login, pas de bureau, aucun moyen d'entrer par le clavier.

## La porte était encore ouverte

**Est-ce que la machine répondait encore ?** Je repense au setup de juillet. Termius sur le téléphone, je tape sur l'hôte, j'attends. Ça se connecte. Un prompt, sur un laptop dont le clavier ne répond plus.

Je crois savoir pourquoi, même si je n'ai pas creusé. Une session de bureau écrit en permanence (caches, logs, son propre état), et avec un disque plein elle ne pouvait plus. Un login SSH via Tailscale n'écrit presque rien. `tailscaled` tournait toujours, il a répondu, et bash a démarré.

La première commande a confirmé le reste :

```
$ df -h /
Sys. de fichiers Taille Utilisé Dispo Uti% Monté sur
/dev/nvme0n1p2     468G    444G  158M 100% /
```

158 Mo restants sur un disque de 468 Go.

## Faire le ménage depuis un clavier de téléphone

**Où était passée la place ?** Un `du` sur mon home, trié par taille, puis j'ai attaqué ce qu'on peut supprimer sans se poser de questions :

- le build cache Docker : 24,5 Go
- la corbeille : 6,1 Go
- `~/.cache` (JetBrains, Brave, Yarn, Composer et compagnie) : environ 9 Go
- les volumes Docker anonymes : 0,4 Go

Rien qu'avec ça, le disque est remonté à 44 Go libres.

L'essentiel de ce qui restait dans les volumes Docker inutilisés, c'était des bases de données, et supprimer un volume de base veut dire réimporter un dump la prochaine fois que j'ouvre le projet. J'ai donc passé la liste en revue une par une et n'en ai supprimé que sept, tous de projets sur lesquels je ne bosse plus. 9,5 Go de plus.

Ensuite, deuxième round : le cache Codeium, tous les worktrees git dont le ticket était déjà mergé, les logs d'agents de plus d'une semaine, les archives de Téléchargements déjà extraites, et la corbeille une nouvelle fois.

Les worktrees ont demandé le plus d'attention. J'en garde un par ticket, et un seul projet client en avait 38. `git fetch` échouait, parce que ma clé SSH n'est pas chargée dans une session ouverte depuis le téléphone, donc j'ai vérifié le statut de chaque ticket dans Jira et n'ai supprimé que ceux qui étaient terminés, mergés ou déployés. Avant de supprimer quoi que ce soit, j'ai sauvegardé chaque diff non commité dans un tarball de 2,3 Mo, au cas où. Ça faisait 35 worktrees, environ 13 Go.

Pour les archives, j'ai comparé le nombre de fichiers de chaque zip avec le dossier extrait à côté. Un dossier avait 10 579 fichiers sur 23 108. Ce zip-là est resté.

Les logs d'agents sont passés de 3,1 Go à 789 Mo. Codeium occupait 7,6 Go que j'avais complètement oubliés. Et le journal système pesait à lui seul environ 4 Go :

```bash
sudo journalctl --vacuum-size=200M
sudo apt clean
```

## Rebooter depuis le téléphone

**Le reboot a marché ?** Une fois le disque soulagé, j'ai tapé `sudo reboot` et j'ai regardé la session SSH sauter. Puis j'ai attendu, téléphone en main, sans trop savoir sur quoi j'allais tomber.

À 8 h 45, le laptop affichait l'écran de login, avec un clavier et une souris qui répondaient. Le blog et Forgemage.net sont revenus avec leurs containers. `df` affiche maintenant 89 Go libres, contre 158 Mo.

## Deuxième fois en dix jours

**Pourquoi le disque s'est rempli ?** Ce n'était pas la première alerte. Le 4 novembre, j'avais déjà fait du ménage parce que le disque était plein. Neuf jours plus tard, il était de nouveau plein, et cette fois assez pour faire tomber le bureau.

Donc ce n'est pas de la malchance. Des builds Docker toute la journée, un pipeline d'agents qui écrit des logs non-stop et un nouveau worktree par ticket remplissent 468 Go plus vite que je l'aurais cru. Les correctifs sont ennuyeux, et j'aurais dû les mettre en place en juillet. Plafonner le journal, c'est une commande :

```bash
sudo sed -i 's/^#\?SystemMaxUse=.*/SystemMaxUse=200M/' /etc/systemd/journald.conf
sudo systemctl restart systemd-journald
```

Le reste : un `docker builder prune` hebdo, un cron qui supprime les vieux logs d'agents, supprimer le worktree dès que sa merge request est mergée, et une alerte sur mon téléphone bien avant 100 %, quand les applis tournent encore.

## Ce que j'en retiens

**Le setup téléphone valait le coup ?** Je l'avais monté pour le confort. Aujourd'hui, c'était le chemin de secours. Le bureau était parti et le clavier ne répondait plus, mais le démon SSH continuait de répondre parce qu'il n'a besoin de presque rien pour tourner. Je n'avais pas prévu ça.

Une demi-heure de ménage sur un clavier de téléphone, ce n'est pas une partie de plaisir. Ça reste mieux que démonter le laptop pour sortir le SSD, ou réinstaller depuis une clé USB avant mon premier café.

Maintenant je vais à la salle. En retard.
