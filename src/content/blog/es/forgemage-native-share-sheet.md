---
title: "Tres strings y dos fallbacks: conectar el share sheet nativo en Forgemage.net"
description: "El botón de compartir de la página de detalle de una petición en Forgemage.net abre el share sheet del sistema allá donde el sistema tiene uno — Android, iOS, Windows, macOS — copia el link donde no lo hay, y se calla cuando simplemente cambias de opinión. Aquí está toda la implementación: navigator.share con tres strings, un guard de AbortError que deja pasar en vez de catchear, un fallback de clipboard con un fallback de execCommand debajo, y el detalle de Symfony de una sola letra que decide si el link compartido funciona."
pubDate: 2026-08-27
tags: ["JavaScript", "Web Share API", "Symfony", "Twig", "Progressive Enhancement"]
cover: ../_assets/forgemage-native-share-sheet.svg
ogImage: ../_assets/forgemage-native-share-sheet.png
coverAlt: "Un botón de compartir en una página web abriendo el share sheet del sistema operativo, con un camino de copia al clipboard debajo para los navegadores que no tienen sheet"
translationKey: "forgemage-native-share-sheet"
---

Todas las apps móviles tienen ese botón. Lo tocas, un cajón sube desde abajo de la pantalla, y ahí están WhatsApp, Mensajes, AirDrop, Notas, Discord, lo que tengas instalado. Durante años ese cajón fue territorio exclusivo del nativo, y la respuesta de la web era una fila de iconos de marcas que abría `twitter.com/intent/tweet` en una pestaña nueva.

Ese cajón ya está disponible para las páginas web. `navigator.share()` abre exactamente el mismo sheet del sistema, y el happy path son seis líneas.

Lo shippeé la semana pasada en [Forgemage.net](https://forgemage.net), el marketplace de forjamagia de Dofus del que vengo escribiendo desde que [saqué el N+1 de su página de búsqueda](/blog/forgemage-search-n1-queries/). Un forjamago abre una petición de mageo, quiere enviársela a un colega que podría coger el trabajo, y hasta la semana pasada la única forma era seleccionar la barra de URL con el pulgar. Ahora hay un botón Compartir al lado de Archivar.

Las seis líneas eran la parte fácil. Lo que se llevó la tarde fue todo lo que las rodea: de dónde sale la URL, qué pasa cuando alguien desliza el sheet para cerrarlo, y qué debería hacer el botón en un navegador cuyo sistema no tiene share sheet en absoluto.

## La API son tres strings y una promesa

**¿Qué te da el navegador realmente?**

No mucho, y ahí está la gracia:

```js
await navigator.share({
    title: 'Magging Request Details',
    text: 'Someone wants a Gelano maged',
    url: 'https://forgemage.net/request/01JQ...',
});
```

Tres strings opcionales, más un array `files`. Sin SDK, sin app ID, sin baile de OAuth, sin una etiqueta script de una empresa a la que le encantaría hacer A/B testing en mi página por mí.

Dos requisitos duros, eso sí. La página tiene que ser un contexto seguro, o sea HTTPS en producción y localhost mientras trabajas. Y la llamada tiene que ocurrir dentro de un gesto real del usuario. No en `DOMContentLoaded`, no en un `setTimeout`, y — esta es la que pilla a todo el mundo — no después de un `await` que sale a la red. Pides un link corto a tu propia API y *luego* llamas a `share()`: la activación transitoria ya no está y el navegador te rechaza. Lo que vayas a compartir tiene que estar en memoria antes del click.

## De dónde sale la URL decide si el link sirve

**¿Por qué no compartir `location.href`?**

Porque en Forgemage.net la barra de direcciones no es de forma fiable lo que quiero enviar. La ruta de detalle está localizada, así que la misma página vive en `/request/{ulid}` en inglés, `/requete/{ulid}` en francés y `/pedido/{ulid}` en español. Y varios de los puntos de entrada interesantes son vistas del dashboard cuya URL visible lleva un state de query que nadie más necesita.

Así que la URL viene del servidor, en el markup:

```twig
<button type="button" class="rd-cta rd-cta--ghost rd-share"
        data-share-url="{{ url('app_request_detail', {'ulid': fmRequest.ulid}) }}"
        data-share-title="{{ 'Magging Request Details'|trans }}"
        data-copied-label="{{ 'Copied'|trans }}">
    <i class="bi bi-share-fill"></i>
    <span class="rd-share__label">{% trans %}Share{% endtrans %}</span>
</button>
```

El carácter importante ahí es la `u` de `url()`. El `path()` de Symfony genera `/request/01JQ…`, perfecto para un `href` e inútil en un payload de compartir: pegado en Discord no es un link, y un target nativo no tiene idea de qué host poner delante. `url()` da la forma absoluta. Una letra de diferencia entre una feature que funciona y un ticket que dice «el link no abre».

El resto de los atributos existen porque JavaScript no llega al translator de Twig. La etiqueta, el string de confirmación y el título de compartir se renderizan en el servidor dentro de `data-*` y se releen en el momento del click. Un poco feo, y la alternativa es mandar un catálogo de traducciones al cliente para que un botón sepa decir «Copiado» en tres idiomas.

El ULID también trabaja en silencio. La ruta es `/{ulid:fmRequest}`, así que los links compartidos no se pueden adivinar como sí pasaría con ids secuenciales. Nadie va a recorrer `/request/1`, `/request/2` y leerse toda la tabla porque yo puse un botón de compartir en la página.

## Un solo paso hacia abajo cubre todos los fallos

**¿Qué pasa cuando el sheet no se abre?**

Este es todo el handler de compartir, y su forma es la única decisión de verdad del archivo:

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

Dos `return` y ningún `else`. El camino de éxito sale, el de cancelación sale, y todo lo demás se cae fuera del `if` y aterriza en el clipboard: que no haya `navigator.share` en absoluto, un `NotAllowedError` por un gesto perdido, un `DataError` por una URL que no parsea, una Permissions Policy bloqueando la llamada dentro de un iframe. Nunca tuve que enumerar los fallos. Solo tuve que nombrar los dos casos en los que no hacer nada es el comportamiento correcto.

`AbortError` es el que merece cuidado. Es lo que recibes cuando el usuario desliza el sheet para cerrarlo, y llega como una promesa rechazada con la misma pinta que un problema real. Cátchealo de forma genérica y le muestras «Error al compartir» a alguien que simplemente cambió de opinión, ese tipo de detalle pequeño que hace que el software parezca no estar atento. Cancelar es un resultado exitoso de un share sheet. Solo que no es un compartir.

La otra victoria discreta es el desktop, y no es la que esperaba. El share sheet no es una feature de móvil: Chrome y Edge en Windows le pasan el payload al flyout de compartir de Windows, y Safari en macOS abre el mismo sheet que cualquier app de Mac. Lo que lo decide es si el sistema tiene una UI de compartir y si el navegador se molesta en conectarla. Linux no la tiene, así que `navigator.share` es undefined y mi propio Chrome copia el link — el fallback fue el único camino que vi durante la primera hora de desarrollo. Firefox de escritorio no lo implementa en ningún sitio. Todo eso cabe en un `if` y cero feature flags: el markup manda un botón y cada navegador decide qué significa.

## El fallback tiene un fallback

**¿Por qué mantener `document.execCommand('copy')` en 2026?**

Porque `navigator.clipboard` necesita un contexto seguro y un permiso que se puede denegar, y un botón de copiar que no hace nada en silencio es peor que no tener botón de copiar:

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

El truco del textarea fuera de pantalla está deprecado, funciona casi en todos lados, y devuelve un booleano sobre el que puedo actuar. Fíjate en el `opacity: 0` con `position: fixed` en vez de un `display: none` o un offset negativo: el campo tiene que ser seleccionable, así que puede ser invisible pero no puede no estar, y no debería hacer scroll en la página al entrar. También tiene que salir en el mismo tick, porque si no un frame lento deja un elemento realmente enfocable en el DOM que un lector de pantalla va a encontrar.

Los dos caminos devuelven un booleano en vez de lanzar, y por eso quien los llama se lee como un único `if` limpio.

## El botón tiene que contestar

**¿Cómo sabe el usuario que pasó algo?**

En el camino nativo lo sabe, porque el sistema dibujó un sheet encima de la página. En el camino del clipboard no pasa nada visible, así que el botón lo dice él mismo:

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

El icono pasa a ser un check, la etiqueta pasa a ser el «Copiado» traducido, y los dos vuelven después de 1,8 segundos. Sin librería de toasts, sin contenedor de notificaciones, sin store. El feedback vive en el elemento que el usuario acaba de tocar, que es donde ya están sus ojos.

Leer `original` del DOM en vez de hardcodear «Compartir» es lo que hace que la restauración sea correcta en francés y en español. Y 1800 es un número que elegí porque 1000 se sentía cortado y 3000 parecía que el botón se había quedado colgado.

## Lo que dejé fuera a propósito

**¿Por qué no hay `text`, ni imagen?**

El payload es `title` y `url`, nada más, y es deliberado. La spec es explícita: los tres campos son pistas, la app receptora decide qué hace con ellas, y varios targets se quedan con exactamente uno de los dos entre `text` y `url` y tiran el otro. Pasar los dos es como acabas con un mensaje que describe una petición de mageo sin enlazarla. Si el link es el punto, manda el link.

`title` también se ignora la mayoría de las veces. Chrome en Android lo usa como asunto para los targets de correo y lo descarta en el resto. Lo paso porque cuando se lee es el string correcto, y cuando no, no se pierde nada.

Los archivos serían el siguiente paso obvio, porque una página de detalle tiene un item y una línea de stats que quedarían bien en un screenshot:

```js
if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
}
```

`canShare()` es la única forma honesta de saber si la plataforma acepta ese tipo MIME y ese tamaño, y llegó más tarde que `share()`, de ahí la llamada opcional. Me lo salté todo. Generar una imagen en el servidor, prefetchearla antes del click para que el gesto del usuario sobreviva, y aceptar que varias plataformas ignoran `url` cuando hay `files`, es una feature, no un fallback. Otra tarde.

Igual en el otro sentido. Una PWA puede registrarse *dentro* del sheet con `share_target` en su manifest y recibir un POST multipart normal, que cualquier controller de Symfony ya sabe leer. Solo Android, nada en iOS, y Forgemage.net todavía no es instalable.

## Las partes de las que no estoy orgulloso

**¿Qué sigue pendiente?**

El link compartido choca con un muro de login. `RequestController::detail()` llama a `denyAccessUnlessGranted('ROLE_USER')`, así que un colega que toca el link sin cuenta aterriza en una página de acceso en vez de en la petición. Correcto para el dato, y áspero como primera impresión para un link que alguien eligió mandar. Una vista teaser pública lo arreglaría y no la he construido.

La locale se va de viaje también. `url()` genera la ruta para la locale de quien comparte, así que un forjamago francés compartiendo con un colega español le manda `/requete/…`, y la app se lo sirve en francés. Compartir probablemente quiere una URL canónica neutra de idioma. Yo mando la localizada porque es lo que el helper de rutas te da sin pensarlo.

El markup del botón está dos veces en `detail.html.twig`, una en cada rama de la condición propietario/visitante, con los tres `data-*` duplicados. Debería ser un componente o un include que reciba la petición. Es un copiar-pegar, y me di cuenta escribiendo este párrafo en vez de escribiendo la plantilla.

Y no tengo idea de si alguien lo usa. Sin evento, sin contador, nada. La versión honesta de este post empieza con un número en vez de con una historia.

## Para llevarse

1. **La restricción es el gesto, no la API.** `navigator.share()` son tres strings, y la forma principal de equivocarse es hacer `await` de otra cosa antes. Construye el payload antes del click, o comparte una URL que ya tengas.
2. **`AbortError` significa «no, gracias».** Trata un sheet cerrado como un fallo y tu app regaña a la gente por cambiar de opinión. Dos `return` en el sitio correcto, y todos los demás fallos pueden compartir un único fallback.
3. **URLs absolutas o nada.** En Symfony eso es `url()`, no `path()`. Un link relativo en un payload de compartir deja de ser un link en el momento en que sale del navegador.
4. **Feature-detect para reformar el botón, no para esconderlo.** Un solo `<button>` en la plantilla abre el sheet del sistema en Android, iOS, Windows y macOS, y copia el link en Linux o en Firefox, y nadie ve nunca un control que no hace nada.
5. **Renderiza tu microcopy en el servidor dentro de `data-*`.** Es la forma más barata de mantener traducida una etiqueta gobernada por JS sin mandar un catálogo al cliente.

Cuarenta líneas de JavaScript y una letra de Twig. No va a aparecer en ningún changelog que alguien lea. Pero una petición que llega al forjamago correcto es una petición que se hace, y hasta la semana pasada reenviarla significaba seleccionar la barra de URL con el pulgar. Esa es toda la feature.
