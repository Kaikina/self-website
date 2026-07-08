---
title: "Claude Code depuis mon téléphone : Tailscale, Termius, et toute la machine dans la poche"
description: "Le /remote-control de Claude Code mirror une session sur ton téléphone. SSH via Tailscale te donne toute la workstation : reprendre des sessions, en lancer de nouvelles dans n'importe quel repo, suivre les logs, redémarrer des containers — sans rien exposer sur internet."
pubDate: 2026-07-06
tags: ["Claude Code", "Tailscale", "SSH", "Android", "Workflow"]
cover: ../_assets/claude-code-from-my-phone.svg
ogImage: ../_assets/claude-code-from-my-phone.png
coverAlt: "Un téléphone affichant une session terminal connectée à une workstation Linux via un mesh Tailscale, avec un prompt SSH et une session Claude Code reprise"
translationKey: "claude-code-from-my-phone"
---

Claude Code a changé la forme de mes sessions de travail. Avant, je restais assis pendant les tâches ; maintenant, je les lance. Un refactoring, un lot de traductions, un script de migration — je décris le boulot, l'agent se met à mouliner, et il faut être honnête : ma présence au clavier cesse de compter pendant des minutes entières. C'est précisément le moment où je me lève. Et me voilà dans la cuisine à me demander s'il s'est arrêté pour me poser une question de permission il y a quatre minutes.

La réponse d'Anthropic à ça s'appelle `/remote-control`, et elle est bonne. Mais elle butait toujours sur le même mur chez moi, et la solution a fini par tenir en deux apps, un flag et une session tmux — pas de service cloud, pas de port exposé, rien de malin. Toute ma workstation tient maintenant dans ma poche, et ce post est le how-to que j'aurais aimé lire avant de l'assembler moi-même.

## Ce que `/remote-control` te donne, et où ça s'arrête

D'abord le crédit qui est dû, parce que la feature intégrée est réellement utile. Tu tapes `/remote-control` (ou `/rc`) dans une session Claude Code en cours, tu scannes un QR code, et cette session se mirror dans l'app Claude sur ton téléphone. La machine à la maison continue de bosser — rien ne part dans le cloud — et tu pilotes la conversation d'où tu veux. Tu reçois même des notifications push quand l'agent termine ou a besoin d'une réponse. Pour le problème « est-ce qu'il s'est arrêté pour me demander un truc », c'est le bon outil et je l'utilise encore.

Mais ça mirror *une session*. Une conversation, dans un repo, que tu as lancée avant de quitter ton bureau. Depuis le téléphone, tu ne peux pas `cd` dans un autre projet. Tu ne peux pas regarder pourquoi un container Docker bouffe du CPU. Tu ne peux pas ouvrir une deuxième session Claude sur une autre codebase parce qu'une idée t'est venue dans le train. La feature répond à « laisse-moi piloter ce qui tourne déjà » et rien d'autre — ce qui est fair, c'est son job. Mon problème, c'est qu'une fois capable d'atteindre ma machine depuis le canapé, je voulais sans arrêt le reste de la machine.

## Le setup : deux apps et un flag

Les pièces : [Tailscale](https://tailscale.com) sur la workstation et le téléphone, et [Termius](https://termius.com) comme client SSH sur Android. Tailscale construit un mesh WireGuard privé entre tes appareils — ton laptop et ton téléphone se retrouvent sur un petit réseau virtuel (un « tailnet ») qui les suit partout, Wi-Fi, 4G, peu importe. Pas de port forwarding, pas de DNS dynamique, pas de VPS relais à maintenir.

Ce qui m'a surpris, c'est le peu de setup côté serveur, grâce à une feature qui s'appelle Tailscale SSH. Voilà l'état de ma workstation, une Dell Precision 3570 sous Linux :

```bash
$ which sshd
# rien
$ ss -tlnp | grep :22
# rien
```

Il n'y a pas de serveur OpenSSH installé. Rien n'écoute sur le port 22. Et pourtant je me connecte en SSH à cette machine depuis mon téléphone tous les jours. Tailscale SSH, ça veut dire que `tailscaled` lui-même répond aux connexions SSH qui arrivent par l'interface du tailnet — le daemon termine la connexion, vérifie qui tu es via ton identité tailnet, et te tend un shell. Côté LAN, côté internet, sur n'importe quelle interface qui n'est pas le tailnet, il n'y a tout simplement pas de SSH à qui parler.

Ça tue aussi la corvée de gestion des clés. L'authentification, c'est « cet appareil est loggé sur le même tailnet que toi » — pas d'`authorized_keys`, pas de mot de passe, rien à faire tourner quand tu changes de téléphone à part le connecter.

## Côté workstation : une commande

Installe Tailscale (leur script, ou le paquet de ta distro) :

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Puis lance-le avec SSH activé :

```bash
sudo tailscale up --ssh
```

C'est tout le serveur. `tailscale status` doit maintenant afficher ta machine, et une fois le téléphone connecté, les deux :

```
100.71.141.2   tom-precision-3570  tom@  linux    -
100.112.88.16  s23-ultra-de-tom    tom@  android  active
```

Qui peut SSH vers quoi, c'est la politique ACL du tailnet qui le décide, dans la console d'admin. La valeur par défaut mérite d'être lue plutôt que crue sur parole :

```json
"ssh": [
  {
    "action": "check",
    "src":    ["autogroup:member"],
    "dst":    ["autogroup:self"],
    "users":  ["autogroup:nonroot", "root"]
  }
]
```

`autogroup:self` signifie qu'un appareil ne peut SSH que vers les machines du même utilisateur — sur un tailnet perso c'est toi, mais ça compte le jour où tu partages le tailnet. Et `"action": "check"` ajoute une étape que j'ai décidé de garder : périodiquement, une nouvelle connexion SSH t'oblige à te ré-authentifier dans un navigateur avant d'ouvrir le shell. Légèrement pénible sur un téléphone. C'est aussi la différence entre « on m'a volé mon téléphone déverrouillé » et « on m'a volé mon téléphone déverrouillé et obtenu un shell root sur ma workstation ».

## Côté téléphone : Termius et quatre touches spéciales

Installe l'app Tailscale sur le téléphone, connecte-toi au même tailnet, terminé — le téléphone est maintenant un pair du mesh. N'importe quel client SSH fait l'affaire à partir de là, mais j'ai fini sur Termius pour une raison précise : sa barre de touches supplémentaires au-dessus du clavier.

Claude Code est une UI de terminal, et les UI de terminal supposent des touches que les claviers tactiles ont oubliées. `Esc` interrompt l'agent en plein tour. `Shift+Tab` fait tourner les modes de permission. `Ctrl+C`, les flèches pour l'historique. Termius met Esc, Ctrl, Tab et les flèches à un tap, et c'est la différence entre réellement piloter Claude Code et juste le regarder scroller.

L'entrée d'hôte n'a rien de spécial : adresse `tom-precision-3570` (le MagicDNS de Tailscale résout les noms de machines, donc pas d'IP à retenir), port 22, mon username. Termius insiste pour avoir une méthode d'auth, donc donne-lui n'importe quelle clé — avec Tailscale SSH, la vraie authentification a déjà eu lieu au niveau réseau, et le prompt navigateur du mode check couvre le reste. Active le verrouillage biométrique de Termius pendant que tu es dans les réglages. Ton téléphone est désormais une clé de ta workstation ; traite-le comme telle.

## tmux, pour qu'une coupure de connexion soit un non-événement

Une connexion SSH mobile va couper. L'ascenseur, le tunnel du train, Android qui décide que Termius a eu assez de temps en arrière-plan. Et un shell SSH nu meurt avec sa connexion — le process distant se fait raccrocher au nez, et si Claude était en pleine tâche, le tour en cours meurt avec. `claude --resume` récupérerait la conversation, mais pas le travail que l'agent était en train de faire quand la ligne a coupé.

tmux supprime le problème au lieu de l'adoucir. Sur la workstation, tout tourne dans un multiplexeur qui se fiche de savoir si quelqu'un regarde :

```bash
tmux new -A -s phone
```

`-A` veut dire attach-or-create : la première connexion crée la session, toutes les suivantes y rentrent à nouveau. Le réseau coupe dans le tunnel, Termius se reconnecte trente secondes plus tard, `tmux new -A -s phone` à nouveau — et Claude est toujours là, trois tool calls plus loin, sans avoir rien remarqué. C'est aussi la même session que tu peux reprendre demain depuis le bureau avec `tmux attach -t phone`.

Deux lignes de `~/.tmux.conf` rendent le tout confortable sur un écran tactile :

```
set -g mouse on
set -g history-limit 50000
```

Le mode souris met le scrollback de tmux au tactile — tu balaies pour parcourir ce que l'agent a fait pendant que tu étais hors ligne — et Termius peut lancer la ligne `tmux new` à ta place en snippet de démarrage, pour que le rattachement devienne une propriété de la connexion plutôt qu'une habitude à retenir.

## Ce qu'un vrai shell débloque

L'échelle, à peu près dans l'ordre où je la grimpe un soir donné :

**Reprendre la session du bureau.** Un `cd` dans le projet et `claude --resume` rouvre la conversation que j'ai laissée, exactement où elle en était. Rien que ça remplace `/remote-control` pour moi la plupart des jours.

**Lancer des sessions n'importe où.** Une idée dans le train → `cd ~/projects/whatever && claude`, session toute neuve dans un autre repo. Les sessions lancées depuis le téléphone sont des sessions normales ; demain au bureau, `--resume` les remonte sur le grand écran.

**Des questions one-shot sans la TUI.** `claude -p "qu'est-ce que le test qui échoue dans payments vérifie exactement ?"` imprime une réponse et sort. Sur un écran de téléphone, parfois c'est tout ce que tu voulais.

**La machine elle-même.** `docker compose logs -f` sur les containers qui servent ce site, un `git pull` sur un repo, un build lancé, l'espace disque vérifié. Tout ce que tu ferais au bureau, moins le bureau.

**Et le bonus que je n'avais pas vu venir :** le téléphone n'est pas qu'un client SSH, c'est un pair du réseau. Lance `npm run dev -- --host` sur la workstation et le serveur de dev est accessible depuis le *navigateur* du téléphone à `http://tom-precision-3570:4321`. Pas de tunnel, pas de port forwarding. J'ai déjà relu un changement de layout sur le téléphone lui-même, dit à Claude de l'ajuster, et regardé le hot reload mettre à jour la page dans ma main.

## Les limites, honnêtement

Deux, dans l'esprit de ne pas écrire une brochure.

**La workstation doit être réveillée.** C'est un laptop. Capot fermé, il se met en veille, et une machine en veille n'est pas un pair du tailnet. La mienne vit surtout sur son dock avec la veille désactivée, mais si la tienne dort, c'est un réglage à changer avant de quitter la maison, pas après.

**Taper sur du verre.** Piloter un agent depuis un téléphone est confortable, parce que c'est l'agent qui tape. *Éditer* pour de vrai en SSH sur téléphone, c'est de l'auto-punition. Ce setup brille précisément parce que Claude Code inverse le ratio — tu envoies des instructions courtes, la machine renvoie des murs de travail.

## La sécurité, en un paragraphe

Rien dans ce setup n'est joignable depuis internet. Pas de port ouvert, pas d'endpoint public, même pas de daemon SSH — la surface d'attaque, c'est « être un appareil de mon tailnet », soit exactement la liste que je contrôle depuis la console d'admin et que je peux élaguer en un clic. Le risque réaliste s'est déplacé vers le téléphone lui-même, et c'est pour ça que la ré-auth du mode check et le verrouillage de Termius restent activés malgré la friction. Compare ça à la réponse classique — port 22 exposé, fail2ban, et l'espoir — et ce n'est pas juste plus pratique. C'est moins exposé que ce que ça remplace.

## À retenir

1. **`/remote-control` et SSH ne sont pas concurrents — ce sont des barreaux.** Mirror une session quand ça suffit ; garde le shell complet pour quand ça ne suffit pas. J'utilise les deux dans la même soirée.
2. **Tailscale SSH, ça veut dire qu'il n'y a pas de serveur à durcir.** Pas de sshd, pas de port ouvert, pas de clés. Le serveur SSH, c'est le daemon du mesh, et seul le mesh le voit.
3. **Un téléphone sur ton tailnet est un pair réseau complet, pas juste un terminal.** Serveurs de dev, dashboards, tout ce qui est bindé en `--host` est à une URL du navigateur du téléphone.
4. **tmux rend le lien mobile ennuyeux.** `tmux new -A -s phone` au début de chaque connexion, et une coupure de réseau ne change rien — l'agent continue de bosser, tu te rattaches.

Le tout a pris moins d'une demi-heure, dont l'essentiel à bidouiller les tailles de police de Termius. Et le changement est le même que Claude Code a déjà opéré au bureau, prolongé vers l'extérieur : la machine travaille, tu diriges. Il se trouve que diriger tient très bien sur un écran de téléphone.
