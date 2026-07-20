---
title: "Cada nuevo forjamago hacía la búsqueda más lenta: matar el N+1 detrás de Forgemage.net"
description: "El directorio de forjamagos de Forgemage.net lanzaba unas siete queries por tarjeta — reseñas, tiempo de respuesta, estado online, tres relaciones lazy — más contadores de facetas recalculados en cada cambio de filtro. Así pasé de una página de 24 tarjetas con ~168 queries a un puñado, con un cache batch scopeado a la request y una pasada paginate-then-hydrate, sin tocar las páginas de perfil individuales."
pubDate: 2026-07-20
tags: ["Symfony", "Doctrine", "PHP", "Performance", "N+1"]
cover: ../_assets/forgemage-search-n1-queries.svg
ogImage: ../_assets/forgemage-search-n1-queries.png
coverAlt: "Una página de búsqueda llena de tarjetas de perfil, cada tarjeta lanzando su propia query, que se reduce a una sola query batch para toda la página"
translationKey: "forgemage-search-n1-queries"
---

[Forgemage.net](https://forgemage.net) es un side-project mío: un marketplace para la forjamagia de Dofus, el craft in-game que consiste en encantar el equipo. Los jugadores publican lo que quieren magear, y los que hacen el mageo — los forjamagos — tienen un perfil público con reseñas, un tiempo de respuesta medio, un badge si se lo han ganado. El corazón del asunto es [el directorio](https://forgemage.net/s): una grid paginada de tarjetas de perfil que filtras por servidor, especialidad y valoración.

Esa página era rápida cuando yo era el único perfil en la base de datos. Se volvía un poco más lenta con cada registro. Sin error, sin timeout, nada que salte en una alerta — solo una página que tardaba más cada semana, como una habitación que se desordena sin que haya un solo día del que dirías que es el día en que se desordenó. Luego abrí el profiler de Symfony sobre una página llena de resultados y el número de queries me hizo soltar el café.

Esto cambia respecto a las [fontanerías de IA](/blog/markdown-for-agents/) de las que vengo hablando últimamente. Sin modelos, sin agentes. Solo Doctrine, una página de listing, y el bug de performance más viejo que existe, escondido en el sitio más aburrido que pudo encontrar.

## Una query por tarjeta es invisible hasta que las tarjetas se multiplican

**¿Por qué una página que iba bien empieza de golpe a arrastrarse?** Porque «bien» se medía contra tres perfiles, y el coste fue por perfil desde el principio.

Cada tarjeta del directorio muestra un pequeño montón de datos: si esta persona está activa recientemente, cuál es su valoración media, cuántos mageos ha completado, con qué rapidez responde, qué badge, qué servidores, qué especialidades. En la plantilla es limpio y legible — un puñado de funciones Twig, una por dato:

```twig
{% set smithmageActive = smithmage_active(smithmage.user) %}
{% set stats = get_forgemage_stats(smithmage.user) %}
{% set maggingsDoneCount = maggings_done_count(smithmage) %}
{% set answerTime = answer_time(smithmage.user) %}
```

Cada una de esas funciones era una extensión Twig que llamaba a un repository, y cada llamada era su propio `SELECT`. Cuatro queries por tarjeta antes de contar las relaciones. Después `smithmage.badge`, `smithmage.gameServers` y `smithmage.specialties` son asociaciones de Doctrine que nunca eager-loadeé, así que tocarlas en la plantilla lazy-loadeaba cada una bajo demanda — tres queries más por tarjeta.

Siete queries por tarjeta. La página muestra 24. Así que una sola vista de listing lanzaba algo por encima de 160 queries antes de que los contadores de facetas del sidebar tuvieran siquiera su turno. En mi laptop, contra una base casi vacía, son unos milisegundos y no te enteras de nada. En producción, contra una tabla que crece cada vez que la cosa de verdad funciona, es la definición misma del bug que llega en una fecha que tú no elegiste.

Lo más frustrante es que nada parece incorrecto. Cada función hace exactamente una cosa sensata. El N+1 no está en ninguna línea — está en el bucle que la plantilla enrolla alrededor de todas, y no puedes ver un bucle leyendo una sola tarjeta.

## El fix que parece obvio y rompe la paginación

**¿Por qué no hacer simplemente fetch-join de todo en la query de listing?** Ese es el reflejo, y para el badge — un simple many-to-one — está perfecto. Para `gameServers` y `specialties` revienta en silencio.

La query de listing está paginada: 24 filas con un `LIMIT`. En el momento en que haces fetch-join de una colección to-many sobre una query que tiene `setMaxResults()`, Doctrine ya no puede fiarse del limit. Un perfil con cuatro especialidades son cuatro filas en el result set, así que `LIMIT 24` ya no significa 24 perfiles — significa 24 filas, que igual son seis perfiles con las especialidades del último cortadas por la mitad. Doctrine lo sabe, por eso deja de aplicar el limit en SQL y pagina en memoria: carga *todas* las filas que matchean, hidrata el set entero, y luego te entrega la página uno. Acabas de convertir una query paginada en una carga de tabla completa para ahorrar unos cuantos round trips. Eso no es un fix, es una versión más grande del mismo problema.

Así que mantuve la query de listing flaca — selecciona los 24 perfiles que debe seleccionar y nada más — e hidrato las colecciones en una segunda pasada, scopeada exactamente a los ids que ya tengo:

```php
public function hydrateListingRelations(array $profiles): void
{
    if ($profiles === []) {
        return;
    }

    $ids = array_map(static fn (ForgemageProfile $p) => $p->getId(), $profiles);

    $this->createQueryBuilder('fp')
        ->addSelect('badge', 'gameServers', 'specialties')
        ->leftJoin('fp.badge', 'badge')
        ->leftJoin('fp.gameServers', 'gameServers')
        ->leftJoin('fp.specialties', 'specialties')
        ->where('fp.id IN (:ids)')
        ->setParameter('ids', $ids)
        ->getQuery()
        ->getResult();
}
```

Aquí no hay `LIMIT`, así que el fan-out es inofensivo — está acotado por los 24 ids que paso. Y nunca uso el valor de retorno. Parece un error hasta que sabes cómo funciona Doctrine: hidratar esas entidades tira de sus colecciones hacia el identity map del unit of work, y los objetos de perfil que la plantilla ya tiene son los *mismos* objetos. Cuando una tarjeta lee luego `smithmage.specialties`, el dato ya está en memoria. Sin query. El segundo `SELECT` las pagó todas de una vez.

Tres relaciones lazy a lo largo de 24 tarjetas — 72 queries — se convirtieron en una.

## Batchear las stats por tarjeta en un solo sitio

**¿Dónde pones las queries batcheadas para que las tarjetas las encuentren sin ir pasando estado por cada plantilla?** Le di a la request un objeto cuyo único trabajo es sostener las stats de esta página, calentado una vez y leído muchas.

Las relaciones eran la mitad fácil, porque el identity map de Doctrine te hace el cache. Las cuatro queries de stats no tuvieron esa suerte — son agregados (`AVG(rating)`, `COUNT` de mageos completados, una fila de tiempo de respuesta, una fila de estado online), no cargas de entidad, así que nada las deduplica gratis. Escribí un pequeño servicio, `ForgemageCardStatsCache`, que lanza cada agregado una vez para toda la página:

```php
public function warmForProfiles(array $profiles): void
{
    $users = /* deduplica los users detrás de estos perfiles */;

    $this->reviewStatsByUserId       = $this->reviewRepository->getForgemageStatsForUsers($users);
    $this->maggingsDoneCountByProfileId = $this->requestRepository->findMaggingsDoneCountForProfiles($profiles);
    $this->responseStatsByUserId     = $this->participantResponseStatsRepository->findByParticipants($users);
    // …estado online, misma forma

    $this->warmed = true;
}
```

Cada uno de esos métodos de repository es el gemelo batcheado de uno single-item existente: `getForgemageStats($user)` ganó un `getForgemageStatsForUsers($users)` que hace el mismo agregado con `WHERE reviewee IN (:users)` y un `GROUP BY`, devolviendo un map keyeado por user id. Misma query, lanzada una vez para la página en lugar de una vez por fila. El servicio de búsqueda llama a `warmForProfiles()` justo después de traer la página, y cuatro N+1 por tarjeta más se reducen a cuatro queries planas.

Un detalle que importa para la corrección: el servicio `implements ResetInterface`. Symfony llama a `reset()` entre requests, lo que vacía los maps calentados. Sin eso, un worker long-running le serviría alegremente a un visitante las stats cacheadas de otro visitante — el tipo de bug invisible en dev, donde cada request es un proceso fresco, y silenciosamente incorrecto el día que pones la app detrás de un runtime persistente.

## El fallback que mantiene honestas las páginas de un solo perfil

**¿Cómo batcheas la lista sin romper las páginas que renderizan un solo perfil?** Haces el cache batch opcional, y dejas el viejo camino single-item exactamente donde estaba.

Una página de perfil de detalle renderiza una tarjeta. Un dashboard renderiza una. Calentar un batch de página entera para eso sería una tontería, así que nada lo calienta ahí — y las funciones Twig tienen que lidiar con un cache que nunca se llenó. Le preguntan primero al cache y caen de vuelta a la llamada de repository original cuando vuelve vacío:

```php
public function maggingsDoneCount(ForgemageProfile $profile): int
{
    return $this->statsCache->getMaggingsDoneCount($profile)
        ?? $this->requestRepository->findMaggingsDoneCount($profile);
}
```

El directorio calienta el cache, así que las tarjetas le pegan. Todas las demás páginas lo dejan frío, así que esos `??` caen a la query que siempre estuvo ahí. Ninguna página tuvo un caso especial; el camino rápido es solo una pista que el camino lento no necesita.

Hay un sitio donde `??` no basta, y es mi trozo favorito de todo el cambio. Las stats de respuesta pueden ser legítimamente `null` — un forjamago que nunca ha tenido una conversación no tiene fila. Pero «no calentado» *también* quiere decir «ve a preguntarle al repository». Si ambos estados fueran `null`, un user realmente sin stats en el directorio caería a una query redundante, reintroduciendo en silencio el N+1 para exactamente la gente que el cache debía cubrir. Así que la señal de no-calentado es `false`, un valor que el resultado real nunca puede tomar:

```php
public function getResponseStats(User $user): ParticipantResponseStats|false|null
{
    if (!$this->warmed) {
        return false; // no calentado: el llamante debe caer al repo
    }

    return $this->responseStatsByUserId[$user->getId()] ?? null; // calentado, genuinamente sin fila
}
```

Los retornos de tres estados tienen mala fama, y a menudo se la merecen. Pero confundir «no lo sé» con «sé que no hay nada» es un bug real esperando su momento, y un tipo unión que dice `false|null` en voz alta es más honesto que un `null` que significa dos cosas distintas según quién pregunte.

## Los contadores de facetas no necesitan ser ciertos al segundo

**¿Por qué recalcular los números del sidebar en cada tecleo?** No hace falta, y yo lo hacía.

El sidebar de filtros muestra cuántos perfiles hay detrás de cada especialidad y cada badge. Son agregados `GROUP BY` sobre todo el conjunto elegible, y se recalculaban en cada request — así que cada vez que alguien alternaba un filtro, el servidor relanzaba los mismos conteos pesados para decirle «142 perfiles hacen equipo de Feca» cuando la respuesta honesta no se había movido en una hora. Los contadores de facetas son el caso de manual del ligeramente desactualizado: nadie se da cuenta, y nadie sale perjudicado, si el número tiene cinco minutos.

Así que pasan por el cache de Symfony con un TTL de cinco minutos, keyeado por la combinación de filtros que de verdad cambia la respuesta:

```php
$cacheKey = sprintf(
    'search_specialty_counts.%s.%s.%s',
    $gameServerId?->value ?? 'all',
    $superSmithmagusOnly ? 1 : 0,
    $minRating ? 1 : 0,
);

return $this->cache->get($cacheKey, function (ItemInterface $item) use (/* … */) {
    $item->expiresAfter(300);
    // …el agregado que corría cada vez
});
```

Construir bien la key es todo el juego. Olvídate de un filtro y sirves los contadores de un filtro bajo los de otro — un bug de cache que se parece exactamente a un bug de conteo y te hace perder una tarde antes de que se te ocurra revisar la key. Mete demasiado y el cache no hitea nunca. La regla a la que siempre vuelvo: la key tiene que nombrar cada input que cambia el resultado, y nada más.

## El check premium que simplemente borré

**¿Qué es más rápido que una query batcheada?** Ninguna query.

Uno de los lookups por tarjeta era un check de membresía premium, su propia llamada de repository por user para preguntar «¿es esta persona premium?». Pero la query del directorio ya eager-loadea la asociación de membresía por otras razones, así que la respuesta llevaba en memoria todo el rato — estaba pagando un round trip para ir a buscar algo que ya tenía. El fix era borrar la llamada de repository y leer el objeto:

```php
public function hasActivePremium(User $user): bool
{
    return $user->isPremium();
}
```

El detalle, y quiero ser honesto con esto: `hasActivePremium()` ahora asume en silencio que el llamante eager-loadeó esa asociación. En el directorio es cierto. Si alguna página futura llama a esto sin el eager-load, seguirá funcionando — Doctrine lazy-loadeará la relación — y habré reintroducido en silencio el N+1 que acabo de quitar, sin nada que me avise. Eso es acoplamiento de verdad. Cambié una query garantizada por una suposición, y la suposición no está escrita en ningún sitio que el compilador pueda ver. Dejé un comentario; un comentario no es un test.

## Las partes de las que no estoy orgulloso

**¿Qué queda a deber?** Un par de cosas, en el espíritu de no escribir un folleto.

El acoplamiento premium de arriba es el más ruidoso. Es correcto hoy y load-bearing sobre que exactamente una página esté configurada como toca.

La llamada a `warmForProfiles()` vive en el servicio de búsqueda, lo que significa que el batching solo ocurre porque ese único call site se acuerda de hacerlo. Cualquier página nueva que liste perfiles tiene que saber calentar el cache, o recupera en silencio el camino lento. El camino rápido es opt-in, y el performance opt-in es del que se pierde por accidente.

Y los cinco minutos de caducidad de las facetas son un número que elegí a ojo, no midiendo nada. Probablemente está bien. «Probablemente está bien» es una descripción honesta de la mayoría de los TTL, y prefiero decirlo a fingir que derivé 300 segundos de un dato que nunca recogí.

## Para llevarte

1. **El N+1 es un bug de crecimiento, no un bug de código.** Se lee bien, se revisa bien, y pasa cada test contra una fixture pequeña. Solo aparece contra el volumen de datos que significa que el producto funciona. Carga el profiler contra una página *llena*, no una fixture.
2. **Hacer fetch-join de un to-many con un `LIMIT` es una trampa.** Doctrine no puede paginar un result set fanned-out en SQL, así que lo hace en memoria — convirtiendo tu query paginada en una carga completa. Pagina la query flaca, y luego hidrata las colecciones en una segunda pasada keyeada por los ids que ya tienes.
3. **Batchea donde está el bucle, no donde está el dato.** Las tarjetas no pueden evitar ser un bucle. El fix pertenece un nivel más arriba, en un servicio que calienta las stats de toda la página una vez y las devuelve por id.
4. **Haz el camino rápido opcional y el camino lento el por defecto.** Un cache que las páginas de perfil no llenan, y funciones Twig que caen de vuelta cuando está frío, hicieron que la mejora no le costara nada a esas páginas — y a mí ningún caso especial.
5. **Una key que se olvida de un input es un bug que se parece a otro bug.** Lo más difícil de cachear los contadores de facetas no fue el cache. Fue nombrar cada filtro que cambia la respuesta, y nada que no la cambie.

Forgemage.net es una app Symfony en solitario que mantengo por un juego que me gusta. Este tipo de fix es el trabajo menos glamuroso que existe — sin feature, sin screenshot, nada que un user te vaya a agradecer jamás. Solo notarán que la página dejó de volverse más lenta. Normalmente es así como va.
