---
title: "Trois strings et deux fallbacks : brancher le share sheet natif sur Forgemage.net"
description: "Le bouton de partage de la page détail d'une requête sur Forgemage.net ouvre le share sheet de l'OS partout où le système en a un — Android, iOS, Windows, macOS — copie le lien là où il n'y en a pas, et se tait quand tu changes simplement d'avis. Voilà toute l'implémentation : navigator.share avec trois strings, un garde AbortError qui laisse passer au lieu de catcher, un fallback clipboard avec un fallback execCommand en dessous, et le détail Symfony d'une seule lettre qui décide si le lien partagé fonctionne."
pubDate: 2026-08-27
tags: ["JavaScript", "Web Share API", "Symfony", "Twig", "Progressive Enhancement"]
cover: ../_assets/forgemage-native-share-sheet.svg
ogImage: ../_assets/forgemage-native-share-sheet.png
coverAlt: "Un bouton de partage sur une page web qui ouvre le share sheet du système, avec un chemin de copie dans le clipboard en dessous pour les navigateurs qui n'ont pas de sheet"
translationKey: "forgemage-native-share-sheet"
---

Toutes les apps mobiles ont ce bouton. Tu tapes dessus, un tiroir remonte depuis le bas de l'écran, et il y a WhatsApp, Messages, AirDrop, Notes, Discord, tout ce que tu as installé. Pendant des années ce tiroir était réservé au natif, et la réponse du web c'était une rangée d'icônes de marques qui ouvrait `twitter.com/intent/tweet` dans un nouvel onglet.

Ce tiroir est accessible aux pages web maintenant. `navigator.share()` ouvre exactement le même sheet système, et le happy path tient en six lignes.

Je l'ai shippé la semaine dernière sur [Forgemage.net](https://forgemage.net), la marketplace de forgemagie Dofus dont je parle depuis que j'ai [sorti le N+1 de sa page de recherche](/blog/forgemage-search-n1-queries/). Un forgemage ouvre une requête de FM, veut l'envoyer à un pote qui pourrait prendre le job, et jusqu'à la semaine dernière la seule façon de faire c'était de sélectionner la barre d'URL au pouce. Maintenant il y a un bouton Partager à côté d'Archiver.

Les six lignes, c'était la partie facile. Ce qui a pris l'après-midi, c'est tout ce qui les entoure : d'où vient l'URL, ce qui se passe quand quelqu'un balaie le sheet pour le fermer, et ce que le bouton doit faire dans un navigateur dont l'OS n'a pas de share sheet du tout.

## L'API, c'est trois strings et une promesse

**Qu'est-ce que le navigateur te donne concrètement ?**

Pas grand-chose, et c'est tout l'intérêt :

```js
await navigator.share({
    title: 'Magging Request Details',
    text: 'Someone wants a Gelano maged',
    url: 'https://forgemage.net/request/01JQ...',
});
```

Trois strings optionnelles, plus un tableau `files`. Pas de SDK, pas d'app ID, pas de danse OAuth, pas de balise script d'une boîte qui aimerait bien A/B tester ma page à ma place.

Deux contraintes dures quand même. La page doit être en contexte sécurisé, donc HTTPS en prod et localhost quand tu bosses. Et l'appel doit se faire dans un vrai geste utilisateur. Pas sur `DOMContentLoaded`, pas dans un `setTimeout`, et — c'est celle qui piège tout le monde — pas après un `await` qui part sur le réseau. Tu vas chercher un lien court sur ta propre API et *ensuite* tu appelles `share()` : l'activation transitoire est perdue et le navigateur te rejette. Ce que tu veux partager doit déjà être en mémoire avant le clic.

## D'où vient l'URL décide si le lien marche

**Pourquoi ne pas partager `location.href` ?**

Parce que sur Forgemage.net la barre d'adresse n'est pas fiablement ce qu'on veut envoyer. La route de détail est localisée, donc la même page vit sur `/request/{ulid}` en anglais, `/requete/{ulid}` en français et `/pedido/{ulid}` en espagnol. Et plusieurs des points d'entrée intéressants sont des vues dashboard dont l'URL visible porte un state de query dont personne d'autre n'a besoin.

Donc l'URL vient du serveur, dans le markup :

```twig
<button type="button" class="rd-cta rd-cta--ghost rd-share"
        data-share-url="{{ url('app_request_detail', {'ulid': fmRequest.ulid}) }}"
        data-share-title="{{ 'Magging Request Details'|trans }}"
        data-copied-label="{{ 'Copied'|trans }}">
    <i class="bi bi-share-fill"></i>
    <span class="rd-share__label">{% trans %}Share{% endtrans %}</span>
</button>
```

Le caractère important là-dedans, c'est le `u` de `url()`. Le `path()` de Symfony génère `/request/01JQ…`, parfait pour un `href` et inutile dans un payload de partage : collé dans Discord ce n'est pas un lien, et une cible native n'a aucune idée du host à préfixer. `url()` donne la forme absolue. Une lettre d'écart entre une feature qui marche et un ticket qui dit « le lien ne s'ouvre pas ».

Le reste des attributs existe parce que le JavaScript n'a pas accès au translator de Twig. Le label, la string de confirmation et le titre de partage sont rendus côté serveur dans des `data-*` et relus au moment du clic. Un peu moche, et l'alternative c'est d'envoyer un catalogue de traductions au client pour qu'un bouton sache dire « Copié » en trois langues.

L'ULID travaille en silence lui aussi. La route c'est `/{ulid:fmRequest}`, donc les liens partagés ne sont pas devinables comme le seraient des ids séquentiels. Personne ne va parcourir `/request/1`, `/request/2` et lire toute la table parce que j'ai mis un bouton de partage sur la page.

## Un seul passage en dessous gère tous les échecs

**Que se passe-t-il quand le sheet ne s'ouvre pas ?**

Voilà tout le handler de partage, et sa forme est la seule vraie décision du fichier :

```js
async function share(button) {
    const url = button.dataset.shareUrl || window.location.href;

    if (navigator.share) {
        try {
            await navigator.share({ title: button.dataset.shareTitle || document.title, url });

            return;
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
        }
    }

    if (await copyToClipboard(url)) {
        confirmCopy(button);
    }
}
```

Deux `return` et pas de `else`. Le chemin de succès sort, le chemin d'annulation sort, et tout le reste tombe hors du `if` et atterrit sur le clipboard : pas de `navigator.share` du tout, un `NotAllowedError` par geste perdu, un `DataError` sur une URL qui ne parse pas, une Permissions Policy qui bloque l'appel dans une iframe. Je n'ai jamais eu à énumérer les échecs. J'ai juste eu à nommer les deux cas où ne rien faire est le bon comportement.

`AbortError` est celui sur lequel il faut être soigneux. C'est ce que tu récupères quand l'utilisateur balaie le sheet, et ça arrive sous forme de promesse rejetée qui ressemble exactement à un vrai problème. Catche-le génériquement et tu affiches « Échec du partage » à quelqu'un qui a simplement changé d'avis, ce genre de petit truc qui donne l'impression que le logiciel ne suit pas. Annuler est une issue réussie d'un share sheet. C'est juste pas un partage.

L'autre victoire discrète, c'est le desktop, et pas celle que j'attendais. Le share sheet n'est pas une feature de téléphone : Chrome et Edge sous Windows passent le payload au flyout de partage de Windows, et Safari sur macOS ouvre le même sheet que n'importe quelle app Mac. Ce qui décide, c'est de savoir si l'OS a une UI de partage et si le navigateur prend la peine de la brancher. Linux n'en a pas, donc `navigator.share` est undefined et mon propre Chrome copie le lien — le fallback a été le seul chemin que j'ai vu pendant la première heure de dev. Firefox desktop ne l'implémente nulle part. Tout ça tient dans un `if` et zéro feature flag : le markup envoie un bouton et chaque navigateur décide de ce qu'il veut dire.

## Le fallback a un fallback

**Pourquoi garder `document.execCommand('copy')` en 2026 ?**

Parce que `navigator.clipboard` exige un contexte sécurisé et une permission qui peut être refusée, et qu'un bouton de copie qui ne fait rien en silence est pire que pas de bouton de copie :

```js
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);

        return true;
    } catch {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();

        return copied;
    }
}
```

L'astuce du textarea hors écran est dépréciée, marche à peu près partout, et renvoie un booléen sur lequel je peux agir. Note l'`opacity: 0` avec `position: fixed` plutôt qu'un `display: none` ou un offset négatif : le champ doit être sélectionnable, donc il peut être invisible mais il ne peut pas être absent, et il ne doit pas scroller la page au passage. Il doit aussi ressortir dans le même tick, sinon une frame lente laisse un vrai élément focusable dans le DOM qu'un lecteur d'écran va trouver.

Les deux chemins renvoient un booléen au lieu de throw, et c'est pour ça que l'appelant se lit comme un seul `if` propre.

## Le bouton doit répondre

**Comment l'utilisateur sait que quelque chose s'est passé ?**

Sur le chemin natif il le sait, l'OS a dessiné un sheet par-dessus la page. Sur le chemin clipboard rien de visible ne se produit, donc le bouton le dit lui-même :

```js
function confirmCopy(button) {
    const label = button.querySelector('.rd-share__label');
    const icon = button.querySelector('i');
    const original = label.textContent;

    button.classList.add('is-copied');
    label.textContent = button.dataset.copiedLabel || 'Copied';
    icon.className = 'bi bi-check2';

    setTimeout(() => {
        button.classList.remove('is-copied');
        label.textContent = original;
        icon.className = 'bi bi-share-fill';
    }, 1800);
}
```

L'icône devient une coche, le label devient le « Copié » traduit, les deux reviennent après 1,8 seconde. Pas de librairie de toasts, pas de conteneur de notifications, pas de store. Le feedback vit sur l'élément que l'utilisateur vient de toucher, là où ses yeux sont déjà.

Lire `original` depuis le DOM au lieu de hardcoder « Partager », c'est ce qui rend la restauration correcte en français et en espagnol. Et 1800, c'est un chiffre que j'ai choisi parce que 1000 paraissait coupé et 3000 donnait l'impression que le bouton était bloqué.

## Ce que j'ai laissé de côté volontairement

**Pourquoi pas de `text`, ni d'image ?**

Le payload c'est `title` et `url`, rien d'autre, et c'est délibéré. La spec est explicite : les trois champs sont des indications, l'app réceptrice décide de ce qu'elle en fait, et plusieurs cibles prennent exactement l'un des deux entre `text` et `url` et laissent tomber l'autre. Passer les deux, c'est comme ça que tu finis avec un message qui décrit une requête de FM sans lien vers elle. Si le lien est le sujet, envoie le lien.

`title` est ignoré la plupart du temps aussi. Chrome Android s'en sert comme objet pour les cibles mail et le jette ailleurs. Je le passe parce que quand il est lu c'est la bonne string, et quand il ne l'est pas, on ne perd rien.

Les fichiers seraient l'étape suivante évidente, vu qu'une page détail a un item et une ligne de stats qui screenshoteraient bien :

```js
if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
}
```

`canShare()` est la seule façon honnête de savoir si la plateforme accepte ce type MIME et cette taille, et il est arrivé après `share()` lui-même, d'où l'appel optionnel. J'ai tout sauté. Générer une image côté serveur, la préfetcher avant le clic pour que le geste utilisateur survive, et accepter que plusieurs plateformes ignorent `url` quand `files` est présent, c'est une feature, pas un fallback. Pas le même après-midi.

Pareil dans l'autre sens. Une PWA peut s'enregistrer *dans* le sheet avec `share_target` dans son manifest et recevoir un POST multipart classique, que n'importe quel controller Symfony sait déjà lire. Android seulement, rien sur iOS, et Forgemage.net n'est pas encore installable.

## Les trucs dont je ne suis pas fier

**Qu'est-ce qui reste dû ?**

Le lien partagé tape dans un mur de login. `RequestController::detail()` appelle `denyAccessUnlessGranted('ROLE_USER')`, donc un pote qui tape le lien sans compte atterrit sur une page de connexion au lieu de la requête. Correct pour la donnée, rugueux comme première impression pour un lien que quelqu'un a choisi d'envoyer. Une vue teaser publique réglerait ça et je ne l'ai pas construite.

La locale suit le mouvement. `url()` génère le chemin pour la locale de celui qui partage, donc un forgemage français qui partage à un pote espagnol lui envoie `/requete/…`, et l'app le sert en français. Le partage voudrait sans doute une URL canonique neutre en locale. J'envoie la localisée parce que c'est ce que le helper de route te donne sans y réfléchir.

Le markup du bouton existe deux fois dans `detail.html.twig`, une fois dans chaque branche de la condition propriétaire/visiteur, avec les trois `data-*` dupliqués. Ça devrait être un composant ou un include qui prend la requête. C'est un copier-coller, et je l'ai remarqué en écrivant ce paragraphe plutôt qu'en écrivant le template.

Et je n'ai aucune idée de si quelqu'un s'en sert. Pas d'event, pas de compteur, rien. La version honnête de ce post commence par un chiffre plutôt que par une histoire.

## À retenir

1. **La contrainte c'est le geste, pas l'API.** `navigator.share()` c'est trois strings, et la principale façon de se tromper c'est d'`await` autre chose avant. Construis le payload avant le clic, ou partage une URL que tu as déjà.
2. **`AbortError` veut dire « non merci ».** Traite un sheet fermé comme un échec et ton app engueule les gens qui changent d'avis. Deux `return` au bon endroit, et tous les autres échecs peuvent partager un seul fallback.
3. **URLs absolues ou rien.** En Symfony c'est `url()`, pas `path()`. Un lien relatif dans un payload de partage cesse d'être un lien dès qu'il quitte le navigateur.
4. **Feature-detect pour reformer le bouton, pas pour le cacher.** Un seul `<button>` dans le template ouvre le sheet de l'OS sur Android, iOS, Windows et macOS, et copie le lien sous Linux ou dans Firefox, et personne ne voit jamais un contrôle qui ne fait rien.
5. **Rends ta microcopy côté serveur dans des `data-*`.** C'est la façon la moins chère de garder un label piloté par le JS traduit sans envoyer un catalogue au client.

Quarante lignes de JavaScript et une lettre de Twig. Ça n'apparaîtra dans aucun changelog que quelqu'un lit. Mais une requête qui arrive au bon forgemage est une requête qui se fait, et jusqu'à la semaine dernière la transmettre voulait dire sélectionner la barre d'URL au pouce. C'est toute la feature.
