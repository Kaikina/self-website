---
title: "Deixando PMs não técnicos consultarem a codebase em linguagem natural"
description: "Por que construí um analista de IA somente leitura que permite a gerentes de projeto fazer perguntas sobre uma codebase e ter um ticket no Jira criado automaticamente — e por que a coisa toda só funciona porque a IA pode ler, mas nunca escrever."
pubDate: 2026-06-29
tags: ["Claude", "Agent SDK", "Developer Tools", "Jira", "PrestaShop"]
cover: ../_assets/ai-codebase-portal-for-pms.svg
ogImage: ../_assets/ai-codebase-portal-for-pms.png
coverAlt: "Uma pergunta em linguagem natural entra em um analista de codebase somente leitura e sai como um ticket no Jira criado automaticamente"
translationKey: "ai-codebase-portal-for-pms"
---

Existe uma interrupção específica que todo dev de agência web conhece. Um gerente de projeto aparece na sua mesa segurando um email do cliente. "O cliente diz que o checkout está quebrado na loja dele. É bug de verdade? Onde está? É muito trabalho?" E você para o que está fazendo, troca todo o seu contexto mental pelo dele, vai garimpar uma codebase que talvez você não toque há três meses, e volta vinte minutos depois com uma resposta.

A resposta foi útil. Os vinte minutos saíram caros, e saíram caros para todo mundo: o PM esperou, você perdeu o fio da meada, e na próxima vez o ciclo começou de novo.

Esta é a história de uma ferramenta interna que construí para eliminar essa interrupção — um portal onde um gerente de projeto não técnico pode fazer uma pergunta sobre a codebase PrestaShop de um cliente em linguagem natural, receber uma resposta ancorada no código real e transformá-la num ticket do Jira bem estruturado sem nunca incomodar um dev. A parte interessante não é a caixa de chat. É a única restrição em torno da qual todo o design foi construído: **a IA pode ler tudo e não pode escrever nada.**

## O problema: os devs são a única ponte até o código

**Por que a codebase fica trancada atrás dos devs?** Numa agência que desenvolve módulos sob medida, a codebase é a fonte da verdade para uma quantidade enorme de perguntas do dia a dia. Esse comportamento é bug ou escolha de configuração? Quais arquivos um fix tocaria? O que o cliente está descrevendo é sequer possível do jeito que o código está estruturado? Sempre funcionou assim? Cada uma dessas respostas já está no repositório — mas ler código com fluência é uma habilidade de dev, e os gerentes de projeto que recebem os emails dos clientes e escrevem os tickets geralmente não sabem fazer isso. Então a codebase fica atrás de um vidro, e o único jeito de atravessar é pegar um dev. Esse é o gargalo de verdade: não uma ferramenta que falta, mas um tradutor que falta entre as pessoas que carregam as perguntas do cliente e o código que as responde.

E o gargalo custa mais do que a própria interrupção. Os tickets são escritos a partir de um resumo verbal vago em vez de a partir do código, então chegam magros: sem caminhos de arquivos, sem noção real de escopo. Aí o dev que pega o ticket semanas depois começa a investigação do zero — a mesma investigação que um colega já fez em pé na mesa de alguém, perdida porque ninguém anotou.

## O que eu realmente queria

**O que eu realmente queria que ela fizesse?** O objetivo era propositalmente estreito: deixar um PM fazer uma pergunta com as próprias palavras e receber duas coisas. A primeira é uma **resposta em linguagem natural ancorada no código real** — não um chute confiante, nem um genérico "é assim que o PrestaShop costuma funcionar", mas uma resposta que aponta para arquivos reais e linhas reais no repositório *deste* cliente, e que diz quando o código não sustenta de fato uma conclusão. A segunda é **essa mesma resposta registrada como um ticket real no Jira**, criado direto no Jira do projeto em vez de copiado e colado na mão: comportamento observado, causa suspeita, arquivos envolvidos, o que precisaria mudar. O PM aprova, a ferramenta cria o ticket, e a investigação sobrevive como um ticket decente em vez de evaporar no momento em que a conversa termina.

Consiga essas duas coisas de forma confiável e a interrupção do dev praticamente some, enquanto os tickets que chegam ao time de dev já vêm com uma vantagem em vez de partirem do zero.

## A ideia central: um analista somente leitura, não um assistente

**Por que não dar à IA nenhum poder de escrita?** A tentação com qualquer coisa agêntica é torná-la poderosa — deixar abrir pull requests, rodar comandos, consertar coisas. Fui com tudo na direção oposta, e essa decisão é a base sobre a qual todo o resto se apoia. A ferramenta pode **ler** a codebase e nada mais: ela abre arquivos, busca neles e consulta coisas, e essa é a lista inteira de verbos que ela tem. Ela não pode editar um arquivo, rodar um comando de shell nem mudar nada em lugar nenhum. O conjunto de ferramentas dela é uma allowlist explícita e curta, e tudo fora dessa lista é negado na fronteira, em vez de só desencorajado num prompt — o que é uma garantia bem diferente de pedir educadamente para um modelo não mexer nas coisas.

Essa falta de poder é justamente o ponto. Posso entregar essa ferramenta a um colega não técnico e dormir tranquilo, porque **o pior que ela pode fazer é errar** — e uma resposta errada é pega no momento em que um dev lê o ticket. Não existe caminho de "a IA entendeu algo errado" até "o repositório ficou num estado ruim", já que o repositório nunca foi gravável para começo de conversa. Poder significaria uma longa lista de modos de falha para me defender. Falta de poder significou que eu podia colocar em produção.

Quem acompanha o blog vai reconhecer o instinto. Num [post anterior sobre adicionar review por IA a um GitLab self-hosted](/pt/blog/claude-gitlab-ai-review/), a regra que sustentava tudo era *nunca deixar um modelo ler input não confiável e ter uma credencial privilegiada ao mesmo tempo.* Aqui é o mesmo princípio apontado para o outro lado: dê à IA o mínimo de poder que ainda permita que ela faça o trabalho, e a maioria dos cenários assustadores deixa de ser possível em vez de só ser mitigada.

## Como funciona, sem o encanamento

**Como ela conquista a confiança de um PM?** Algumas escolhas de design transformam "uma IA que lê código" em algo em que um PM pode realmente confiar, e todas elas são sobre confiança, não sobre capacidade bruta. Primeiro, ela trabalha numa cópia fresca e fiel do código: cada conversa analisa um checkout isolado do repositório do cliente, mantido atualizado em background para que a resposta reflita o que realmente está no projeto, e não um snapshot de quando alguém olhou pela última vez, e conversas diferentes nunca pisam umas nas outras. Quando a ferramenta diz "a linha 240 faz X", ela está falando do código real e atual. Ancoragem é toda a proposta de valor, então a cópia que ela lê precisa ser confiável. Além disso, ela é obrigada a citar e proibida de especular — ela ancora toda afirmação em arquivos que de fato leu, cita só algumas linhas em vez de despejar código em cima de alguém que não sabe ler código, e, a parte difícil, diz "o código não sustenta essa conclusão" em vez de inventar uma plausível. Para fatos externos, como uma versão do PrestaShop, o comportamento de uma biblioteca ou uma CVE, ela pesquisa em vez de confiar na própria memória.

A outra metade do design é sobre para onde a resposta vai. Ela é escrita para quem lê, não para o engenheiro: o público é um PM não técnico, então o output não é um walkthrough de código, e sim o impacto no negócio em linguagem simples, com o detalhe técnico disponível e fora do caminho. "Isso afeta todo cliente que usa cupom de desconto no checkout" funciona; "tem um off-by-one no loop das cart rules" não. Como essa resposta já tem formato de ticket — comportamento observado, causa suspeita, arquivos envolvidos, mudança proposta — o PM só aprova e a ferramenta cria a issue direto no Jira pela integração Rovo (MCP) da Atlassian, com os campos já preenchidos, sem redigitar nada num formulário. E tudo fica logado: cada pergunta, cada arquivo que a IA abriu, cada ticket que ela rascunhou. Em parte é boa higiene para qualquer coisa que mexe em código de cliente; em parte é para eu ver como a ferramenta é usada e onde as respostas dela erram.

## A parte que foi mais difícil do que eu esperava

**O que foi mais difícil do que o encanamento?** O encanamento — ler código, manter as cópias atualizadas, conversar com o Jira — foi a metade fácil. A metade difícil foi ensinar o analista a *não saber as coisas*. O modo de falha padrão de um modelo capaz não é dar branco; é responder com confiança mesmo assim. Pergunte onde está um bug e ele vai, todo feliz, raciocinar até um lugar que parece plausível, quer o código diga isso ou não. Para uma ferramenta cujo propósito inteiro é a *ancoragem*, esse é o único comportamento que a envenenaria: um PM não consegue distinguir uma resposta real, sustentada pelo código, de uma alucinação confiante — é exatamente por isso que ele usa a ferramenta — então uma resposta que *parece* ancorada mas não é é pior do que nenhuma resposta.

A maior parte da iteração foi puxar o analista em direção a "eu verifiquei, e o código não mostra isso" e para longe de "aqui vai uma teoria bem arrumadinha". Acertar essa calibração importou muito mais do que toda a engenharia ao redor. Uma ferramenta assim conquista confiança devagar e perde tudo de uma vez: na primeira vez que um PM age com base numa resposta confiante que acaba sendo inventada, ele para de acreditar nas próximas dez que estavam certas.

## O que mudou

**Mudou alguma coisa de verdade?** As interrupções caíram. Um PM que antes iria até a mesa de um dev agora pergunta primeiro ao portal, e na maioria das vezes a coisa termina aí. Quando não termina — quando a pergunta é sutil de verdade, ou a resposta exige um julgamento humano — o dev que é chamado começa de uma resposta real com referências reais a arquivos, e não de um frio "dá uma olhada nisso?". E os tickets melhoraram no caminho: eles chegam moldados pelo código real, com uma causa suspeita, os arquivos em jogo e uma noção de escopo. A investigação que antes acontecia verbalmente e depois sumia agora é escrita uma vez e levada para o trabalho.

Ela continua propositalmente pequena — uma ferramenta interna, só em localhost, com escopo pensado para que o pior caso continue pequeno enquanto ela conquista confiança. Essa restrição também é uma feature. Prefiro entregar algo estreito em que as pessoas confiam do que algo enorme de que elas têm medo.

## Lições

**O que levar daqui?**

1. **A ferramenta de IA mais útil costuma ser a menos poderosa.** Ser somente leitura é o que tornou seguro entregá-la a quem não é dev. Reduza os verbos ao necessário para o trabalho e a maioria dos modos de falha desaparece por construção.
2. **A ancoragem é o produto.** Para um analista voltado a pessoas que não conseguem checar o trabalho dele, "cite o arquivo ou diga que não sabe" é todo o valor, não um detalhe. Calibrar *isso* foi mais difícil do que toda a engenharia.
3. **Não substitua o dev; elimine a interrupção.** A ideia nunca foi automatizar julgamento. Foi responder as perguntas fáceis diretamente e passar as realmente difíceis para um dev que agora começa aquecido em vez de frio.
4. **Construa para quem não sabe ler código.** Traduza para impacto no negócio, estruture o output para o lugar onde ele vai viver, e a ferramenta deixa de ser um brinquedo de engenheiro e passa a ser algo que o time inteiro usa.

As pessoas acham que a parte esperta é o modelo ler uma codebase e explicá-la para alguém que não consegue. Talvez. A parte que realmente me importa é mais sem graça: ela lê, e nunca escreve. Essa é toda a história de segurança, e é por isso que durmo tranquilo com ela rodando em código de cliente.
