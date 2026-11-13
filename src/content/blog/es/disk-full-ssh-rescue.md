---
title: "Mi disco llegó a cero y congeló el portátil. El setup SSH del móvil me dejó volver a entrar"
description: "Un disco lleno congeló mi portátil Linux: ratón muerto, teclado muerto, mis sitios self-hosted devolviendo error 500. El setup de Tailscale y Termius de julio aún me dejó entrar por SSH, y liberé casi 90 GB desde mi móvil antes de un reboot."
pubDate: 2026-11-13
tags: ["Tailscale", "SSH", "Termius", "Linux", "Docker"]
cover: ../_assets/disk-full-ssh-rescue.svg
ogImage: ../_assets/disk-full-ssh-rescue.png
coverAlt: "Un terminal que muestra un disco de 468 GB al 100 % con 158 MB libres, junto a un móvil con una sesión SSH de limpieza"
translationKey: "disk-full-ssh-rescue"
---

En julio escribí sobre [manejar Claude Code desde mi móvil](/es/blog/claude-code-from-my-phone/) con Tailscale y Termius. Lo vendía como una comodidad: retomar una sesión desde el sofá, revisar un container desde el tren. Esta mañana fue la única forma de entrar en mi propio ordenador.

## Menos de 1 MB libre

**¿Qué pasó?** Me levanto, paso por delante del escritorio camino del gimnasio y la pantalla está llena de avisos. Claude, Brave y alguno más, todos diciendo lo mismo: menos de 1 MB de espacio libre en disco, haz limpieza si quieres seguir usando tus apps.

Vale, justo. Cojo el ratón y el cursor no se mueve. El teclado, nada. El portátil está congelado.

Esta máquina también aloja cosas. El blog que estás leyendo corre en ella, y [Forgemage.net](https://forgemage.net) también, los dos salen por un Cloudflare Tunnel. Los abro en el móvil: error 500 en los dos. Una app que no puede escribir su caché no sirve páginas.

Después la pantalla pasa al logo de arranque, como si el portátil intentara reiniciar la sesión. Y se queda ahí. Ni pantalla de login, ni escritorio, ni forma de entrar desde el teclado.

## La puerta seguía abierta

**¿La máquina seguía respondiendo?** Me acuerdo del setup de julio. Termius en el móvil, toco el host, espero. Conecta. Un prompt, en un portátil cuyo teclado ya no responde.

Creo que sé por qué, aunque no lo investigué a fondo. Una sesión de escritorio escribe todo el tiempo (cachés, logs, su propio estado), y con el disco lleno ya no podía. Un login SSH por Tailscale casi no escribe nada. `tailscaled` seguía corriendo, respondió, y bash arrancó.

El primer comando confirmó el resto:

```
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  468G  444G  158M 100% /
```

158 MB libres en un disco de 468 GB.

## Limpiar desde el teclado del móvil

**¿Dónde se había ido el espacio?** Un `du` sobre mi home, ordenado por tamaño, y luego fui a por lo que se puede borrar sin pensarlo dos veces:

- el build cache de Docker: 24,5 GB
- la papelera: 6,1 GB
- `~/.cache` (JetBrains, Brave, Yarn, Composer y demás): unos 9 GB
- los volúmenes anónimos de Docker: 0,4 GB

Solo con eso, el disco volvió a tener 44 GB libres.

Casi todo lo que quedaba en volúmenes de Docker sin usar eran bases de datos, y borrar un volumen de base de datos significa reimportar un dump la próxima vez que abra ese proyecto. Así que repasé la lista una por una y solo borré siete, todos de proyectos en los que ya no trabajo. Otros 9,5 GB.

Luego, segunda ronda: la caché de Codeium, todos los worktrees de git cuyo ticket ya estaba mergeado, los logs de agentes de más de una semana, los archivos comprimidos de Descargas que ya había extraído, y la papelera otra vez.

Los worktrees fueron lo más delicado. Tengo uno por ticket, y un solo proyecto de cliente tenía 38. `git fetch` fallaba, porque mi clave SSH no está cargada en una sesión abierta desde el móvil, así que miré el estado de cada ticket en Jira y solo borré los que estaban terminados, mergeados o desplegados. Antes de borrar nada, guardé cada diff sin commitear en un tarball de 2,3 MB, por si acaso. Fueron 35 worktrees, unos 13 GB.

Con los archivos comprimidos, comparé el número de ficheros de cada zip con la carpeta extraída al lado. Una carpeta tenía 10.579 ficheros de 23.108. Ese zip se quedó.

Los logs de agentes pasaron de 3,1 GB a 789 MB. Codeium ocupaba 7,6 GB de los que me había olvidado por completo. Y solo el journal del sistema ocupaba unos 4 GB:

```bash
sudo journalctl --vacuum-size=200M
sudo apt clean
```

## Reiniciar desde el móvil

**¿Funcionó el reboot?** Con el disco respirando otra vez, escribí `sudo reboot` y vi cómo se cortaba la sesión SSH. Luego esperé, móvil en mano, sin saber muy bien qué me iba a encontrar.

A las 8:45 el portátil mostraba la pantalla de login, con teclado y ratón respondiendo. El blog y Forgemage.net volvieron con sus containers. `df` dice ahora 89 GB libres, frente a 158 MB.

## Segunda vez en diez días

**¿Por qué se llenó el disco?** No era el primer aviso. El 4 de noviembre ya había tenido que limpiar porque el disco estaba lleno. Nueve días después estaba lleno otra vez, y esta vez lo bastante como para tumbar el escritorio.

O sea, no es mala suerte. Builds de Docker todo el día, un pipeline de agentes escribiendo logs sin parar y un worktree nuevo por ticket llenan 468 GB más rápido de lo que habría pensado. Los arreglos son aburridos, y debería haberlos puesto en julio. Limitar el journal es un comando:

```bash
sudo sed -i 's/^#\?SystemMaxUse=.*/SystemMaxUse=200M/' /etc/systemd/journald.conf
sudo systemctl restart systemd-journald
```

Lo demás: un `docker builder prune` semanal, un cron que borre los logs viejos de agentes, borrar el worktree en cuanto su merge request se mergea, y una alerta en el móvil mucho antes del 100 %, cuando las apps todavía funcionan.

## Con qué me quedo

**¿Valió la pena el setup del móvil?** Lo monté por comodidad. Hoy fue la vía de rescate. El escritorio se había ido y el teclado no respondía, pero el demonio SSH seguía contestando porque necesita casi nada para funcionar. No lo había previsto.

Media hora de limpieza con el teclado del móvil no es divertida. Aun así, es mejor que abrir el portátil para sacar el SSD, o reinstalar desde un USB antes del primer café.

Ahora me voy al gimnasio. Tarde.
