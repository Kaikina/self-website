---
title: "Dejar que jefes de proyecto no técnicos consulten la codebase en lenguaje natural"
description: "Por qué construí un analista de IA en modo solo lectura que permite a los jefes de proyecto hacer preguntas sobre una codebase y marcharse con un ticket listo para crear — y por qué todo funciona solo porque la IA puede leer pero nunca escribir."
pubDate: 2026-06-29
tags: ["Claude", "Agent SDK", "Developer Tools", "Jira", "PrestaShop"]
cover: ../_assets/ai-codebase-portal-for-pms.svg
ogImage: ../_assets/ai-codebase-portal-for-pms.png
coverAlt: "Una pregunta en lenguaje natural entra en un analista de codebase en solo lectura y sale como un ticket listo para crear"
translationKey: "ai-codebase-portal-for-pms"
---

Hay una interrupción que todos los devs de una agencia web conocen de memoria. Un jefe de proyecto aparece en tu escritorio con un email de cliente. «El cliente dice que el checkout está roto en su tienda. ¿Es un bug de verdad? ¿Dónde está? ¿Es un trabajo grande?» Y paras lo que estás haciendo, cambias todo tu contexto mental por el suyo, te vas a hurgar en una codebase que quizá no tocas desde hace tres meses, y vuelves veinte minutos más tarde con una respuesta.

La respuesta era útil. Los veinte minutos salían caros, y salían caros para todos: el PM esperó, tú perdiste el hilo, y la próxima vez el ciclo empieza de nuevo.

Esta es la historia de una herramienta interna que construí para eliminar esa interrupción — un portal donde un jefe de proyecto no técnico puede hacer una pregunta sobre la codebase PrestaShop de un cliente en lenguaje natural, obtener una respuesta anclada en el código real, y convertirla en un ticket de Jira bien formado sin molestar nunca a un desarrollador. Lo interesante no es la caja de chat. Es la única restricción alrededor de la cual está construido todo el diseño: **la IA puede leerlo todo y no escribir absolutamente nada.**

## El problema: los desarrolladores son el único puente hacia el código

En una agencia que desarrolla módulos a medida para sus clientes, la codebase es la fuente de verdad para una cantidad enorme de preguntas cotidianas. ¿Este comportamiento es un bug o una decisión de config? ¿Qué archivos tocaría un fix? ¿Lo que describe el cliente es siquiera posible según cómo está estructurado el código? ¿Siempre ha funcionado así?

Cada una de esas preguntas tiene una respuesta durmiendo en el repo. Pero leer código con fluidez es una habilidad de desarrollador, y los jefes de proyecto — los que gestionan los emails de cliente y redactan los tickets — por lo general no saben hacerlo. Así que la codebase está, en la práctica, detrás de un cristal. El único paso es agarrar a un dev.

Ese cuello de botella cuesta más que la interrupción en sí. Los tickets se redactan a partir de un resumen verbal vago en lugar de a partir del código, así que llegan flacos: sin rutas de archivos, sin una idea real del alcance. Luego el dev que retoma el ticket semanas después empieza la investigación desde cero — la misma investigación que un compañero ya hizo de pie junto a un escritorio, perdida porque nadie la escribió.

## Lo que de verdad quería

El objetivo era deliberadamente estrecho: dejar que un PM haga una pregunta con sus propias palabras y reciba dos cosas.

Primero, una **respuesta en lenguaje natural anclada en el código real.** No una suposición segura de sí misma, ni un genérico «así es como suele funcionar PrestaShop» — una respuesta que apunte a archivos reales y líneas reales en el repo de *este* cliente en concreto, y que lo diga cuándo el código no permite concluir de verdad.

Segundo, esa respuesta **con forma de ticket**: comportamiento observado, causa sospechada, archivos implicados, qué habría que cambiar. Lo bastante cerca para soltarla directamente en Jira, de modo que la investigación sobreviva.

Si lograba esas dos cosas de forma fiable, la interrupción del dev desaparece en gran parte, y los tickets que llegan al equipo arrancan con ventaja en lugar de partir de cero.

## La idea central: un analista en solo lectura, no un asistente

La tentación, con cualquier cosa agéntica, es hacerla potente — dejarla abrir pull requests, ejecutar comandos, arreglar cosas. Yo fui fuerte en la dirección contraria, y esa decisión es la base sobre la que se apoya todo lo demás.

La herramienta puede **leer** la codebase y nada más. Puede abrir archivos, buscar dentro de ellos y verificar cosas — y esa es toda la lista de verbos de la que dispone. No puede editar un archivo, ejecutar un comando de shell ni modificar nada en ningún sitio. Su conjunto de herramientas es una allowlist explícita y corta, y todo lo que queda fuera se rechaza en la frontera en lugar de desalentarse en un prompt.

Esa impotencia es justo el punto. Puedo confiar esta herramienta a un compañero no técnico sin perder el sueño, porque **lo peor que puede hacer es equivocarse** — y una respuesta errónea se atrapa en el segundo en que un dev lee el ticket. No existe ningún camino entre «la IA entendió mal algo» y «el repo está en mal estado», puesto que el repo nunca fue escribible de entrada. La potencia habría significado una larga lista de modos de fallo que defender. La impotencia, en cambio, me permitió lanzarla.

Los lectores habituales reconocerán el instinto. En un [artículo anterior sobre añadir review de IA a un GitLab self-hosted](/es/blog/claude-gitlab-ai-review/), la regla que lo sostenía todo era *nunca dejar que un modelo lea una entrada no confiable y sostenga un credential privilegiado al mismo tiempo.* Aquí es el mismo principio tomado al revés: dale a la IA el menor poder que aún le permita hacer su trabajo, y la mayoría de los escenarios que dan miedo dejan de ser posibles en lugar de quedar solo mitigados.

## Cómo funciona, sin la fontanería

Unas pocas decisiones de diseño convierten «una IA que puede leer código» en algo en lo que un PM puede de verdad apoyarse.

**Trabaja sobre una copia fresca y fiel del código.** Cada conversación analiza un checkout aislado del repo del cliente, mantenido al día en segundo plano para que una respuesta refleje lo que realmente hay en el proyecto en lugar de un snapshot de la última vez que alguien miró. Conversaciones distintas no se pisan. La idea es que cuando la herramienta dice «la línea 240 de este archivo hace X», habla del código real, actual — el anclaje es toda la propuesta de valor, así que la copia que lee tiene que ser de fiar.

**Está obligado a citar, y tiene prohibido especular.** El analista tiene la consigna de anclar cada afirmación en archivos que de verdad leyó, de citar solo unas pocas líneas en lugar de soltar código a alguien que no sabe leerlo, y — lo difícil — de decir «el código no permite concluir eso» en vez de inventar una causa plausible. Para hechos externos (una versión de PrestaShop, el comportamiento de una librería, una CVE) se le dice que los busque en lugar de fiarse de su propia memoria.

**Traduce, en lugar de explicar.** El público es explícitamente un jefe de proyecto no técnico. Así que la respuesta no es un recorrido por el código; es el business impact en lenguaje claro, con el detalle técnico disponible pero no atravesado en el camino. «Esto afecta a todos los clientes que usan un código de descuento en el checkout» da en el blanco; «hay un off-by-one en el bucle de las cart rules» no.

**Pasa el relevo limpiamente a Jira.** Como la respuesta ya está estructurada como un ticket — comportamiento observado, causa sospechada, archivos implicados, cambio propuesto — convertirla en un ticket de Jira real es un paso, no una reescritura. La investigación que se evaporaba de pie junto a un escritorio ahora se vuelve un ticket duradero, con las rutas de archivos ya dentro.

**Todo queda logueado.** Cada pregunta, cada archivo que la IA consultó, cada ticket que redactó queda registrado. En parte por higiene, para todo lo que toca código de cliente; en parte para que yo pueda ver de verdad cómo se usa la herramienta y dónde se tuercen sus respuestas.

## La parte más dura de lo que esperaba

La fontanería — leer el código, mantener las copias frescas, hablar con Jira — era la mitad fácil. La mitad difícil era enseñar al analista a *no saber* cosas.

El modo de fallo por defecto de un modelo capaz no es quedarse en blanco; es responder con seguridad de todos modos. Pregúntale dónde está un bug y razonará encantado hasta una ubicación que suena plausible, diga o no el código tal cosa. Para una herramienta cuya razón de ser es el *anclaje*, ese es el único comportamiento que la envenenaría. Un PM no sabe distinguir una respuesta real respaldada por el código de una alucinación segura de sí misma — precisamente por eso usa la herramienta — así que una respuesta que *suena* anclada sin estarlo es peor que ninguna respuesta.

El grueso de las iteraciones se fue en traer al analista hacia «lo comprobé, y el código no muestra eso» y alejarlo de «aquí tienes una teoría bien pulida». Calibrar eso bien importaba infinitamente más que toda la ingeniería de alrededor. Una herramienta así gana la confianza despacio y la pierde de golpe: la primera vez que un PM actúa sobre una respuesta segura que resulta inventada, deja de creer las diez siguientes que eran correctas.

## Lo que cambió

Las interrupciones bajaron. Un PM que habría ido a ver a un dev ahora le pregunta primero al portal, y la mayoría de las veces ahí se acaba. Cuando no — cuando la pregunta es de verdad sutil, o la respuesta pide un juicio humano — el dev al que se recurre parte de una respuesta real con referencias de archivos reales, no de un «¿le puedes echar un ojo?» en frío.

Y los tickets mejoraron. Llegan con la forma que les da el código real: una causa sospechada, los archivos en juego, una idea del alcance. La investigación que se hacía de palabra y luego desaparecía ahora se escribe una vez y se lleva hasta el trabajo.

Sigue siendo deliberadamente pequeña — una herramienta interna, solo en localhost, acotada para que el peor caso siga siendo pequeño mientras se gana la confianza. Esa restricción también es una feature. Prefiero lanzar algo estrecho en lo que la gente se apoya que algo enorme que les da miedo tocar.

## Para recordar

1. **La herramienta de IA más útil suele ser la menos potente.** El read-only es lo que hizo que la cosa fuera segura de confiar a no desarrolladores. Reduce los verbos a lo justo del trabajo y la mayoría de los modos de fallo desaparecen por construcción.
2. **El anclaje es el producto.** Para un analista dirigido a gente que no puede verificar su trabajo, «cita el archivo o di que no lo sabes» es todo el valor, no un detalle. Calibrar *eso* fue más duro que toda la ingeniería.
3. **No reemplaces al desarrollador; elimina la interrupción.** El objetivo nunca fue automatizar el juicio. Era responder directamente a las preguntas fáciles y pasar las verdaderamente difíciles a un desarrollador que ahora arranca en caliente en lugar de en frío.
4. **Diseña para el lector que no sabe leer código.** Traduce a business impact, estructura la salida para el sitio donde va a vivir, y la herramienta deja de ser un juguete para ingenieros y se convierte en algo que usa todo el equipo.

Se supone que lo ingenioso es el modelo leyendo una codebase y explicándosela a alguien que no sabe leerla. Quizá. La parte que de verdad me importa es más aburrida que eso: lee, y no escribe nunca. Esa es toda la historia de la seguridad, y por eso duermo tranquilo dejándola correr sobre código de cliente.
