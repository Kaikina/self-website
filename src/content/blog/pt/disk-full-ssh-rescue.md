---
title: "Meu disco chegou a zero e travou o notebook. O setup de SSH no celular me deixou entrar de novo"
description: "Um disco cheio travou meu notebook Linux: mouse morto, teclado morto, meus sites self-hosted dando erro 500. O setup de Tailscale e Termius de julho ainda me deixou entrar por SSH, e eu liberei quase 90 GB pelo celular antes de um reboot."
pubDate: 2026-11-13
tags: ["Tailscale", "SSH", "Termius", "Linux", "Docker"]
cover: ../_assets/disk-full-ssh-rescue.svg
ogImage: ../_assets/disk-full-ssh-rescue.png
coverAlt: "Um terminal mostrando um disco de 468 GB em 100 % com 158 MB livres, ao lado de um celular com uma sessão SSH de limpeza"
translationKey: "disk-full-ssh-rescue"
---

Em julho eu escrevi sobre [usar o Claude Code pelo celular](/pt/blog/claude-code-from-my-phone/) com Tailscale e Termius. Eu vendi aquilo como conforto: retomar uma sessão do sofá, olhar um container do trem. Hoje de manhã foi o único jeito de entrar no meu próprio computador.

## Menos de 1 MB livre

**O que aconteceu?** Acordei, passei pela mesa a caminho da academia e a tela estava coberta de avisos. Claude, Brave e mais alguns, todos dizendo a mesma coisa: menos de 1 MB de espaço livre em disco, faça uma limpeza se quiser continuar usando seus apps.

Justo. Peguei o mouse e o cursor não mexeu. O teclado, nada. O notebook estava travado.

Essa máquina também hospeda coisas. O blog que você está lendo roda nela, e o [Forgemage.net](https://forgemage.net) também, os dois saem por um Cloudflare Tunnel. Abri os dois no celular: erro 500 nos dois. App que não consegue escrever o próprio cache não serve página.

Depois a tela foi para o logo de boot, como se o notebook tentasse reiniciar a sessão. E ficou lá. Sem tela de login, sem desktop, sem jeito de entrar pelo teclado.

## A porta ainda estava aberta

**A máquina ainda respondia?** Lembrei do setup de julho. Termius no celular, toco no host, espero. Conectou. Um prompt, num notebook cujo teclado não respondia mais.

Acho que sei por quê, mesmo sem ter ido a fundo. Uma sessão de desktop escreve o tempo todo (caches, logs, o próprio estado), e com o disco cheio ela não conseguia mais. Um login SSH pelo Tailscale quase não escreve nada. O `tailscaled` continuava rodando, respondeu, e o bash subiu.

O primeiro comando confirmou o resto:

```
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  468G  444G  158M 100% /
```

158 MB livres num disco de 468 GB.

## Limpando pelo teclado do celular

**Para onde tinha ido o espaço?** Um `du` no meu home, ordenado por tamanho, e depois fui atrás do que dá para apagar sem pensar duas vezes:

- o build cache do Docker: 24,5 GB
- a lixeira: 6,1 GB
- `~/.cache` (JetBrains, Brave, Yarn, Composer e companhia): uns 9 GB
- os volumes anônimos do Docker: 0,4 GB

Só com isso o disco voltou a ter 44 GB livres.

Quase tudo o que sobrava em volumes do Docker sem uso era banco de dados, e apagar um volume de banco significa reimportar um dump na próxima vez que eu abrir aquele projeto. Então revisei a lista um por um e só apaguei sete, todos de projetos em que não trabalho mais. Mais 9,5 GB.

Depois, segunda rodada: o cache do Codeium, todo worktree git cujo ticket já estava mergeado, logs de agentes com mais de uma semana, arquivos compactados em Downloads que eu já tinha extraído, e a lixeira de novo.

Os worktrees deram mais trabalho. Eu mantenho um por ticket, e um único projeto de cliente tinha 38. O `git fetch` falhava, porque minha chave SSH não está carregada numa sessão aberta pelo celular, então olhei o status de cada ticket no Jira e só removi os que estavam concluídos, mergeados ou em produção. Antes de apagar qualquer coisa, salvei cada diff não commitado num tarball de 2,3 MB, por via das dúvidas. Foram 35 worktrees, uns 13 GB.

Nos arquivos compactados, comparei o número de arquivos de cada zip com a pasta extraída ao lado. Uma pasta tinha 10.579 arquivos de 23.108. Esse zip ficou.

Os logs de agentes caíram de 3,1 GB para 789 MB. O Codeium ocupava 7,6 GB que eu tinha esquecido completamente. E só o journal do sistema ocupava uns 4 GB:

```bash
sudo journalctl --vacuum-size=200M
sudo apt clean
```

## Reiniciando pelo celular

**O reboot funcionou?** Com o disco respirando de novo, digitei `sudo reboot` e vi a sessão SSH cair. Depois esperei, celular na mão, sem saber direito o que ia encontrar.

Às 8h45 o notebook mostrava a tela de login, com teclado e mouse respondendo. O blog e o Forgemage.net voltaram junto com os containers. O `df` agora mostra 89 GB livres, contra 158 MB.

## Segunda vez em dez dias

**Por que o disco encheu?** Não era o primeiro aviso. Em 4 de novembro eu já tinha feito uma limpeza porque o disco estava cheio. Nove dias depois estava cheio de novo, e dessa vez a ponto de derrubar o desktop.

Ou seja, não é azar. Builds de Docker o dia inteiro, um pipeline de agentes escrevendo logs sem parar e um worktree novo para cada ticket enchem 468 GB mais rápido do que eu imaginava. As correções são chatas, e eu devia ter feito isso em julho. Limitar o journal é um comando:

```bash
sudo sed -i 's/^#\?SystemMaxUse=.*/SystemMaxUse=200M/' /etc/systemd/journald.conf
sudo systemctl restart systemd-journald
```

O resto: um `docker builder prune` semanal, um cron que apague os logs antigos de agentes, remover o worktree assim que o merge request for mergeado, e um alerta no celular bem antes dos 100 %, enquanto os apps ainda funcionam.

## O que fica

**O setup do celular valeu a pena?** Montei por conforto. Hoje foi a rota de resgate. O desktop tinha ido embora e o teclado não respondia, mas o daemon SSH continuava atendendo porque precisa de quase nada para rodar. Eu não tinha planejado isso.

Meia hora de limpeza no teclado do celular não é divertido. Ainda assim, é melhor do que abrir o notebook para tirar o SSD, ou reinstalar por um pendrive antes do primeiro café.

Agora vou para a academia. Atrasado.
