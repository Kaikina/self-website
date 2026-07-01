---
title: "RepoWrapped: el Spotify Wrapped de un repo de GitHub, y la API que se me resistió"
description: "Una idea de fin de semana — una página de stats compartible y un badge de README para cualquier repo de GitHub y cualquier contributor — que acabó en pelea con la API de stats de GitHub: 202 que nunca se resuelven, un muro en el top 100, y una fecha de primer commit que hay que sacarle a un header."
pubDate: 2026-07-01
tags: ["Laravel", "PHP", "GitHub API", "Caching", "Side Project"]
cover: ../_assets/repo-wrapped.svg
ogImage: ../_assets/repo-wrapped.png
coverAlt: "Un informe de stats en verde terminal para un repo de GitHub: una cifra grande de commits, un ranking de contributors, y una tarjeta SVG embebible"
translationKey: "repo-wrapped"
---

Cada diciembre, Spotify te suelta tu pequeño resumen del año y media parte de tu feed se convierte en capturas de eso. Funciona porque las cifras siempre estuvieron ahí — solo que nunca las viste montadas como una historia sobre *ti*. Yo quería eso para un repo de GitHub. Lo apuntas a `owner/repo`, eliges un contributor, y obtienes una página que dice: aquí están los commits que metiste, aquí está tu ranking, aquí está la semana en que te desataste. Y luego puedes colar un badge SVG en tu README para que viva al lado del build status.

Ese era todo el pitch. Un fin de semana, quizá. Lo llamé [RepoWrapped](https://repo-wrapped.tom-girou.dev), y la parte de front-end sí que llevó un fin de semana. El resto del tiempo se fue en una pelea que no vi venir: **conseguir sacar las cifras de GitHub, sin más.**

Es un cambio de aires respecto a los [artículos sobre seguridad de IA](/blog/claude-gitlab-ai-review/) que vengo escribiendo últimamente — aquí no hay modelo, solo una pequeña app Laravel y una API que no quiere decirte lo que le pides. Es el tipo de historia de side-project más honesta, esa en la que la idea divertida es un error de redondeo y el trabajo de verdad está en algún sitio donde no lo esperabas.

## La idea es trivial. El dato no.

«Sacar las stats de commits de un repo» suena a un solo endpoint. No es un solo endpoint, y los que necesitas se comportan de una forma que solo cobra sentido una vez que te has quemado con ellos.

Esto es lo que quería por contributor: total de commits, líneas añadidas y borradas, un sparkline de actividad semanal, la fecha de su primer commit, y su puesto en el ranking del repo. Cuatro de esos cinco vienen de un único endpoint de GitHub — `/stats/contributors`. Ahí ocurre la mayor parte de esta historia, porque tiene dos trampas, y caí en las dos.

## Trampa uno: el 202 que significa «vuelve luego»

La primera vez que pegas a `/stats/contributors` en un repo que GitHub no ha crunchado hace poco, no obtienes datos. Obtienes un `202 Accepted` y un body vacío. GitHub te está diciendo: he empezado a calcularlo, vuelve a pedirlo en un rato.

Vale. Así que reintentas. Pero «en un rato» no es una cifra, y en un repo grande puede tardar. Un bucle de retry ingenuo o se rinde demasiado pronto en un repo lento, o machaca uno rápido. Así que el fetch hace backoff — 1, 2, 4, 8, 16 segundos, cinco intentos — y la mayoría de los repos se resuelven dentro de esa ventana.

La mayoría. No todos. Y este es el punto que me pidió una segunda pasada: una petición web síncrona no puede quedarse ahí esperando 30 segundos a que GitHub termine un cálculo. El navegador del visitante se rinde, y aunque aguantara, estarías reteniendo un worker de PHP como rehén por un job que no tiene nada que ver con la respuesta.

Así que cuando el backoff se agota y GitHub *sigue* devolviendo un 202, dejo de esperar en la petición y le paso el problema a una queue. Se dispatcha un job `RetryContributorStats` (5 intentos, backoff de 30 segundos), la página responde de inmediato con los datos parciales que tengo — marcados `partial: true` para que la UI pueda decir «calculando todavía» con honestidad — y cuando el job por fin trae las cifras reales, las mergea en el registro guardado. El visitante que preguntó nunca ve la espera. El que carga la página un minuto después ve la cosa terminada.

La lección no es sutil, pero es fácil saltársela cuando vas rápido: **cualquier cálculo externo que pueda durar más que la carga de una página pertenece a una queue, no al controller.** El 202 es GitHub avisándotelo educadamente de antemano. Yo simplemente no escuché la primera vez.

## Trampa dos: el muro del top 100

La segunda trampa es más silenciosa, porque no da error. `/stats/contributors` devuelve los 100 primeros contributors por número de commits. Si la persona que estás wrapeando es el contributor 101, el endpoint devuelve una respuesta limpia y correcta — y simplemente no está en ella. Sin flag, sin aviso. Tu código parece funcionar, y luego alguien lo prueba en `laravel/framework` con un contributor de media tabla y se lleva una página llena de ceros.

No hay un parámetro «dame el contributor 143». Así que el fallback es hacer a mano lo que el endpoint de stats habría hecho por ti: paginar los commits de ese usuario en el repo (`?author=username`), abrir cada uno, y sumar las adiciones y borrados a partir de los diffs de los commits individuales. Es un bucle N+1 y lo sé — una petición para listar, una por commit para los recuentos de líneas — así que está topado en 100 commits. No es perfecto. Pero «más o menos correcto para la cola larga» vale más que «cero con seguridad», y la alternativa era hacer como que el contributor 101 no existe.

Dejé en ese método un comentario que dice solo `// N+1 by design`. Algunos de los mejores comentarios son los que impiden que el tú-del-futuro «arregle» con ingenio algo que era un compromiso deliberado.

## El truco del primer commit

La quinta cifra — la fecha del *primer* commit de alguien — no tiene endpoint alguno. El enfoque obvio es paginar su historial de commits hasta el último del todo, lo que en un repo de larga vida son muchísimas peticiones para responder a «cuál es el más viejo».

El endpoint de commits de GitHub está paginado, y las respuestas paginadas llevan un header `Link` con `rel="first"`, `rel="prev"`, `rel="next"`, y — el útil — `rel="last"`. Así que: pide la lista de commits con `per_page=1`, lee la URL `rel="last"` del header, y apunta directa a la última página, que es el commit más viejo. Una petición para encontrar la página, otra para traerla. Sin recorrer el historial.

Me sentí como si me estuviera colando. Pero es solo leer las propias instrucciones de la API — la metadata de paginación estuvo ahí desde el principio, solo que nunca había tenido motivo para usar `rel="last"` para nada.

## El cache, porque la API tiene un presupuesto

El rate limit de GitHub es real y, con el fan-out de ese fallback del top 100, más cercano de lo que crees. Así que nada se recalcula si no tiene que hacerlo. Los resultados viven en dos capas: Redis con un TTL de una hora para el camino rápido, y Postgres durante 24 horas como copia duradera. Una petición mira Redis, luego Postgres, y solo un miss de verdad dispatcha el job de cálculo y deja al visitante en una página de loading que hace polling a un endpoint `/status` hasta que el registro pasa a `fresh`.

Encima de eso hay un rate limiter de token-bucket delante del propio cliente de GitHub — 10 peticiones por segundo, 4.500 por hora, trackeado en Redis. La decisión de la que menos seguro estoy vive aquí: si Redis está caído, el limiter *bypasea* en vez de bloquear. Logea un warning y deja pasar la petición. Elegí «la app sigue funcionando y quizá molesto a GitHub» por encima de «Redis tose y todo el sitio se va a un 500». Para un proyecto personal es la decisión correcta. Para algo con un radio de daño real, querría el default contrario, y creo que esa es la forma honesta de describir un compromiso — no «este es el patrón correcto» sino «esto es para lo que optimicé, y esto es cuándo lo cambiaría».

## El badge tenía que caber en un solo archivo

La parte de la que estoy calladamente más orgulloso es la tarjeta embebible. Pones esto en un README:

```markdown
![RepoWrapped](https://repo-wrapped.tom-girou.dev/card/laravel/framework/taylorotwell?theme=dark)
```

y obtienes un SVG que se muestra inline, al estilo shields.io, con `?theme=` y `?hide=` para controlarlo. La trampa de la que nadie te avisa: GitHub sirve las imágenes de README a través de su propio proxy de imágenes (Camo), y ese proxy trae tu SVG una vez, desde sus propios servidores, sin navegador y sin peticiones de seguimiento. Todo lo que tu SVG intente cargar — un avatar desde `avatars.githubusercontent.com`, una font externa, una segunda petición sea cual sea — no ocurre en silencio. Te queda una tarjeta con un agujero de imagen rota donde debería estar la cara.

Así que la tarjeta tiene que ser genuinamente autónoma. Es un template Blade renderizado con un content-type `image/svg+xml`, y antes de renderizar, el controller trae el avatar del contributor del lado del servidor y lo inlinea en base64 directamente dentro del SVG como data URI. Un archivo, ninguna dependencia externa, nada que el proxy pueda fallar en traer. Funciona como `<img src>` en cualquier parte, que es exactamente el sentido de un badge.

## El diseño, en breve

Te ahorro el repaso completo, pero el look es deliberado: un informe de terminal. Canvas casi negro, IBM Plex Mono, un único acento verde fósforo mantenido por debajo del cinco por ciento de la pantalla, la cifra grande de commits en blanco simple porque el dato es la estrella y no necesita vestirse. Sin orbes en gradiente, sin glassmorphism, sin falso chrome de ventana con sus puntitos tipo semáforo. Se lee como un CLI imprimiendo tus stats, lo que, para una herramienta pensada para gente que vive en un terminal, parecía la única opción honesta.

## Los trozos de los que no estoy orgulloso

Dos, en el espíritu de no escribir un folleto comercial.

Hay una rama de staleness en el servicio de cache que comenté y *rodeé* en vez de atravesarla — el controller hace su propia comprobación de frescura antes para que el código comentado nunca muerda, pero cualquiera que lea el servicio aislado se perdería, y «confuso pero correcto» es una deuda que aún le debo a ese archivo.

Y hay un bug de mayúsculas que conozco y no he arreglado: paso `owner` y `repo` a minúsculas antes de que toquen la clave de cache, pero no `username`. Así que `/u/laravel/framework/TaylorOtwell` y `/.../taylorotwell` son dos entradas de cache distintas y dos filas de base distintas para la misma persona. Todavía no ha causado problemas reales. Los causará seguro el día que alguien comparta una URL con mayúsculas distintas. Está anotado en las notas del proyecto justamente para que no se olvide — que es el estado honesto de la mayoría de los side-projects: una cosa que funciona con una lista corta de pecados que has decidido asumir por ahora.

## Para quedarse con

1. **La idea nunca es el trabajo.** «Spotify Wrapped para un repo» fue un fin de semana de UI. El proyecto de verdad fueron tres rarezas de un solo endpoint de GitHub. Cuando algo suena trivial, suele ser la fuente de datos la que esconde la ingeniería real.
2. **Un 202 es una instrucción de diseño.** Cuando una API te dice que necesita tiempo, esa es tu señal para sacar el trabajo del camino de la petición y ponerlo en una queue — no para reintentar más fuerte en el controller.
3. **Gestiona el hueco silencioso, no solo el error ruidoso.** El muro del top 100 no lanza nunca una excepción. Los fallos que no se anuncian son los que llegan a producción disfrazados de éxito.
4. **Autónomo vale más que ingenioso.** El badge funciona en todas partes porque no le pide nada a quien lo embebe. Un archivo, ningún fetch, ninguna sorpresa — esa restricción lo hizo robusto, no limitado.

Es [open source](https://github.com/Kaikina/repo-wrapped), Laravel 13 y PHP 8.3, con licencia MIT. Si lo apuntas a un repo tuyo y las cifras parecen correctas, esa exactitud discreta costó más que la página bonita. Suele ser así.
