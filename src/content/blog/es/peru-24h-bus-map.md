---
title: "En el Perú los buses nunca duermen: 24 horas de tráfico interprovincial en un mapa"
description: "Mapeé todos los buses y trenes interprovinciales que pude encontrar para un miércoles en el Perú: 1 659 salidas de bus y 37 trenes. La hora más cargada son las 11 p. m., dos de cada tres viajes pasan por Lima, y la sierra y la selva reciben menos de lo que les toca."
pubDate: 2026-11-02
tags: ["Data Visualization", "Open Data", "Python", "Peru", "Side Project"]
cover: ../_assets/peru-24h-bus-map.png
ogImage: ../_assets/peru-24h-bus-map.png
coverAlt: "Mapa oscuro del centro y sur del Perú a las 23:00, con 1 035 puntos ámbar de buses a lo largo de la costa y por los Andes"
translationKey: "peru-24h-bus-map"
draft: false
---

Hace poco circuló un video en LinkedIn: todos los trenes de Francia durante 24 horas, animados sobre un mapa. Quise lo mismo para el Perú.

Pero el Perú casi no tiene trenes de pasajeros entre ciudades. Tiene buses. Miles, operados por cientos de empresas, y ningún horario público que los cubra a todos. Así que el mapa de abajo costó más escarbar que dibujar.

<figure class="embed">
  <iframe src="/embeds/peru-24h/index.html?embed&amp;lang=es" title="Mapa animado de un día de buses y trenes interprovinciales en el Perú" loading="lazy" allow="fullscreen"></iframe>
  <figcaption>Un miércoles, 11 de noviembre de 2026. Arrastra para moverte, Ctrl + rueda (o dos dedos) para hacer zoom, pasa el cursor por un punto para ver su ruta. El botón ⛶ abre pantalla completa.</figcaption>
</figure>

## Qué muestra el mapa

**¿Qué estoy mirando?** Cada punto ámbar es un bus y cada punto azul, un tren. Avanzan por las carreteras y vías reales, a las horas que publican las empresas. El reloj va de medianoche a medianoche, y los buses que salen en la noche y llegan a la mañana siguiente aparecen en ambos extremos del día, así que el ciclo se lee como un día típico y no como un arranque en frío a las 00:00.

Hay 1 659 salidas de bus y 37 trenes. Al final cuento de dónde salen los datos. Primero, lo que me sorprendió.

## El país viaja de noche

**¿El tráfico se detiene en algún momento?** No. Esperaba que el mapa se calmara después de medianoche, como pasa con la mayoría de mapas de transporte de países europeos. Pasa lo contrario. El mínimo de buses en ruta es a la 1 p. m. (412). El máximo, a las 11 p. m. (1 035).

El Perú sale de noche. El 46 % de las salidas ocurre entre las 6 p. m. y la medianoche, y solo la franja de las 8 p. m. tiene 178. Seis de cada diez viajes siguen rodando cuando el reloj pasa la medianoche.

Tiene sentido apenas miras las distancias. El viaje mediano en los datos es de 422 km y dura 8,6 horas. Lima–Arequipa son 1 002 km y unas 17 horas y media. Si sales a las 8 p. m., duermes en el asiento, te ahorras una noche de hotel y llegas con el día entero por delante. Lo sabía en teoría. Ver mil puntos despertarse al atardecer es otra cosa.

## Una larga línea por la costa

**¿Por dónde va realmente el tráfico?** Sobre todo por la Panamericana. Desde Tumbes, en la frontera con Ecuador, hasta Camaná, la costa es un rosario continuo de buses que solo voltea hacia el interior rumbo a Arequipa y Tacna. El 87 % de los viajes toca una ciudad costera, y la mitad nunca sale de la costa.

Y luego está Lima. El 63 % de los viajes empieza o termina ahí, y la capital tiene buses directos a 115 lugares distintos. Solo Lima–Trujillo tiene 115 salidas un miércoles. De noche, si entrecierras los ojos frente a la animación, se nota: la costa es una faja transportadora con Lima en el medio.

## El sur: lejos, pero no olvidado

**¿Tacna y Puno están tan aisladas como parecen?** Solo a medias. Mi primera impresión fue que el sur está mal atendido: Tacna y Puno parecen islas al fondo del mapa. Los números dicen algo más preciso.

Por habitante, tienen más o menos tantos buses como las grandes ciudades de la costa norte. Tacna tiene 77 viajes al día para unos 286 000 habitantes, casi la misma proporción que Trujillo. Puno, más pequeña, tiene 68. Lo que les falta es la conexión con Lima. Solo 10 buses al día van de Lima a Tacna, y el viaje dura 21 horas para 1 224 km. Lima–Puno son 4 buses y más de 23 horas.

En cambio, el sur tiene su propia red. Las conexiones más frecuentes de Tacna son Arequipa (26 viajes) e Ilo (20). Las de Puno, Cusco (33) y Arequipa (25). Solo el 13 % de los viajes de Tacna y el 6 % de los de Puno tienen que ver con Lima. Se ven aisladas en el mapa porque sus buses se reparten en mil kilómetros de carretera, no porque nadie vaya.

## La sierra y la selva reciben menos de lo que les toca

**¿La sierra está realmente desconectada?** Compara dos viajes de la misma longitud. Lima–Trujillo, 557 km por la costa: 115 buses. Lima–Ayacucho, 568 km hacia la sierra: 24.

Para ir más lejos, clasifiqué cada localidad por región natural: sierra por encima de los 2 000 m, y luego costa o selva según el lado de los Andes en que esté (Arequipa, a 2 300 m, cuenta como sierra). El censo de 2017 ubica al 58 % de los peruanos en la costa, al 28 % en la sierra y al 14 % en la selva. Los extremos de viaje de mis datos se reparten en 69 %, 24 % y 7 %.

La sierra está un poco por debajo de su peso. La selva recibe la mitad del suyo. Y las ciudades de la sierra cuelgan sobre todo de la capital, no unas de otras: el 73 % de los viajes de Ayacucho van o vienen de Lima, el 70 % de los de Huaraz, el 65 % de los de Huancayo. Hay 437 viajes costa–sierra en los datos y solo 156 que unen dos ciudades andinas.

La selva está peor. Pucallpa, una de las ciudades más grandes de la Amazonía, tiene 10 buses al día, 9 de ellos a Lima, y tardan 17 horas en recorrer 768 km. Eso es 45 km/h de promedio. Iquitos ni aparece en el mapa: no llega ninguna carretera. Se va en avión o pasando días en una lancha, y dejé fuera aviones y embarcaciones a propósito.

Así que mi primera impresión se sostiene para la sierra y la selva, con una salvedad que merece su propia sección.

## Lo que el mapa no ve

**¿Cuánto confiar en estos números?** Más para la costa que para el resto. Las grandes empresas cuyos horarios pude leer son muy costeras: 624 de sus viajes van a ciudades de la costa, 155 a la sierra y 45 a la selva. Todo lo demás sale de las autorizaciones del Estado, que se quedan cortas (más sobre eso abajo). Además, buena parte de los viajes andinos y amazónicos se hace en combis, colectivos y empresas locales pequeñas que no publican nada. Juliaca muestra solo 10 viajes, lo que es claramente falso para una ciudad de ese tamaño: muchos buses a Puno paran ahí, pero yo solo registro dónde empieza y termina cada viaje.

Civa, una de las grandes empresas nacionales, tampoco está en el scraping porque su sitio bloquea los accesos automatizados. Solo aparece a través de sus autorizaciones.

Todo eso empuja en la misma dirección: la sierra y la selva reales tienen más movimiento que el mapa. Parte de la brecha son mis datos. No sabría decir cuánto.

## Cómo está hecho

**¿De dónde se sacan horarios de buses del Perú?** No hay un feed GTFS de buses interprovinciales en el Perú ni un dataset abierto de rutas. Lo que hay es papeleo. Cada empresa necesita una autorización de ruta del Ministerio de Transportes (MTC), y esas autorizaciones se publican en PDF en gob.pe. Cada una indica el itinerario, los días de la semana y los horarios de salida autorizados.

El primer paso fue un scraper para el listado de gob.pe (1 649 documentos), luego `pdftotext` y un parser para las dos plantillas que el ministerio ha usado con los años. 1 146 autorizaciones salieron con un horario utilizable. 181 eran imágenes escaneadas, y las dejé de lado en vez de pasarlas por OCR.

El segundo paso llegó después de una mala sorpresa. Las autorizaciones dicen lo que una empresa *puede* operar, y las grandes operan mucho más. Cruz del Sur tenía 6 salidas los miércoles en sus autorizaciones y 199 en su propia web. Así que para ocho empresas grandes (Cruz del Sur, Oltursa, Movil Bus, Ittsa, Emtrafesa, Transportes Línea, Flores y PerúBus) leí sus páginas públicas de búsqueda de pasajes para el miércoles 11 de noviembre. Un mismo bus suele venderse como varios pasajes, uno por par de ciudades y por terminal de Lima, así que hubo que volver a juntar esos resultados en buses únicos, por número de viaje o por hora de salida. Eso dio 824 buses. Las autorizaciones de todas las demás empresas sumaron 835.

Lo demás es fontanería. Las 759 localidades se geocodifican sin conexión con GeoNames. Las carreteras vienen de OpenStreetMap, con un servidor OSRM local para las rutas, y cuando una empresa no publica hora de llegada, el viaje toma el tiempo en auto × 1,20, la proporción mediana que medí en 654 viajes que tienen ambos datos. Los trenes son el horario de PeruRail tipeado a mano y dibujado sobre las vías férreas de OpenStreetMap. El mapa en sí es deck.gl sobre MapLibre con un mapa base de CARTO, y la versión en video se renderiza cuadro por cuadro en un Chromium headless y se une con ffmpeg.

Un error que vale la pena contar: la primera versión le pedía al router trazados de carretera *simplificados*, más o menos un punto cada 30 km. En la costa nadie lo habría notado. En los Andes, los puntos cortaban en línea recta a través de las curvas, y las líneas dibujadas eran en promedio un 11 % más cortas que las carreteras reales (Lima–Huancayo se dibujaba con 270 km para una carretera de 304 km). La geometría completa lo arregló.

Construí casi todo en unas cuantas sesiones con Claude Code, que se encargó de buena parte del trabajo pesado de scraping y parsing mientras yo decidía qué mirar. El widget de arriba es una página estática servida desde este sitio con su propia política de seguridad de contenido: nada se carga desde fuera, salvo las teselas del mapa.

## Conclusiones

**¿Qué me enseñó un día de buses?**

1. **La red interprovincial del Perú tiene más movimiento de noche.** El punto más bajo es a la hora del almuerzo, y aun así hay 400 buses en ruta.
2. **Es una costa con Lima en el medio.** Dos de cada tres viajes tocan la capital, y la Panamericana lleva casi todo lo demás.
3. **La distancia no es aislamiento.** Tacna y Puno están lejos de Lima, pero bien conectadas con Arequipa y Cusco. Los lugares realmente mal atendidos están en la sierra y la selva.
4. **Los datos oficiales dicen lo que está permitido, no lo que pasa.** Las autorizaciones dejaban fuera el 97 % de los buses de Cruz del Sur. Sin las webs de las propias empresas, este mapa mostraría un país mucho más vacío.

Si conoces las carreteras del Perú y algo aquí te parece mal, me interesa saberlo. Los puntos valen lo que valen los horarios que hay detrás.
