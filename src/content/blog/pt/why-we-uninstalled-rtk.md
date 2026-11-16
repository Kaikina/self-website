---
title: "Por que desinstalei o rtk: economizar tokens não vale um grep errado"
description: "O rtk reescreve os comandos de shell de um agente de IA para encolher a saída. No meu pipeline de Claude Code sem supervisão, ele também transformou um grep correto num zero convicto, e o agente passou a manhã me pedindo para adicionar uma configuração que já estava lá."
pubDate: 2026-11-16
tags: ["Claude Code", "AI Agents", "Developer Tools", "Bash", "Workflow"]
cover: ../_assets/why-we-uninstalled-rtk.svg
ogImage: ../_assets/why-we-uninstalled-rtk.png
coverAlt: "Um terminal em que grep -c num arquivo de configuração mostra “🔍 0”, ao lado do mesmo arquivo lido com jq contando 18 entradas"
translationKey: "why-we-uninstalled-rtk"
---

Hoje de manhã meu pipeline de agentes me fez a mesma pergunta umas dez vezes. A cada passada, o loop de triagem conferia um arquivo de configuração, não achava nada e escrevia no meu resumo do dia que ainda faltava uma entrada e que eu precisava adicioná-la.

Eu tinha adicionado às 09:23. O arquivo tinha 18 linhas batendo. O agente não estava mentindo, exatamente. Ele rodava `grep`, o `grep` dizia zero e ele acreditava. O problema é que quem respondia não era bem o `grep`.

Então desinstalei o rtk. Explico por quê.

## O que o rtk faz

**O que é o rtk?** O rtk, “Rust Token Killer”, é um pequeno proxy de linha de comando para agentes de código. Você liga ele no Claude Code como hook `PreToolUse`, e todo comando Bash do agente é reescrito no caminho: `git status` vira `rtk git status`, `grep` vira `rtk grep`, `cat` vira `rtk read`. O rtk roda o comando de verdade e comprime a saída antes de o modelo ver. A promessa: de 60 a 90% menos tokens nas operações do dia a dia.

A promessa não é falsa. Um `git log` ou um `ls` comprido é quase só ruído para um modelo, e contexto é o recurso escasso numa sessão longa de agente. Instalei, gostava de ver o `rtk gain` dizendo quanto tinha economizado e, no uso interativo, quase nem percebia que ele estava lá.

Só que eu não trabalho só no interativo. Rodo um pipeline sem supervisão (o que mencionei no [post do disco cheio](/pt/blog/disk-full-ssh-rescue/)) que lê o Jira e o Gmail, me escreve um resumo de manhã e leva os tickets da fila até uma merge request em rascunho. Execuções headless de `claude -p` em timers do systemd, sem ninguém olhando a transcrição enquanto ela é escrita. Foi aí que deu errado.

## O zero que não era zero

**O que quebrou, afinal?** Um job do worker, na loja de um cliente, precisava reproduzir um bug de front-end num navegador de verdade. Eu tinha topado dar ao worker as ferramentas MCP do `chrome-devtools`, e a allowlist do `settings.worker.json` tinha ganhado suas 18 entradas novas. A triagem só precisava perceber isso e parar de perguntar.

Foi isto que ela rodou, e o que voltou:

```bash
$ /usr/bin/grep -c chrome-devtools config/settings.worker.json
🔍 0 for 'chrome-devtools'
```

O agente chegou a chamar o `grep` pelo caminho absoluto, como se tentasse contornar alguma coisa. O hook reescreveu mesmo assim. A resposta real:

```bash
$ jq -r '.permissions.allow[] | select(startswith("mcp__chrome"))' config/settings.worker.json | wc -l
18
```

Esse “🔍 0” chegou ao meu resumo como fato: *chrome-devtools continua faltando (0 ocorrências, conferido de novo às 09:35)*. Cada passada conferia de novo, recebia a mesma resposta e escrevia a mesma frase com um horário mais recente. De tanto ser conferido, o erro parecia mais confiável.

## Não foi a primeira vez

**Foi um caso isolado?** Não, e é isso que mais me incomoda. Relendo as notas do pipeline, o agente vinha brigando com o rtk havia dias e anotando os desvios pelo caminho:

- Em 11 de novembro, um `grep "a\|b"` com alternância devolveu 0 sem erro. Três perguntas que eu já tinha respondido apareceram como abertas.
- Opções como `-n`, `-E` ou `-c` às vezes falhavam com `error: unexpected argument '-n' found`, porque o `rtk grep` só aceita `PATTERN [PATH]`.
- Em 15 de novembro, `cat a.md b.md > relatorio.md` foi reescrito como `rtk read`, que recusa mais de um arquivo. A essa altura o shell já tinha zerado o `relatorio.md`. Meu relatório do dia ficou vazio e precisou ser refeito a partir de um backup.
- `git -C <caminho> …` virava `rtk git -C …`, que o rtk recusava. Acabei escrevendo um wrapper `git.sh` em parte para fugir disso.
- `ls` em várias pastas juntava tudo numa lista só, sem cabeçalhos, e não dava para saber qual arquivo estava onde.

Nenhum desses problemas é grande sozinho, e alguns talvez já estejam corrigidos em versões mais novas (eu estava na 0.18.1). O que acumula é o folclore. A memória do meu agente tinha uma nota inteira chamada “armadilhas do rtk grep”: um padrão por grep, nunca confiar num zero, concatenar com `tail -n +1` em vez de `cat`. O agente gastava atenção aprendendo as manias de uma ferramenta cujo único trabalho era economizar a atenção dele.

## Por que a conta não fecha para um agente

**Por que não manter e tomar cuidado?** Porque um token economizado só vale alguma coisa se a resposta continua certa, e em muitos comandos a saída *é* a resposta. Um `grep -c` que devolve `0` não é ruído a comprimir. É uma pergunta de sim ou não, e errar custa mais caro que 200 tokens a mais.

Uma pessoa que vê “🔍 0” no terminal franze a testa e abre o arquivo. Um agente sozinho às 6 da manhã não franze nada. Ele escreve o zero num relatório, me pede para consertar algo que funciona e estaciona um job por causa disso. Sem supervisão, uma reescrita transparente vira uma reescrita silenciosa. Eu só soube que o `grep` não era o `grep` lendo a transcrição bruta.

Teve um segundo custo, que só vi quando parei de acreditar no resumo. O worker tinha, sim, rodado o job às 09:31, com as ferramentas do navegador carregadas e funcionando. Ele tinha parado por outro motivo: a URL de homologação estava guardada nas notas de outro ticket. A falsa história da “configuração faltando” escondeu o bloqueio real por uma hora. A resposta errada me custou mais do que os tokens que economizou, e ainda me mandou procurar no lugar errado.

## Como eu removi

**O que foi preciso para desinstalar?** Pouca coisa, o que é uma vantagem do desenho com hook:

1. Tirar do `~/.claude/settings.json` o hook `PreToolUse` que chama o `rtk-rewrite.sh`.
2. Remover o include `@RTK.md` do `CLAUDE.md` global, para ninguém mais mandar o agente usar comandos do rtk.
3. Apagar `Bash(rtk git:*)` da allowlist do pipeline.
4. Trocar a memória “armadilhas do rtk” do agente por uma nota curta: o rtk saiu, `grep` e `cat` voltaram ao normal, e para JSON, `jq` de qualquer jeito.

Depois, um `sudo rm` no binário, e pronto.

## O que eu diria a quem for instalar

**Vale usar o rtk?** Se você está na frente da tela olhando o agente, talvez. A economia é real e você vai notar as saídas esquisitas. Se qualquer coisa roda sem supervisão, eu não colocaria entre o agente e as ferramentas dele uma camada que muda o que os comandos *significam*, e não só quanto eles imprimem. Ou pelo menos manteria essa camada longe de tudo cuja saída é lida como sim ou não.

Prefiro pagar a conta de contexto. Token é barato perto de uma manhã com um agente me pedindo, todo seguro de si, para consertar algo que não estava quebrado.
