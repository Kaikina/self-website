---
title: "Por qué desinstalé rtk: ahorrar tokens no compensa un grep equivocado"
description: "rtk reescribe los comandos de shell de un agente de IA para reducir su salida. En mi pipeline de Claude Code sin supervisión también convirtió un grep correcto en un cero rotundo, y el agente pasó la mañana pidiéndome que añadiera una configuración que ya estaba ahí."
pubDate: 2026-11-16
tags: ["Claude Code", "AI Agents", "Developer Tools", "Bash", "Workflow"]
cover: ../_assets/why-we-uninstalled-rtk.svg
ogImage: ../_assets/why-we-uninstalled-rtk.png
coverAlt: "Un terminal donde grep -c sobre un archivo de configuración imprime «🔍 0», junto al mismo archivo leído con jq que cuenta 18 entradas"
translationKey: "why-we-uninstalled-rtk"
---

Esta mañana mi pipeline de agentes me hizo la misma pregunta unas diez veces. En cada pasada, el bucle de triaje revisaba un archivo de configuración, no encontraba nada y escribía en mi resumen diario que seguía faltando una entrada y que tenía que añadirla.

La había añadido a las 09:23. El archivo tenía 18 líneas que coincidían. El agente no mentía, exactamente. Ejecutaba `grep`, `grep` decía cero y él se lo creía. El problema es que quien respondía no era realmente `grep`.

Así que desinstalé rtk. Te cuento por qué.

## Qué hace rtk

**¿Qué es rtk?** rtk, «Rust Token Killer», es un pequeño proxy de línea de comandos para agentes de código. Se conecta a Claude Code como hook `PreToolUse` y cada comando Bash del agente se reescribe por el camino: `git status` pasa a ser `rtk git status`, `grep` pasa a ser `rtk grep`, `cat` pasa a ser `rtk read`. rtk ejecuta el comando real y comprime la salida antes de que la vea el modelo. La promesa: entre un 60 y un 90 % menos de tokens en las operaciones habituales.

La promesa no es falsa. Un `git log` o un `ls` largo son casi todo ruido para un modelo, y el contexto es el recurso escaso en una sesión larga de agente. Lo instalé, me gustaba que `rtk gain` me dijera cuánto había ahorrado y, en uso interactivo, casi ni lo notaba.

Pero no trabajo solo en interactivo. Tengo un pipeline sin supervisión (el que mencioné en [el post del disco lleno](/es/blog/disk-full-ssh-rescue/)) que lee Jira y Gmail, me escribe un resumen por la mañana y lleva los tickets en cola hasta una merge request en borrador. Ejecuciones headless de `claude -p` con timers de systemd, sin nadie mirando la transcripción mientras se escribe. Ahí es donde falló.

## El cero que no era cero

**¿Qué se rompió exactamente?** Un trabajo del worker, en la tienda de un cliente, tenía que reproducir un bug de front en un navegador real. Yo había aceptado darle al worker las herramientas MCP de `chrome-devtools`, y la allowlist de `settings.worker.json` había recibido sus 18 entradas nuevas. El triaje tenía que darse cuenta y dejar de preguntar.

Esto es lo que ejecutó y lo que recibió:

```bash
$ /usr/bin/grep -c chrome-devtools config/settings.worker.json
🔍 0 for 'chrome-devtools'
```

El agente incluso llamó a `grep` por su ruta absoluta, como si intentara esquivar algo. El hook lo reescribió igual. La respuesta real:

```bash
$ jq -r '.permissions.allow[] | select(startswith("mcp__chrome"))' config/settings.worker.json | wc -l
18
```

Ese «🔍 0» llegó a mi resumen como un hecho: *chrome-devtools sigue faltando (0 ocurrencias, revisado de nuevo a las 09:35)*. Cada pasada lo volvía a comprobar, obtenía la misma respuesta y escribía la misma frase con una hora más reciente. Tanta comprobación hacía que el error pareciera más sólido.

## No era la primera vez

**¿Fue algo puntual?** No, y eso es lo que más me molesta. Repasando las notas del pipeline, el agente llevaba días peleándose con rtk y apuntando sus trucos para esquivarlo:

- El 11 de noviembre, un `grep "a\|b"` con alternancia devolvió 0 sin error. Tres preguntas que yo ya había respondido aparecieron como abiertas.
- Opciones como `-n`, `-E` o `-c` fallaban a veces con `error: unexpected argument '-n' found`, porque `rtk grep` solo acepta `PATTERN [PATH]`.
- El 15 de noviembre, `cat a.md b.md > informe.md` se reescribió como `rtk read`, que rechaza más de un archivo. Para entonces la shell ya había vaciado `informe.md`. Mi informe del día quedó en blanco y hubo que reconstruirlo desde una copia.
- `git -C <ruta> …` se convertía en `rtk git -C …`, que rtk rechazaba. Acabé escribiendo un wrapper `git.sh`, en parte para evitarlo.
- `ls` sobre varias carpetas lo mezclaba todo en una sola lista sin cabeceras, así que no se sabía qué archivo estaba dónde.

Ninguno de estos fallos es enorme por separado, y alguno quizá esté corregido en versiones más nuevas (yo usaba la 0.18.1). Lo que se acumula es el folclore. La memoria de mi agente tenía una nota entera titulada «trampas de rtk grep»: un patrón por grep, no fiarse nunca de un cero, concatenar con `tail -n +1` en vez de `cat`. El agente gastaba su atención en aprender las manías de una herramienta cuyo único trabajo era ahorrársela.

## Por qué las cuentas no salen con un agente

**¿Por qué no mantenerlo y tener cuidado?** Porque un token ahorrado solo vale algo si la respuesta sigue siendo correcta, y en muchos comandos la salida *es* la respuesta. Un `grep -c` que devuelve `0` no es ruido que comprimir. Es una pregunta de sí o no, y equivocarse sale más caro que 200 tokens de más.

Una persona que ve «🔍 0» en su terminal frunce el ceño y abre el archivo. Un agente solo a las 6 de la mañana no frunce nada. Escribe el cero en un informe, me pide que arregle algo que funciona y aparca un trabajo por ello. Sin supervisión, una reescritura transparente se vuelve silenciosa. No supe que `grep` no era `grep` hasta leer la transcripción en bruto.

Hubo un segundo coste, que solo vi cuando dejé de creerme el resumen. El worker sí había ejecutado el trabajo a las 09:31, con las herramientas del navegador cargadas y funcionando. Se había parado por otra razón: la URL de preproducción estaba guardada en las notas de otro ticket. La falsa historia de la «configuración que falta» tapó el bloqueo real durante una hora. La respuesta equivocada me costó más que los tokens que ahorró, y además me mandó a buscar en el sitio equivocado.

## Cómo lo quité

**¿Qué hizo falta para desinstalarlo?** Poca cosa, que es lo bueno del diseño con hook:

1. Quitar de `~/.claude/settings.json` el hook `PreToolUse` que llama a `rtk-rewrite.sh`.
2. Eliminar el include `@RTK.md` del `CLAUDE.md` global, para que nadie le diga al agente que use comandos de rtk.
3. Borrar `Bash(rtk git:*)` de la allowlist del pipeline.
4. Sustituir la memoria «trampas de rtk» del agente por una nota corta: rtk ya no está, `grep` y `cat` vuelven a comportarse con normalidad, y para JSON, `jq` de todas formas.

Después, un `sudo rm` sobre el binario, y listo.

## Lo que le diría a quien lo vaya a instalar

**¿Conviene usar rtk?** Si estás delante de la pantalla mirando al agente, puede que sí. El ahorro es real y verás pasar las salidas raras. Si algo corre sin supervisión, yo no pondría entre el agente y sus herramientas una capa que cambia lo que los comandos *significan*, y no solo cuánto imprimen. O, como mínimo, la mantendría lejos de todo lo que se lea como un sí o un no.

Prefiero pagar más contexto. Los tokens son baratos al lado de una mañana con un agente pidiéndome, muy seguro de sí mismo, que arreglara algo que no estaba roto.
