---
title: "Claude Code pelo celular: Tailscale, Termius e a máquina inteira no bolso"
description: "O /remote-control do Claude Code espelha uma sessão no seu celular. SSH via Tailscale te entrega a workstation inteira: retomar sessões, abrir novas em qualquer repo, acompanhar logs, reiniciar containers — sem nada exposto à internet."
pubDate: 2026-07-06
tags: ["Claude Code", "Tailscale", "SSH", "Android", "Workflow"]
cover: ../_assets/claude-code-from-my-phone.svg
ogImage: ../_assets/claude-code-from-my-phone.png
coverAlt: "Um celular mostrando uma sessão de terminal conectada a uma workstation Linux por uma rede mesh Tailscale, com um prompt SSH e uma sessão do Claude Code retomada"
translationKey: "claude-code-from-my-phone"
---

O Claude Code mudou o formato das minhas sessões de trabalho. Antes eu acompanhava as tarefas do começo ao fim; agora eu dou o pontapé inicial. Um refactor, um lote de traduções, um script de migração — eu descrevo o trabalho, o agente começa a trabalhar, e a verdade é que a minha presença no teclado deixa de importar por minutos a fio. É exatamente quando eu levanto. E aí estou na cozinha me perguntando se ele parou para me fazer uma pergunta de permissão quatro minutos atrás.

A resposta da Anthropic para isso é o `/remote-control`, e ele é bom. Mas eu vivia batendo na mesma parede, e a solução acabou sendo dois apps, uma flag e uma sessão tmux — nenhum serviço na nuvem, nenhuma porta exposta, nada de muito esperto. Minha workstation inteira agora cabe no bolso, e este post é o tutorial que eu queria ter lido antes de montar tudo.

## O que o `/remote-control` te dá, e onde ele para

**O que o `/remote-control` realmente te entrega?** Primeiro o crédito, porque a feature nativa é útil de verdade. Você digita `/remote-control` (ou `/rc`) numa sessão do Claude Code em andamento, escaneia um QR code, e essa sessão é espelhada no app do Claude no seu celular. A máquina em casa continua fazendo o trabalho — nada vai para a nuvem — e você conduz a conversa de onde estiver. Você até recebe push notifications quando o agente termina ou precisa de uma resposta. Para o problema do "será que ele parou para me perguntar alguma coisa", é a ferramenta certa e eu ainda uso.

Mas ele espelha *uma sessão*. Uma conversa, num repo, que você começou antes de sair da mesa. Do celular você não consegue dar `cd` em outro projeto. Não consegue checar por que um container Docker está comendo CPU. Não consegue abrir uma segunda sessão do Claude em outra codebase porque uma ideia te ocorreu no metrô. A feature responde a "me deixa conduzir o que já está rodando" e nada mais — o que é justo, esse é o trabalho dela. Meu problema é que, depois que consegui alcançar minha máquina do sofá, eu queria o resto da máquina também.

## O setup é dois apps e uma flag

**Do que você precisa para montar isso?** As peças: [Tailscale](https://tailscale.com) na workstation e no celular, e [Termius](https://termius.com) como cliente SSH no Android. O Tailscale cria uma rede mesh WireGuard privada entre seus dispositivos — seu notebook e seu celular acabam numa pequena rede virtual (uma "tailnet") que os acompanha pelo Wi-Fi, 4G, o que for. Sem port forwarding, sem DNS dinâmico, sem relay em VPS para manter.

O que me surpreendeu foi o pouco de setup necessário do lado do servidor, por causa de uma feature chamada Tailscale SSH. Este é o estado da minha workstation, um Dell Precision 3570 rodando Linux:

```bash
$ which sshd
# nothing
$ ss -tlnp | grep :22
# nothing
```

Não tem servidor OpenSSH instalado. Nada escuta na porta 22. E mesmo assim eu entro por SSH nessa máquina pelo celular todo dia. Tailscale SSH significa que o próprio `tailscaled` responde às conexões SSH que chegam pela interface da tailnet — o daemon termina a conexão, verifica quem você é com base na sua identidade na tailnet e te entrega um shell. Do lado da LAN, do lado da internet, de qualquer interface que não seja a tailnet, simplesmente não existe SSH com quem conversar.

Isso também acaba com a chatice de gerenciar chaves. A autenticação é "este dispositivo está logado na mesma tailnet que você" — sem `authorized_keys`, sem senhas, nada para rotacionar quando você troca de celular além de fazer login nele.

## Lado da workstation: um comando

**Como configurar a workstation?** Instale o Tailscale (pelo script deles ou pelo pacote da sua distro):

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Depois suba com SSH habilitado:

```bash
sudo tailscale up --ssh
```

Esse é o servidor inteiro. O `tailscale status` agora deve mostrar sua máquina e, quando o celular entrar, os dois:

```
100.71.141.2   tom-precision-3570  tom@  linux    -
100.112.88.16  s23-ultra-de-tom    tom@  android  active
```

Quem pode entrar por SSH em quê é decidido pela política de ACL da tailnet, no console de admin. Vale ler o padrão em vez de confiar nele:

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

`autogroup:self` significa que os dispositivos só podem entrar por SSH em máquinas do mesmo usuário — numa tailnet pessoal esse usuário é você, mas isso importa no dia em que você compartilhar a tailnet. E `"action": "check"` adiciona uma etapa que eu decidi manter: periodicamente, uma nova conexão SSH te obriga a se autenticar de novo num navegador antes de o shell abrir. Levemente irritante no celular. E também a diferença entre "alguém roubou meu celular desbloqueado" e "alguém roubou meu celular desbloqueado e ganhou um shell root na minha workstation".

## Lado do celular: Termius e quatro teclas especiais

**Por que Termius no celular?** Instale o app do Tailscale no celular, faça login na mesma tailnet, pronto — o celular agora é um peer na mesh. Qualquer cliente SSH funciona a partir daí, mas eu fiquei com o Termius por um motivo específico: a barra de teclas extras acima do teclado.

O Claude Code é uma interface de terminal, e interfaces de terminal assumem teclas que os teclados touch esqueceram. `Esc` interrompe o agente no meio do turno. `Shift+Tab` alterna os modos de permissão. `Ctrl+C`, setas para o histórico. O Termius deixa Esc, Ctrl, Tab e as setas a um toque de distância, e essa é a diferença entre realmente conduzir o Claude Code e só ficar vendo ele rolar a tela.

A entrada do host não tem nada de especial: endereço `tom-precision-3570` (o MagicDNS do Tailscale resolve os nomes das máquinas, então não tem IP para decorar), porta 22, meu usuário. O Termius insiste num método de autenticação, então dê qualquer chave — com o Tailscale SSH a autenticação de verdade já aconteceu na camada de rede, e o prompt do navegador do modo check cobre o resto. Aproveite que está nas configurações e ative o bloqueio biométrico do app no Termius. Seu celular agora é uma chave para a sua workstation; trate ele como tal.

## tmux, para que uma conexão caída não seja nada

**O que acontece quando a conexão cai?** Uma conexão SSH móvel vai cair. O elevador, o túnel do metrô, o Android decidindo que o Termius já teve tempo demais em background. E um shell SSH simples morre junto com a conexão — o processo remoto recebe um hangup e, se o Claude estava no meio de uma tarefa, o turno em andamento morre junto. O `claude --resume` recuperaria a conversa, mas não o trabalho que o agente estava fazendo quando a linha caiu.

O tmux elimina o problema em vez de só amenizá-lo. Na workstation, tudo roda dentro de um multiplexador que não liga se alguém está olhando:

```bash
tmux new -A -s phone
```

`-A` significa attach-or-create: a primeira conexão cria a sessão, todas as seguintes entram nela de novo. O sinal cai no túnel, o Termius reconecta trinta segundos depois, `tmux new -A -s phone` de novo — e o Claude continua lá, três tool calls à frente, sem ter percebido nada. E é a mesma sessão que você pode retomar na mesa amanhã com `tmux attach -t phone`.

Duas linhas no `~/.tmux.conf` deixam tudo confortável numa tela touch:

```
set -g mouse on
set -g history-limit 50000
```

O modo mouse faz o scrollback do tmux responder ao toque — dá para arrastar e rolar por tudo o que o agente fez enquanto você estava offline — e o Termius pode rodar a linha do `tmux new` por você como snippet de inicialização, então entrar na sessão vira uma propriedade da conexão, e não um hábito que você precisa lembrar.

## O que um shell completo libera

**O que um shell completo libera que o espelhamento não consegue?** A escada, mais ou menos na ordem em que eu subo numa noite qualquer:

**Retomar a sessão da mesa.** `cd` no projeto e `claude --resume` pega a conversa que eu deixei, exatamente onde estava. Só isso já substitui o `/remote-control` para mim na maioria dos dias.

**Abrir sessões novas em qualquer lugar.** Ideia no metrô → `cd ~/projects/whatever && claude`, sessão nova em folha num repo diferente. Sessões abertas pelo celular são sessões normais; amanhã na mesa, o `--resume` as traz para a tela grande.

**Perguntas pontuais sem a TUI.** `claude -p "what does the failing test in payments actually assert?"` imprime uma resposta e sai. Numa tela de celular, às vezes é tudo o que você queria.

**A própria máquina.** `docker compose logs -f` nos containers que servem este site, `git pull` num repo, um build disparado, espaço em disco conferido. Tudo o que você faria na mesa, menos a mesa.

**E o bônus que eu não esperava:** o celular não é só um cliente SSH, é um peer na rede. Rode `npm run dev -- --host` na workstation e o dev server fica acessível pelo *navegador* do celular em `http://tom-precision-3570:4321`. Sem túnel, sem port forwarding. Já revisei uma mudança de layout no próprio celular, pedi para o Claude ajustar e vi o hot reload atualizar a página na minha mão.

## Os limites, sendo honesto

**Onde esse setup deixa a desejar?** Dois, para não escrever um folheto de propaganda.

**A workstation precisa estar acordada.** É um notebook. Tampa fechada, ele suspende, e uma máquina suspensa não é um peer da tailnet. O meu fica quase sempre na dock com a suspensão desativada, mas se o seu dorme, é uma configuração para mudar antes de sair de casa, não depois.

**Digitar no vidro.** Conduzir um agente pelo celular é confortável, porque quem digita é o agente. *Editar* de verdade por SSH no celular é autoflagelação. Esse setup brilha justamente porque o Claude Code inverte a proporção — você manda instruções curtas, a máquina devolve paredes de trabalho.

## Segurança, em um parágrafo

**Quão exposto está tudo isso?** Nada nesse setup é acessível pela internet. Não tem porta aberta, nem endpoint público, nem mesmo um daemon SSH — a superfície de ataque é "ser um dispositivo na minha tailnet", que é exatamente a lista que eu controlo pelo console de admin e posso enxugar com um clique. O risco realista passou a ser o próprio celular, e é por isso que a reautenticação do modo check e o bloqueio do app no Termius continuam ligados, apesar do atrito. Compare com a resposta clássica — porta 22 exposta, fail2ban e fé — e isso não é só mais conveniente. É menos exposto do que aquilo que substituiu.

## Lições

**O que vale lembrar?**

1. **`/remote-control` e SSH não competem — são degraus.** Espelhe uma sessão quando é só disso que você precisa; deixe o shell completo para quando não for. Eu uso os dois na mesma noite.
2. **Tailscale SSH significa que não existe servidor para blindar.** Sem sshd, sem porta aberta, sem chaves. O servidor SSH é o daemon da mesh, e só a mesh consegue enxergá-lo.
3. **Um celular na sua tailnet é um peer completo da rede, não só um terminal.** Dev servers, dashboards, qualquer coisa ligada com `--host` está a uma URL de distância no navegador do celular.
4. **O tmux deixa o link móvel sem graça.** `tmux new -A -s phone` no início de toda conexão, e uma queda de sinal não muda nada — o agente continua trabalhando, você reconecta.

A coisa toda levou menos de meia hora, a maior parte mexendo no tamanho da fonte do Termius. E a mudança é a mesma que o Claude Code já fez na mesa, só que levada para fora: a máquina trabalha, você dirige. E no fim das contas, dirigir cabe numa tela de celular sem problema nenhum.
