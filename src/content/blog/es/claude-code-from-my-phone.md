---
title: "Claude Code desde mi móvil: Tailscale, Termius y toda la máquina en el bolsillo"
description: "El /remote-control de Claude Code refleja una sesión en tu móvil. SSH sobre Tailscale te da toda la workstation: retomar sesiones, lanzar otras nuevas en cualquier repo, seguir logs, reiniciar containers — sin exponer nada a internet."
pubDate: 2026-07-06
tags: ["Claude Code", "Tailscale", "SSH", "Android", "Workflow"]
cover: ../_assets/claude-code-from-my-phone.svg
ogImage: ../_assets/claude-code-from-my-phone.png
coverAlt: "Un móvil mostrando una sesión de terminal conectada a una workstation Linux a través de un mesh de Tailscale, con un prompt SSH y una sesión de Claude Code retomada"
translationKey: "claude-code-from-my-phone"
---

Claude Code cambió la forma de mis sesiones de trabajo. Antes me quedaba sentado durante las tareas; ahora las lanzo. Un refactoring, un lote de traducciones, un script de migración — describo el trabajo, el agente se pone a triturar, y lo honesto es admitirlo: mi presencia en el teclado deja de importar durante minutos enteros. Que es exactamente cuando me levanto. Y ahí estoy, en la cocina, preguntándome si se paró a hacerme una pregunta de permisos hace cuatro minutos.

La respuesta de Anthropic a esto se llama `/remote-control`, y es buena. Pero en mi caso chocaba siempre contra el mismo muro, y la solución acabó siendo dos apps, un flag y una sesión de tmux — sin servicio cloud, sin puerto expuesto, nada ingenioso. Toda mi workstation cabe ahora en mi bolsillo, y este post es el how-to que me habría gustado leer antes de montarlo por mi cuenta.

## Lo que `/remote-control` te da, y dónde se queda corto

**¿Qué te deja hacer de verdad `/remote-control`?** Primero el crédito que merece, porque la feature integrada es útil de verdad. Escribes `/remote-control` (o `/rc`) en una sesión de Claude Code en marcha, escaneas un QR, y esa sesión se refleja en la app de Claude de tu móvil. La máquina de casa sigue haciendo el trabajo — nada se va a la nube — y tú diriges la conversación desde donde estés. Hasta recibes notificaciones push cuando el agente termina o necesita una respuesta. Para el problema de «¿se habrá parado a preguntarme algo?», es la herramienta correcta y la sigo usando.

Pero refleja *una sesión*. Una conversación, en un repo, que arrancaste antes de dejar el escritorio. Desde el móvil no puedes hacer `cd` a otro proyecto. No puedes mirar por qué un container de Docker se está comiendo la CPU. No puedes abrir una segunda sesión de Claude en otra codebase porque te vino una idea en el tren. La feature responde a «déjame dirigir lo que ya está corriendo» y nada más — lo cual es justo, ese es su trabajo. Mi problema es que, una vez que podía llegar a mi máquina desde el sofá, no paraba de querer el resto de la máquina.

## El setup: dos apps y un flag

**¿Qué necesitas para montar esto?** Las piezas: [Tailscale](https://tailscale.com) en la workstation y en el móvil, y [Termius](https://termius.com) como cliente SSH en Android. Tailscale construye un mesh WireGuard privado entre tus dispositivos — tu portátil y tu móvil acaban en una pequeña red virtual (un «tailnet») que los sigue a todas partes: Wi-Fi, 4G, lo que sea. Sin port forwarding, sin DNS dinámico, sin VPS de relay que mantener.

Lo que me sorprendió es lo poco que hay que montar en el lado servidor, gracias a una feature llamada Tailscale SSH. Este es el estado de mi workstation, una Dell Precision 3570 con Linux:

```bash
$ which sshd
# nada
$ ss -tlnp | grep :22
# nada
```

No hay servidor OpenSSH instalado. Nada escucha en el puerto 22. Y aun así entro por SSH a esta máquina desde el móvil todos los días. Tailscale SSH significa que el propio `tailscaled` responde a las conexiones SSH que llegan por la interfaz del tailnet — el daemon termina la conexión, comprueba quién eres contra tu identidad del tailnet, y te entrega una shell. Desde la LAN, desde internet, desde cualquier interfaz que no sea el tailnet, simplemente no hay SSH con quien hablar.

Eso también mata la tarea de gestionar claves. La autenticación es «este dispositivo está logueado en el mismo tailnet que tú» — sin `authorized_keys`, sin contraseñas, nada que rotar cuando estrenas móvil más allá de iniciar sesión.

## Lado workstation: un comando

**¿Cómo configurar la workstation?** Instala Tailscale (su script, o el paquete de tu distro):

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Y levántalo con SSH activado:

```bash
sudo tailscale up --ssh
```

Ese es todo el servidor. `tailscale status` debería mostrar ya tu máquina, y cuando el móvil se una, las dos:

```
100.71.141.2   tom-precision-3570  tom@  linux    -
100.112.88.16  s23-ultra-de-tom    tom@  android  active
```

Quién puede hacer SSH a qué lo decide la política de ACL del tailnet, en la consola de administración. El valor por defecto merece leerse en vez de fiarse:

```json
"ssh": [
  {
    "action": "check",
    "src":    ["autogroup:member"],
    "dst":    ["autogroup:self"],
    "users":  ["autogroup:nonroot", "root"]
  }
]
```

`autogroup:self` significa que un dispositivo solo puede hacer SSH a máquinas del mismo usuario — en un tailnet personal eres tú, pero importa el día que compartas el tailnet. Y `"action": "check"` añade un paso que decidí conservar: periódicamente, una conexión SSH nueva te obliga a re-autenticarte en un navegador antes de abrir la shell. Ligeramente molesto en un móvil. También es la diferencia entre «me robaron el móvil desbloqueado» y «me robaron el móvil desbloqueado y consiguieron una shell root en mi workstation».

## Lado móvil: Termius y cuatro teclas especiales

**¿Por qué Termius en el móvil?** Instala la app de Tailscale en el móvil, entra en el mismo tailnet, listo — el móvil ya es un peer del mesh. A partir de ahí vale cualquier cliente SSH, pero yo acabé en Termius por una razón concreta: su barra de teclas extra encima del teclado.

Claude Code es una UI de terminal, y las UI de terminal dan por hechas teclas que los teclados táctiles olvidaron. `Esc` interrumpe al agente a mitad de turno. `Shift+Tab` rota los modos de permisos. `Ctrl+C`, flechas para el historial. Termius pone Esc, Ctrl, Tab y las flechas a un toque, y esa es la diferencia entre dirigir Claude Code de verdad y limitarte a verlo hacer scroll.

La entrada del host no tiene nada de especial: dirección `tom-precision-3570` (el MagicDNS de Tailscale resuelve los nombres de máquina, así que no hay IP que recordar), puerto 22, mi username. Termius insiste en tener un método de autenticación, así que dale cualquier clave — con Tailscale SSH la autenticación real ya ocurrió en la capa de red, y el prompt del navegador del modo check cubre el resto. Activa el bloqueo biométrico de Termius mientras estás en los ajustes. Tu móvil ahora es una llave de tu workstation; trátalo como tal.

## tmux, para que un corte de conexión sea un no-evento

**¿Qué pasa cuando se cae la conexión?** Una conexión SSH móvil se va a cortar. El ascensor, el túnel del tren, Android decidiendo que Termius ya tuvo bastante tiempo en segundo plano. Y una shell SSH a pelo muere con su conexión — al proceso remoto le cuelgan, y si Claude estaba a mitad de tarea, el turno en curso muere con él. `claude --resume` recuperaría la conversación, pero no el trabajo que el agente estaba haciendo cuando se cortó la línea.

tmux elimina el problema en vez de suavizarlo. En la workstation, todo corre dentro de un multiplexor al que le da igual si alguien está mirando:

```bash
tmux new -A -s phone
```

`-A` significa attach-or-create: la primera conexión crea la sesión, todas las siguientes vuelven a entrar en ella. La cobertura cae en el túnel, Termius se reconecta treinta segundos después, `tmux new -A -s phone` otra vez — y Claude sigue ahí, tres tool calls más adelante, sin haberse enterado. Es además la misma sesión que puedes retomar mañana desde el escritorio con `tmux attach -t phone`.

Dos líneas de `~/.tmux.conf` lo hacen cómodo en una pantalla táctil:

```
set -g mouse on
set -g history-limit 50000
```

El modo ratón pone el scrollback de tmux a responder al tacto — deslizas para repasar lo que el agente hizo mientras estabas offline — y Termius puede lanzar la línea de `tmux new` por ti como snippet de arranque, para que reengancharse sea una propiedad de la conexión y no un hábito que recordar.

## Lo que desbloquea una shell completa

**¿Qué desbloquea una shell completa que el reflejo no puede?** La escalera, más o menos en el orden en que la subo una tarde cualquiera:

**Retomar la sesión del escritorio.** Un `cd` al proyecto y `claude --resume` reabre la conversación que dejé, exactamente donde estaba. Solo esto ya sustituye a `/remote-control` para mí casi todos los días.

**Lanzar sesiones donde sea.** Idea en el tren → `cd ~/projects/whatever && claude`, sesión nueva en otro repo. Las sesiones lanzadas desde el móvil son sesiones normales; mañana en el escritorio, `--resume` las sube a la pantalla grande.

**Preguntas one-shot sin la TUI.** `claude -p "¿qué comprueba exactamente el test que falla en payments?"` imprime una respuesta y sale. En una pantalla de móvil, a veces eso era todo lo que querías.

**La máquina en sí.** `docker compose logs -f` sobre los containers que sirven este sitio, un `git pull` en un repo, un build lanzado, el espacio en disco comprobado. Todo lo que harías en el escritorio, menos el escritorio.

**Y el bonus que no vi venir:** el móvil no es solo un cliente SSH, es un peer de la red. Lanza `npm run dev -- --host` en la workstation y el servidor de dev queda accesible desde el *navegador* del móvil en `http://tom-precision-3570:4321`. Sin túnel, sin port forwarding. Ya he revisado un cambio de layout en el propio móvil, le he dicho a Claude que lo ajustara, y he visto el hot reload actualizar la página en mi mano.

## Los límites, con honestidad

**¿Dónde se queda corto este setup?** Dos, en el espíritu de no escribir un folleto.

**La workstation tiene que estar despierta.** Es un portátil. Con la tapa cerrada se suspende, y una máquina suspendida no es un peer del tailnet. La mía vive casi siempre en el dock con la suspensión desactivada, pero si la tuya duerme, ese es un ajuste que cambiar antes de salir de casa, no después.

**Teclear sobre cristal.** Dirigir un agente desde el móvil es cómodo, porque el que teclea es el agente. *Editar* de verdad por SSH desde el móvil es autocastigo. Este setup brilla precisamente porque Claude Code invierte la proporción — tú mandas instrucciones cortas, la máquina devuelve muros de trabajo.

## La seguridad, en un párrafo

**¿Qué tan expuesto está todo esto?** Nada de este setup es alcanzable desde internet. No hay puerto abierto, ni endpoint público, ni siquiera un daemon SSH — la superficie de ataque es «ser un dispositivo de mi tailnet», que es exactamente la lista que controlo desde la consola de administración y que puedo podar en un clic. El riesgo realista se movió al propio móvil, y por eso la re-autenticación del modo check y el bloqueo de Termius siguen activados a pesar de la fricción. Compáralo con la respuesta clásica — puerto 22 expuesto, fail2ban y esperanza — y esto no es solo más cómodo. Está menos expuesto que lo que sustituye.

## Para llevarse

**¿Qué conviene recordar?**

1. **`/remote-control` y SSH no compiten — son peldaños.** Refleja una sesión cuando con eso basta; guarda la shell completa para cuando no. Uso los dos en la misma tarde.
2. **Tailscale SSH significa que no hay servidor que endurecer.** Sin sshd, sin puerto abierto, sin claves. El servidor SSH es el daemon del mesh, y solo el mesh lo ve.
3. **Un móvil en tu tailnet es un peer de red completo, no solo un terminal.** Servidores de dev, dashboards, todo lo que esté bindeado con `--host` queda a una URL del navegador del móvil.
4. **tmux hace aburrido el enlace móvil.** `tmux new -A -s phone` al empezar cada conexión, y un corte de cobertura no cambia nada — el agente sigue trabajando, tú te reenganchas.

Todo el montaje llevó menos de media hora, la mayor parte trasteando con los tamaños de fuente de Termius. Y el cambio es el mismo que Claude Code ya hizo en el escritorio, extendido hacia fuera: la máquina trabaja, tú diriges. Resulta que dirigir cabe perfectamente en una pantalla de móvil.
