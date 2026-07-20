---
title: "Permettre à des chefs de projet non-techniques d'interroger la codebase en langage naturel"
description: "Pourquoi j'ai construit un analyste IA en lecture seule qui laisse les chefs de projet poser des questions sur une codebase et repartir avec un ticket Jira créé automatiquement — et pourquoi tout ne tient que parce que l'IA peut lire mais jamais écrire."
pubDate: 2026-06-29
tags: ["Claude", "Agent SDK", "Developer Tools", "Jira", "PrestaShop"]
cover: ../_assets/ai-codebase-portal-for-pms.svg
ogImage: ../_assets/ai-codebase-portal-for-pms.png
coverAlt: "Une question en langage naturel passe dans un analyste de codebase en lecture seule et ressort en ticket Jira créé automatiquement"
translationKey: "ai-codebase-portal-for-pms"
---

Il y a une interruption que tous les devs d'une agence web connaissent par cœur. Un chef de projet débarque à ton bureau avec un mail client. « Le client dit que le checkout est cassé sur sa boutique. C'est un vrai bug ? C'est où ? C'est un gros chantier ? » Et tu arrêtes ce que tu fais, tu échanges tout ton contexte mental contre le sien, tu pars fouiller une codebase que tu n'as peut-être pas touchée depuis trois mois, et tu reviens vingt minutes plus tard avec une réponse.

La réponse était utile. Les vingt minutes coûtaient cher, et elles coûtaient cher à tout le monde : le PM a attendu, toi tu as perdu le fil, et la prochaine fois le cycle recommence.

Voici l'histoire d'un outil interne que j'ai construit pour supprimer cette interruption — un portail où un chef de projet non-technique peut poser une question sur la codebase PrestaShop d'un client en langage naturel, obtenir une réponse ancrée dans le code réel, et la transformer en ticket Jira bien formé sans jamais déranger un développeur. L'intérêt n'est pas dans la zone de chat. Il est dans la contrainte unique autour de laquelle tout le design est construit : **l'IA peut tout lire et n'écrire absolument rien.**

## Le problème : les développeurs sont le seul pont vers le code

**Pourquoi la codebase est-elle verrouillée derrière les devs ?** Dans une agence qui développe des modules custom, la codebase est la source de vérité pour une quantité énorme de questions quotidiennes. Ce comportement est-il un bug ou un choix de config ? Quels fichiers un correctif toucherait-il ? Ce que décrit le client est-il seulement possible vu comment le code est structuré ? Est-ce que ça a toujours marché comme ça ? Chacune de ces questions a déjà une réponse qui dort dans le repo — mais lire du code couramment est une compétence de développeur, et les chefs de projet qui gèrent les mails client et rédigent les tickets ne savent généralement pas le faire. La codebase reste donc derrière une vitre, et le seul passage c'est d'attraper un dev. Voilà le vrai goulot d'étranglement : pas un outil manquant, mais un traducteur manquant entre ceux qui portent les questions du client et le code qui y répond.

Et ce goulot coûte plus cher que l'interruption elle-même. Les tickets sont rédigés à partir d'un résumé verbal flou plutôt qu'à partir du code, donc ils arrivent maigres : pas de chemins de fichiers, aucune vraie idée du périmètre. Puis le dev qui reprend le ticket des semaines plus tard recommence l'investigation de zéro — la même investigation qu'un collègue a déjà faite debout à côté d'un bureau, perdue parce que personne ne l'a écrite.

## Ce que je voulais vraiment

**Qu'est-ce que je voulais vraiment qu'il fasse ?** L'objectif était volontairement étroit : laisser un PM poser une question avec ses propres mots et recevoir deux choses. La première, une **réponse en langage naturel ancrée dans le code réel** — pas une supposition assurée, ni un générique « voici comment PrestaShop fonctionne d'habitude », mais une réponse qui pointe vers de vrais fichiers et de vraies lignes dans le repo de *ce* client-là, et qui le dit quand le code ne permet pas vraiment de conclure. La seconde, **cette même réponse créée comme un vrai ticket Jira**, directement dans le projet Jira plutôt que recopiée à la main : comportement observé, cause suspectée, fichiers concernés, ce qu'il faudrait changer. Le chef de projet valide, l'outil se charge de la création, et l'investigation survit sous forme de vrai ticket au lieu de s'évaporer dès la fin de la conversation.

Obtiens ces deux choses de façon fiable et l'interruption du dev disparaît en grande partie, tandis que les tickets qui atterrissent dans l'équipe arrivent avec une longueur d'avance au lieu de partir de zéro.

## L'idée centrale : un analyste en lecture seule, pas un assistant

**Pourquoi ne donner à l'IA aucun pouvoir d'écriture ?** La tentation, avec tout ce qui est agentique, c'est de le rendre puissant — le laisser ouvrir des pull requests, lancer des commandes, corriger les choses. Je suis allé fort dans la direction inverse, et cette décision est le socle sur lequel repose tout le reste. L'outil peut **lire** la codebase et rien d'autre : il ouvre des fichiers, fait des recherches dedans, vérifie des choses, et c'est toute la liste des verbes dont il dispose. Il ne peut pas éditer un fichier, lancer une commande shell, ni rien modifier nulle part. Son outillage est une allowlist explicite et courte, et tout ce qui en sort est refusé à la frontière plutôt que découragé dans un prompt — ce qui est une garantie bien différente de demander gentiment à un modèle de ne toucher à rien.

Cette impuissance, c'est tout l'intérêt. Je peux confier cet outil à un collègue non-technique sans perdre le sommeil, parce que **la pire chose qu'il puisse faire, c'est de se tromper** — et une mauvaise réponse est attrapée à la seconde où un dev lit le ticket. Il n'existe aucun chemin entre « l'IA a mal compris un truc » et « le repo est dans un sale état », puisque le repo n'a jamais été accessible en écriture au départ. La puissance aurait signifié une longue liste de modes de défaillance à défendre. L'impuissance, elle, m'a permis de le livrer.

Les lecteurs réguliers reconnaîtront l'instinct. Dans un [article précédent sur l'ajout d'une review IA à un GitLab self-hosted](/fr/blog/claude-gitlab-ai-review/), la règle porteuse était *ne jamais laisser un modèle lire une entrée non fiable et détenir un credential privilégié en même temps.* Ici, c'est le même principe pris dans l'autre sens : donne à l'IA le moins de pouvoir qui lui permette encore de faire son travail, et la plupart des scénarios qui font peur cessent d'être possibles au lieu d'être simplement atténués.

## Comment ça marche, sans la plomberie

**Comment gagne-t-il la confiance d'un PM ?** Quelques choix de design transforment « une IA qui peut lire du code » en quelque chose sur quoi un PM peut réellement s'appuyer, et chacun d'eux tient à la confiance plutôt qu'à la puissance brute. D'abord, il travaille sur une copie fraîche et fidèle du code : chaque conversation analyse un checkout isolé du repo du client, tenu à jour en arrière-plan pour que la réponse reflète ce qui est réellement dans le projet plutôt qu'un snapshot datant de la dernière fois où quelqu'un a regardé, et les conversations différentes ne se marchent jamais dessus. Quand l'outil dit « la ligne 240 fait X », il parle du vrai code, actuel. L'ancrage est toute la proposition de valeur, donc la copie qu'il lit doit être fiable. Par-dessus ça, il est forcé de citer et interdit de spéculer — il ancre chaque affirmation dans des fichiers qu'il a réellement lus, ne cite que quelques lignes plutôt que de balancer du code à quelqu'un qui ne sait pas le lire, et, le plus dur, dit « le code ne permet pas de conclure » au lieu d'en inventer une plausible. Pour les faits externes comme une version de PrestaShop, le comportement d'une librairie ou une CVE, il va les chercher plutôt que de se fier à sa propre mémoire.

L'autre moitié du design, c'est où va la réponse. Elle est écrite pour le lecteur, pas pour l'ingénieur : le public est un chef de projet non-technique, donc la sortie n'est pas une visite guidée du code mais le business impact en langage clair, avec le détail technique disponible et hors du chemin. « Ça affecte tous les clients qui utilisent un code promo au checkout » fait mouche ; « il y a un off-by-one dans la boucle des cart rules » non. Comme cette réponse est déjà structurée comme un ticket — comportement observé, cause suspectée, fichiers concernés, changement proposé — le chef de projet n'a qu'à valider et l'outil crée l'issue directement dans Jira via l'intégration Rovo (MCP) d'Atlassian, champs déjà remplis, sans ressaisie dans un formulaire. Et tout est loggé : chaque question, chaque fichier que l'IA a consulté, chaque ticket qu'elle a rédigé. En partie par hygiène, pour tout ce qui touche au code client ; en partie pour que je puisse voir comment l'outil est utilisé et où ses réponses dérapent.

## La partie plus dure que prévu

**Qu'est-ce qui était plus dur que la plomberie ?** La plomberie — lire le code, garder les copies fraîches, parler à Jira — c'était la moitié facile. La moitié difficile, c'était d'apprendre à l'analyste à *ne pas savoir* des choses. Le mode de défaillance par défaut d'un modèle capable, ce n'est pas de rester muet ; c'est de répondre avec assurance quand même. Demande-lui où est un bug et il va volontiers raisonner jusqu'à un emplacement qui sonne plausible, que le code le dise ou non. Pour un outil dont toute la raison d'être est l'*ancrage*, c'est le seul comportement qui l'empoisonnerait : un PM ne sait pas distinguer une vraie réponse adossée au code d'une hallucination assurée — c'est précisément pour ça qu'il utilise l'outil — donc une réponse qui *sonne* ancrée sans l'être est pire que pas de réponse du tout.

L'essentiel des itérations est passé à ramener l'analyste vers « j'ai vérifié, et le code ne montre pas ça » et à l'éloigner de « voici une théorie bien propre ». Bien calibrer ça comptait infiniment plus que toute l'ingénierie autour. Un outil comme celui-là gagne la confiance lentement et la perd d'un coup : la première fois qu'un PM agit sur une réponse assurée qui s'avère inventée, il arrête de croire les dix suivantes qui étaient justes.

## Ce que ça a changé

**Est-ce que ça a vraiment changé quelque chose ?** Les interruptions ont chuté. Un PM qui serait allé voir un dev demande maintenant d'abord au portail, et la plupart du temps c'est réglé. Quand ça ne l'est pas — quand la question est vraiment subtile, ou que la réponse demande un jugement humain — le dev qu'on sollicite part d'une vraie réponse avec de vraies références de fichiers, pas d'un « tu peux jeter un œil » à froid. Et les tickets se sont améliorés au passage : ils arrivent mis en forme par le code réel, avec une cause suspectée, les fichiers en jeu, une idée du périmètre. L'investigation qui se faisait à l'oral puis disparaissait est désormais écrite une fois et portée jusque dans le travail.

Ça reste volontairement modeste — un outil interne, en localhost uniquement, cadré pour que le pire cas reste petit le temps qu'il gagne sa confiance. Cette contrainte est une feature elle aussi. Je préfère livrer quelque chose d'étroit sur lequel les gens s'appuient que quelque chose de tentaculaire qu'ils ont peur de toucher.

## À retenir

**Qu'est-ce qu'il faut en retenir ?**

1. **L'outil IA le plus utile est souvent le moins puissant.** Le read-only, c'est ce qui a rendu la chose sûre à confier à des non-développeurs. Réduis les verbes au strict nécessaire et la plupart des modes de défaillance disparaissent par construction.
2. **L'ancrage, c'est le produit.** Pour un analyste destiné à des gens qui ne peuvent pas vérifier son travail, « cite le fichier ou dis que tu ne sais pas », c'est toute la valeur, pas un détail. Calibrer *ça* a été plus dur que toute l'ingénierie.
3. **Ne remplace pas le développeur ; supprime l'interruption.** L'objectif n'a jamais été d'automatiser le jugement. C'était de répondre directement aux questions faciles et de passer les vraiment difficiles à un développeur qui démarre maintenant à chaud plutôt qu'à froid.
4. **Conçois pour le lecteur qui ne sait pas lire le code.** Traduis en business impact, structure la sortie pour l'endroit où elle va vivre, et l'outil cesse d'être un jouet pour ingénieurs pour devenir quelque chose dont toute l'équipe se sert.

On imagine que le truc malin, c'est le modèle qui lit une codebase et l'explique à quelqu'un qui ne sait pas la lire. Peut-être. La partie qui compte vraiment pour moi est plus ennuyeuse que ça : il lit, et il n'écrit jamais. C'est toute l'histoire de la sécurité, et c'est pour ça que je dors tranquille en le laissant tourner sur du code client.
