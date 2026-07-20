---
title: "Markdown para agentes, self-hosted: un subscriber de Symfony en lugar de un plan de Cloudflare"
description: "Cloudflare convierte páginas a markdown para agentes IA vía Accept: text/markdown — en planes de pago. El mismo contrato HTTP cabe en un event subscriber de Symfony de 144 líneas. Mi homepage pasó de 59 KB de HTML a 7,7 KB de markdown, misma URL."
pubDate: 2026-07-08
tags: ["Symfony", "PHP", "AI Agents", "HTTP", "SEO"]
cover: ../_assets/markdown-for-agents.svg
ogImage: ../_assets/markdown-for-agents.png
coverAlt: "Una petición curl con Accept: text/markdown junto a un documento HTML convertido en markdown limpio, con una reducción de tamaño del 87 %"
translationKey: "markdown-for-agents"
---

Una parte creciente del tráfico de mi side project no es humana. [Forgemage](https://forgemage.net) es un marketplace donde los jugadores de Dofus encuentran forjamagos, y desde que despegó la búsqueda asistida por IA, parte de sus «visitantes» son LLMs que descargan una página para responder la pregunta de alguien. Reciben lo mismo que los navegadores: 59 KB de HTML para unas mil palabras de contenido real. El resto son clases de Bootstrap, iconos SVG, un banner de cookies y un footer que el agente tokenizará diligentemente para luego ignorarlo.

En febrero, Cloudflare lanzó una feature llamada [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/): cuando un cliente envía `Accept: text/markdown`, su edge convierte la respuesta HTML a markdown al vuelo. Anuncian alrededor de un 80 % menos de tokens por página. Es un toggle en el dashboard — en planes Pro y superiores.

La cuestión es que no hay ninguna magia de Cloudflare en ese contrato. Es negociación de contenido HTTP, un mecanismo más viejo que la mayoría de los problemas de la web, más un conversor de HTML a markdown. Forgemage es una app Symfony, así que implementé el mismo comportamiento yo mismo: un event subscriber, un paquete de composer, una tarde incluyendo los tests. Este post recorre la implementación y los tres detalles que me habrían mordido en producción si la RFC no me hubiera avisado antes.

## El contrato antes del código

**¿Cómo servir HTML y markdown desde la misma URL?** Las dos versiones viven en la misma URL. Un navegador que pide `https://forgemage.net/` recibe HTML; un agente que envía `Accept: text/markdown` recibe markdown. Sin prefijo `/md/`, sin sufijo `.md`, sin ruta separada que mantener.

Esa es la parte agradable. Las reglas de negociación son donde las implementaciones se tuercen en silencio:

El markdown debe pedirse *por su nombre*. El header Accept de todo navegador termina en `*/*;q=0.8`, y un wildcard técnicamente hace match con `text/markdown`. Tratad el wildcard como opt-in y serviréis markdown a Chrome. Desconfío de esa desde que leí el header que Firefox envía de verdad.

`q=0` es un rechazo explícito, no una preferencia baja — la RFC 9110 dice que una calidad de cero significa «no me envíes esto nunca». Un cliente que dice `text/markdown;q=0` recibe HTML, y punto.

En caso de empate, gana el markdown. Si un cliente lista `text/html` y `text/markdown` con la misma calidad, nombró el markdown explícitamente. Los navegadores nunca hacen eso. Una máquina que se molestó en escribir `text/markdown` en su header Accept lo quiere.

Aquí está esa lógica en el subscriber, usando el parser `AcceptHeader` de Symfony para no reescribir a mano la ordenación por calidad:

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

El bucle manual en lugar de `$accept->get('text/markdown')` es deliberado: tolera las mayúsculas (`Text/Markdown`) y los parámetros de media type (`text/markdown;variant=GFM`), ambos legales según la RFC y ambos cosas que un lookup estricto por string se perdería.

## Dónde engancharse, y qué proteger

**¿Dónde debe vivir la conversión, y qué hay que proteger?** Toda la feature es un subscriber de `kernel.response`. El controller renderiza su HTML exactamente como antes; el subscriber decide después si sustituye el body. Sin cambios en controllers, sin cambios en templates, y borrar la clase elimina la feature limpiamente.

Antes de convertir nada, se retira salvo que *todo* esto se cumpla: es la main request, el método es GET o HEAD, la respuesta es `text/html`, el status es 200, y — la salvaguarda que más me importa — la ruta es indexable.

```php
if (!\in_array($request->getMethod(), [Request::METHOD_GET, Request::METHOD_HEAD], true)
    || !$this->sitemapService->isIndexable($request->attributes->get('_route'))
    || !str_starts_with($response->headers->get('Content-Type') ?? 'text/html', 'text/html')
) {
    return;
}
```

Esa llamada a `isIndexable()` reutiliza el servicio que ya construye mi sitemap y mi robots.txt. La app tiene una única definición de «página pública», y la versión markdown la hereda. Un agente logueado que golpea `/wishlist` o un hilo de mensajería con `Accept: text/markdown` recibe HTML normal, porque esas rutas nunca fueron indexables. No tuve que enumerar las páginas privadas una segunda vez, lo que significa que tampoco puedo olvidarme de una una segunda vez.

## Convertir HTML que nunca se escribió para ser markdown

**¿Qué implica de verdad convertir el HTML de una página en markdown limpio?** La conversión en sí es [`league/html-to-markdown`](https://github.com/thephpleague/html-to-markdown), configurado una vez y cacheado en el subscriber:

```php
$this->htmlConverter = new HtmlConverter([
    'strip_tags' => true,
    'strip_placeholder_links' => true,
    'remove_nodes' => 'head script style noscript template iframe canvas svg nav header footer',
]);
$this->htmlConverter->getEnvironment()->addConverter(new TableConverter());
```

La lista `remove_nodes` es la decisión editorial escondida en la config. Scripts y estilos, obvio. `nav`, `header` y `footer` son una elección: un agente que pide la versión markdown quiere el contenido de la página, no cuarenta enlaces de navegación y un selector de idioma repetidos en cada URL del sitio. Recortar el envoltorio es gran parte de por qué el output encoge tanto. `TableConverter` es opt-in en el paquete de league, y Forgemage tiene tablas de precios que prefiero que los agentes lean como tablas y no como texto corrido.

Dos toques pequeños tras la conversión. Si el resultado no empieza con un heading `# `, el subscriber promociona el `<title>` del HTML a H1, para que cada documento markdown se abra con su tema — lo primero que un agente escanea. Y toda la conversión vive en un `try/catch (Throwable)` que recae en servir el HTML intacto. Una versión markdown es un nice-to-have; no tiene derecho a tirar una página pública con un 500.

## Los tres detalles que de verdad importan

**¿Qué detalles de implementación muerden de verdad en producción?** Todo lo anterior es directo. Estos tres son la razón por la que mandaría a un colega a este post en lugar de al README del paquete.

**`Vary: Accept`, en ambas versiones.** Dos bodies distintos viven en una sola URL, así que cada caché entre el agente y la app debe incluir el header Accept en su clave. Olvidadlo y un CDN cachea felizmente la versión markdown y se la sirve al siguiente navegador. El subscriber lo pone antes incluso de comprobar si se pidió markdown, y antes del check del 200, porque la URL negocia sea cual sea el resultado de esa respuesta concreta. El `setVary('Accept', false)` de Symfony añade en lugar de reemplazar, así que un `Vary` existente puesto por otro listener sobrevive.

**HEAD debe negociar como GET.** Un agente puede hacer un HEAD primero para comprobar el Content-Type antes de comprometerse con la descarga. El `ResponseListener` de Symfony (prioridad 0) elimina los bodies de los HEAD en `prepare()`, así que este subscriber se registra con prioridad 10 para ejecutarse antes — la respuesta HEAD lleva `Content-Type: text/markdown` y `Vary: Accept` exactamente como su gemela GET, solo que sin body.

**Recalcular lo que invalida el cambio de body.** Tras sustituir el contenido, el `Content-Length` obsoleto tiene que desaparecer (Symfony lo recalcula), y el Content-Type pasa a `text/markdown; charset=utf-8`. Para la versión HTML, el subscriber añade en su lugar una pista de descubribilidad: `Link: <misma-url>; rel="alternate"; type="text/markdown"`, que es como un crawler se entera de que el markdown existe sin que se lo cuenten por otro canal.

## Demostrar que funciona

**¿Cómo demostrar que la negociación funciona?** Siete tests de `WebTestCase` fijan la matriz de negociación: el Accept de un navegador conserva el HTML, `*/*` no es opt-in, `q=0` rechaza, `Text/Markdown;variant=GFM` hace match, HEAD lleva los mismos headers, y una petición logueada a una ruta privada nunca convierte. La suite entera es aburrida a propósito — cada test son cuatro líneas de «envía este header Accept, comprueba este Content-Type».

Contra producción:

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

De 59 432 bytes a 7 670 — una reducción del 87 % en el cable, en línea con el ~80 % de tokens que anuncia Cloudflare. La versión markdown es la página tal como la describiría un humano si le preguntaras qué hay en ella.

## Los límites, con honestidad

**¿Cuándo se queda corto servir markdown así?**

**Garbage in, garbage out.** El conversor transforma tu HTML renderizado; no puede añadir una estructura que tus templates no tienen. Los templates Twig de Forgemage usan headings de verdad y listas semánticas, así que el markdown sale legible. Un front-end de sopa de divs produciría sopa de markdown.

**Casi nadie lo pide todavía.** No he visto a ningún crawler mainstream enviar `Accept: text/markdown` por iniciativa propia. Los agentes de hoy descargan HTML y lo convierten en el lado del cliente — la herramienta WebFetch de Claude Code hace exactamente eso. Esta feature es una apuesta a que la convención que empuja Cloudflare se convierta en la norma, y la apuesta es pequeña: una dependencia, 144 líneas, cero coste recurrente. Servir la conversión desde el origin también significa que el conversor del agente nunca ve mi banner de cookies.

**Complementa a llms.txt, no lo sustituye.** Este mismo sitio tiene un `/llms.txt` — un mapa curado para agentes. La negociación de contenido responde a otra pregunta: «dame *esta página*, barata». Uno es un índice; el otro, el libro impreso en una tipografía legible.

## Conclusiones

**¿Qué se traslada a tu propio stack?**

1. **El Markdown for Agents de Cloudflare es un contrato, no un producto.** `Accept: text/markdown` de entrada, body convertido más `Vary: Accept` de salida. Cualquier framework con eventos de respuesta puede cumplirlo.
2. **Los casos límite de la negociación son la feature.** El wildcard no es opt-in, `q=0` significa nunca, el matching es insensible a mayúsculas y tolerante a parámetros. Falladlos y los navegadores verán markdown.
3. **Reutilizad vuestra lógica de indexabilidad como barandilla.** Si el sitemap no la listaría, la versión markdown no debería existir. Una sola definición de «público», aplicada dos veces gratis.
4. **Recortad el envoltorio en la config del conversor.** Quitar `nav`, `header` y `footer` es de donde sale la mayor parte del 87 %, y cabe en una string de config.

Una tarde de trabajo, la mayor parte escribiendo tests para headers Accept que quizá ningún cliente envíe jamás. Pero el día que el primer agente le pida markdown a mi servidor por su nombre, recibirá una respuesta limpia con un 87 % de descuento — y no tuve que cambiar de plan para eso.
