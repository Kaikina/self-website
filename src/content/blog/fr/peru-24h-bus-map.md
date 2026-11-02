---
title: "Au Pérou, les bus ne dorment jamais : 24 heures de trafic interurbain sur une carte"
description: "J'ai cartographié tous les bus et trains interurbains que j'ai pu trouver pour un mercredi au Pérou : 1 659 départs de bus et 37 trains. L'heure la plus chargée est 23 h, deux trajets sur trois passent par Lima, et les Andes comme l'Amazonie reçoivent moins que leur part."
pubDate: 2026-11-02
tags: ["Data Visualization", "Open Data", "Python", "Peru", "Side Project"]
cover: ../_assets/peru-24h-bus-map.png
ogImage: ../_assets/peru-24h-bus-map.png
coverAlt: "Carte sombre du centre et du sud du Pérou à 23 h, avec 1 035 points orange pour les bus le long de la côte et dans les Andes"
translationKey: "peru-24h-bus-map"
draft: false
---

Une vidéo a pas mal tourné sur LinkedIn récemment : tous les trains de France sur 24 heures, animés sur une carte. J'ai voulu la même chose pour le Pérou.

Sauf que le Pérou n'a pratiquement pas de trains de voyageurs entre ses villes. Il a des bus. Des milliers, exploités par des centaines de compagnies, et aucun horaire public qui les couvre tous. La carte ci-dessous a donc demandé plus de fouille que de design.

<figure class="embed">
  <iframe src="/embeds/peru-24h/index.html?embed&amp;lang=fr" title="Carte animée d'une journée de bus et de trains interurbains au Pérou" loading="lazy" allow="fullscreen"></iframe>
  <figcaption>Un mercredi, le 11 novembre 2026. Glisse pour déplacer, Ctrl + molette (ou deux doigts) pour zoomer, survole un point pour voir son trajet. Le bouton ⛶ passe en plein écran.</figcaption>
</figure>

## Ce que montre la carte

**Qu'est-ce qu'on regarde ?** Chaque point orange est un bus, chaque point bleu un train. Ils suivent les vraies routes et les vraies voies, aux horaires publiés par les compagnies. L'horloge tourne de minuit à minuit, et les bus qui partent le soir pour arriver le lendemain matin apparaissent aux deux bouts de la journée : la boucle se lit comme une journée type, pas comme un démarrage à froid à 00 h 00.

Il y a 1 659 départs de bus et 37 trains. Je reviens sur la provenance des données à la fin. D'abord, ce qui m'a surpris.

## Le pays roule de nuit

**Est-ce que le trafic s'arrête un jour ?** Non. Je m'attendais à ce que la carte se calme après minuit, comme la plupart des cartes de transport des pays européens. C'est l'inverse. Le creux est à 13 h (412 bus sur la route). Le pic est à 23 h (1 035).

C'est le soir que le Pérou part. 46 % des départs ont lieu entre 18 h et minuit, et la seule tranche de 20 h en compte 178. Six trajets sur dix roulent encore quand l'horloge passe minuit.

Ça s'explique dès qu'on regarde les distances. Le trajet médian fait 422 km et dure 8,6 heures. Lima–Arequipa, c'est 1 002 km et environ 17 h 30. En partant à 20 h, tu dors dans ton siège, tu économises une nuit d'hôtel et tu arrives avec toute la journée devant toi. Je le savais en théorie. Voir un millier de points se réveiller à la tombée de la nuit, c'est autre chose.

## Une longue ligne le long de la côte

**Où va réellement le trafic ?** Surtout sur la Panaméricaine. De Tumbes, à la frontière équatorienne, jusqu'à Camaná, la côte est un chapelet continu de bus, qui ne bifurque vers l'intérieur qu'en direction d'Arequipa et de Tacna. 87 % des trajets touchent une ville côtière, et la moitié ne quittent jamais la côte.

Et puis il y a Lima. 63 % des trajets partent ou arrivent là, et la capitale a des bus directs vers 115 destinations. Lima–Trujillo, à lui seul, compte 115 départs un mercredi. La nuit, en plissant les yeux sur l'animation, ça saute aux yeux : la côte est un tapis roulant avec Lima au milieu.

## Le sud : loin, mais pas oublié

**Tacna et Puno sont-elles aussi isolées qu'elles en ont l'air ?** À moitié seulement. Ma première impression, c'était que le sud était mal desservi : Tacna et Puno ressemblent à des îles en bas de la carte. Les chiffres disent quelque chose de plus précis.

Rapporté au nombre d'habitants, elles ont à peu près autant de bus que les grandes villes de la côte nord. Tacna a 77 trajets par jour pour environ 286 000 habitants, à peu près le même ratio que Trujillo. Puno, plus petite, en a 68. Ce qui leur manque, c'est le lien avec Lima. Seulement 10 bus par jour vont de Lima à Tacna, en 21 heures pour 1 224 km. Lima–Puno, c'est 4 bus et plus de 23 heures.

À la place, le sud fait tourner son propre réseau. Les liaisons les plus fréquentes de Tacna vont vers Arequipa (26 trajets) et Ilo (20). Celles de Puno vers Cusco (33) et Arequipa (25). Seuls 13 % des trajets de Tacna et 6 % de ceux de Puno concernent Lima. Elles ont l'air isolées sur la carte parce que leurs bus s'étalent sur un millier de kilomètres de route, pas parce que personne n'y va.

## Les Andes et l'Amazonie reçoivent moins que leur part

**La sierra est-elle vraiment coupée du reste ?** Compare deux trajets de même longueur. Lima–Trujillo, 557 km le long de la côte : 115 bus. Lima–Ayacucho, 568 km dans la montagne : 24.

Pour aller plus loin, j'ai classé chaque ville par région naturelle : sierra au-dessus de 2 000 m, puis côte ou jungle selon le versant des Andes (Arequipa, à 2 300 m, compte comme sierra). Le recensement de 2017 place 58 % des Péruviens sur la côte, 28 % dans la sierra et 14 % dans la selva. Les extrémités de trajets de mes données se répartissent en 69 %, 24 % et 7 %.

La sierra est un peu en dessous de son poids. La jungle en reçoit la moitié. Et les villes de montagne sont surtout suspendues à la capitale plutôt que reliées entre elles : 73 % des trajets d'Ayacucho vont vers Lima ou en viennent, 70 % pour Huaraz, 65 % pour Huancayo. Il y a 437 trajets côte–sierra dans les données, et seulement 156 qui relient deux villes andines.

La selva, c'est pire. Pucallpa, l'une des plus grandes villes d'Amazonie, a 10 bus par jour, dont 9 vers Lima, et ils mettent 17 heures pour 768 km. Soit 45 km/h de moyenne. Iquitos n'apparaît même pas sur la carte : aucune route n'y mène. On y va en avion, ou en passant des jours sur un bateau fluvial, et j'ai volontairement laissé de côté avions et bateaux.

Donc ma première impression tient pour la montagne et la jungle, avec une réserve qui mérite sa propre section.

## Ce que la carte ne voit pas

**Jusqu'où faire confiance à ces chiffres ?** Plus pour la côte que pour le reste. Les grandes compagnies dont j'ai pu lire les horaires sont très côtières : 624 de leurs trajets vont vers des villes de la côte, 155 vers la sierra et 45 vers la jungle. Tout le reste vient des autorisations du gouvernement, qui sous-estiment le trafic (j'y reviens plus bas). En plus, une bonne partie des déplacements andins et amazoniens se fait en minibus, en taxis collectifs et avec de petites compagnies locales qui ne publient rien. Juliaca n'affiche que 10 trajets, ce qui est clairement faux pour une ville de cette taille : beaucoup de bus pour Puno s'y arrêtent, mais je n'enregistre que le départ et l'arrivée de chaque trajet.

Civa, l'une des grandes compagnies nationales, n'est pas non plus dans le scraping parce que son site bloque les accès automatisés. Elle n'apparaît qu'à travers ses autorisations.

Tout ça pousse dans le même sens : la vraie sierra et la vraie selva sont plus fréquentées que sur la carte. Une partie de l'écart vient de mes données. Je ne sais pas dire combien.

## Comment c'est construit

**Où trouver des horaires de bus pour le Pérou ?** Il n'existe pas de flux GTFS pour les bus interurbains au Pérou, ni de jeu de données ouvert des lignes. Ce qui existe, c'est de la paperasse. Chaque compagnie a besoin d'une autorisation de ligne du ministère des Transports (MTC), et ces autorisations sont publiées en PDF sur gob.pe. Chacune liste l'itinéraire, les jours de la semaine et les horaires de départ autorisés.

Première étape, donc : un scraper pour la liste de gob.pe (1 649 documents), puis `pdftotext` et un parser pour les deux modèles que le ministère a utilisés au fil des années. 1 146 autorisations en sont sorties avec un horaire exploitable. 181 étaient des images scannées, que j'ai laissées de côté plutôt que de les passer à l'OCR.

La deuxième étape est arrivée après une mauvaise surprise. Les autorisations disent ce qu'une compagnie a le *droit* de faire rouler, et les grandes compagnies en font rouler bien plus. Cruz del Sur avait 6 départs le mercredi dans ses autorisations, et 199 sur son propre site. Pour huit grandes compagnies (Cruz del Sur, Oltursa, Movil Bus, Ittsa, Emtrafesa, Transportes Línea, Flores et PerúBus), j'ai donc lu leurs pages publiques de recherche de billets pour le mercredi 11 novembre. Un même bus est souvent vendu sous plusieurs billets, un par paire de villes et par terminal de Lima, donc il a fallu refusionner ces annonces en bus uniques, par numéro de voyage ou par heure de départ. Résultat : 824 bus. Les autorisations de toutes les autres compagnies en ont ajouté 835.

Le reste, c'est de la plomberie. Les 759 villes sont géocodées hors ligne avec GeoNames. Les routes viennent d'OpenStreetMap, calculées avec un serveur OSRM local, et quand une compagnie ne publie pas d'heure d'arrivée, le trajet prend le temps en voiture × 1,20, le ratio médian que j'ai mesuré sur 654 trajets qui ont les deux. Les trains, c'est l'horaire de PeruRail saisi à la main et tracé sur les voies ferrées d'OpenStreetMap. La carte elle-même, c'est deck.gl par-dessus MapLibre avec un fond de carte CARTO, et la version vidéo est rendue image par image dans un Chromium headless puis assemblée avec ffmpeg.

Une erreur qui vaut d'être racontée : la première version demandait au routeur des tracés de routes *simplifiés*, environ un point tous les 30 km. Sur la côte, personne ne l'aurait remarqué. Dans les Andes, les points coupaient tout droit à travers les lacets, et les lignes tracées étaient en moyenne 11 % plus courtes que les vraies routes (Lima–Huancayo dessiné à 270 km pour une route de 304 km). La géométrie complète a réglé le problème.

J'ai construit l'essentiel en quelques sessions avec Claude Code, qui a pris en charge une bonne partie du travail ingrat de scraping et de parsing pendant que je décidais quoi regarder. Le widget ci-dessus est une page statique servie depuis ce site avec sa propre politique de sécurité de contenu : rien ne se charge depuis l'extérieur, à part les tuiles de la carte.

## À retenir

**Qu'est-ce qu'une journée de bus m'a appris ?**

1. **Le réseau interurbain péruvien est plus chargé la nuit.** Le creux, c'est l'heure du déjeuner, et même là, 400 bus sont sur la route.
2. **C'est une côte avec Lima au milieu.** Deux trajets sur trois touchent la capitale, et la Panaméricaine porte l'essentiel du reste.
3. **La distance n'est pas l'isolement.** Tacna et Puno sont loin de Lima mais bien reliées à Arequipa et Cusco. Les endroits vraiment mal desservis sont dans la montagne et la jungle.
4. **Les données officielles disent ce qui est autorisé, pas ce qui se passe.** Les autorisations rataient 97 % des bus de Cruz del Sur. Sans les sites des compagnies elles-mêmes, cette carte montrerait un pays bien plus vide.

Si tu connais les routes péruviennes et que quelque chose te semble faux ici, ça m'intéresse. Les points ne valent que ce que valent les horaires derrière eux.
