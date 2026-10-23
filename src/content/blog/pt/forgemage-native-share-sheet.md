---
title: "Três strings e dois fallbacks: integrando a share sheet nativa ao Forgemage.net"
description: "O botão de compartilhar na página de detalhe de pedido do Forgemage.net abre a share sheet do sistema onde quer que o sistema operacional tenha uma — Android, iOS, Windows, macOS —, copia o link onde não tem, e fica quieto quando você simplesmente muda de ideia. Aqui está a implementação inteira: navigator.share com três strings, uma guarda de AbortError que deixa cair em vez de capturar, um fallback de clipboard com um fallback de execCommand por baixo, e o detalhe de uma letra no Symfony que decide se o link compartilhado funciona ou não."
pubDate: 2026-08-27
tags: ["JavaScript", "Web Share API", "Symfony", "Twig", "Progressive Enhancement"]
cover: ../_assets/forgemage-native-share-sheet.svg
ogImage: ../_assets/forgemage-native-share-sheet.png
coverAlt: "Um botão de compartilhar numa página web abrindo a share sheet do sistema operacional, com um caminho de cópia para o clipboard por baixo para navegadores que não têm sheet"
translationKey: "forgemage-native-share-sheet"
---

Todo app mobile tem aquele botão. Você toca, uma bandeja sobe da parte de baixo da tela, e lá estão WhatsApp, Mensagens, AirDrop, Notas, Discord, o que você tiver instalado. Durante anos essa bandeja foi território exclusivo do nativo, e a resposta da web era uma fileira de ícones de marcas abrindo `twitter.com/intent/tweet` numa nova aba.

Agora a bandeja está disponível para páginas web. `navigator.share()` abre exatamente a mesma sheet do sistema, e o caminho feliz são seis linhas.

Coloquei isso no ar semana passada no [Forgemage.net](https://forgemage.net), o marketplace de forjamagia de Dofus sobre o qual eu não paro de escrever desde que [tirei o N+1 da página de busca dele](/pt/blog/forgemage-search-n1-queries/). Um forjamago abre um pedido de forjamagia, quer mandar para um amigo que talvez pegue o trabalho, e até semana passada o único jeito de fazer isso era selecionar a barra de URL no celular. Agora tem um botão Compartilhar do lado do Arquivar.

As seis linhas foram a parte fácil. O que tomou a tarde foi tudo em volta delas: de onde vem a URL, o que acontece quando alguém arrasta a sheet para fechar, e o que o botão deve fazer num navegador cujo sistema operacional não tem share sheet nenhuma.

## A API é três strings e uma promise

**O que o navegador realmente te entrega?**

Não muito, e esse é o charme:

```js
await navigator.share({
    title: 'Magging Request Details',
    text: 'Someone wants a Gelano maged',
    url: 'https://forgemage.net/request/01JQ...',
});
```

Três strings opcionais, mais um array `files`. Sem SDK, sem app ID, sem dança de OAuth, sem script tag de uma empresa que adoraria fazer teste A/B na minha página por mim.

Mas tem dois requisitos rígidos. A página precisa ser um secure context, então HTTPS em produção e localhost enquanto você desenvolve. E a chamada precisa acontecer dentro de um gesto real do usuário. Não no `DOMContentLoaded`, não num `setTimeout` e — esse é o que pega as pessoas — não depois de um `await` que vai à rede. Busque um link curto na sua própria API e *só depois* chame `share()`, e a transient activation já era e o navegador te rejeita. Seja lá o que você for compartilhar, precisa estar em memória antes do clique.

## De onde vem a URL decide se o link funciona

**Por que não compartilhar simplesmente o `location.href`?**

Porque no Forgemage.net a barra de endereço nem sempre é a coisa que vale mandar. A rota de detalhe do pedido é localizada, então a mesma página mora em `/request/{ulid}` em inglês, `/requete/{ulid}` em francês e `/pedido/{ulid}` em espanhol. Vários dos pontos de entrada interessantes são views de dashboard cuja URL visível carrega um estado em query string de que ninguém mais precisa.

Então a URL vem do servidor, no markup:

```twig
<button type="button" class="rd-cta rd-cta--ghost rd-share"
        data-share-url="{{ url('app_request_detail', {'ulid': fmRequest.ulid}) }}"
        data-share-title="{{ 'Magging Request Details'|trans }}"
        data-copied-label="{{ 'Copied'|trans }}">
    <i class="bi bi-share-fill"></i>
    <span class="rd-share__label">{% trans %}Share{% endtrans %}</span>
</button>
```

O caractere importante ali é o `u` de `url()`. O `path()` do Symfony gera `/request/01JQ…`, que é perfeito para um `href` e inútil num payload de compartilhamento: colado no Discord não vira link, e um destino nativo não tem ideia de qual host colocar na frente. `url()` dá a forma absoluta. Uma letra de diferença entre uma feature que funciona e um bug report dizendo "o link não abre".

O resto dos atributos existe porque o JavaScript não alcança o translator do Twig. O label, a string de confirmação e o título do compartilhamento são renderizados no servidor dentro de `data-*` e lidos de volta na hora do clique. Um pouco feio, e a alternativa é mandar um catálogo de traduções para o cliente só para um botão conseguir dizer "Copiado" em três idiomas.

O ULID também faz um trabalho silencioso. A rota é `/{ulid:fmRequest}`, então os links compartilhados não são adivinháveis como ids sequenciais. Ninguém vai sair percorrendo `/request/1`, `/request/2` e ler a tabela inteira porque eu coloquei um botão de compartilhar na página.

## Uma única queda cobre todas as falhas

**O que acontece quando a sheet não abre?**

Este é o handler de compartilhamento inteiro, e o formato dele é a única decisão de verdade no arquivo:

```js
async function share(button) {
    const url = button.dataset.shareUrl || window.location.href;

    if (navigator.share) {
        try {
            await navigator.share({ title: button.dataset.shareTitle || document.title, url });

            return;
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
        }
    }

    if (await copyToClipboard(url)) {
        confirmCopy(button);
    }
}
```

Dois `return`s e nenhum `else`. O caminho de sucesso retorna, o caminho de cancelamento retorna, e todo o resto cai para fora do `if` e aterrissa no clipboard: nenhum `navigator.share`, um `NotAllowedError` por um gesto perdido, um `DataError` por uma URL que não faz parse, uma Permissions Policy bloqueando a chamada dentro de um iframe. Eu nunca precisei enumerar as falhas. Só precisei nomear os dois casos em que não fazer nada é o comportamento correto.

O `AbortError` é o que merece cuidado. É o que você recebe quando o usuário arrasta a sheet para fechar, e ele chega como uma promise rejeitada, idêntico a um problema real. Capture de forma genérica e você mostra "Falha ao compartilhar" para alguém que simplesmente mudou de ideia, o tipo de detalhe que faz um software parecer desatento. Cancelar é um resultado bem-sucedido de uma share sheet. Só não é um compartilhamento.

O outro ganho silencioso é no desktop, e não é o que eu esperava. A share sheet não é uma feature de celular: Chrome e Edge no Windows passam o payload para o painel de compartilhamento do Windows, e o Safari no macOS abre a mesma sheet que qualquer app de Mac recebe. O que decide é se o sistema operacional tem uma UI de compartilhamento e se o navegador se dá ao trabalho de ligá-la. O Linux não tem, então `navigator.share` é undefined e o meu próprio Chrome copia o link — o fallback foi o único caminho que eu vi na primeira hora construindo isso. O Firefox no desktop não implementa em lugar nenhum. Tudo isso é um `if` e nenhuma feature flag: o markup entrega um botão e cada navegador decide o que ele significa.

## O fallback tem um fallback

**Por que manter `document.execCommand('copy')` por aí em 2026?**

Porque o `navigator.clipboard` precisa de um secure context e de uma permissão que pode ser negada, e um botão de copiar que silenciosamente não faz nada é pior do que nenhum botão de copiar:

```js
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);

        return true;
    } catch {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();

        return copied;
    }
}
```

O truque do textarea fora da tela é deprecated, funciona em quase todo lugar e retorna um booleano com o qual eu consigo agir. Repare no `opacity: 0` com `position: fixed` em vez de `display: none` ou de um offset negativo: o campo precisa ser selecionável, então ele pode ser invisível mas não pode sumir, e não deve rolar a página quando entra. Ele também precisa sair no mesmo tick, senão um frame lento deixa um elemento focável de verdade no DOM para um leitor de tela encontrar.

Os dois caminhos retornam um booleano em vez de lançar exceção, e é por isso que o chamador se lê como um único `if` limpo.

## O botão precisa responder

**Como o usuário sabe que alguma coisa aconteceu?**

No caminho nativo ele sabe, porque o sistema operacional desenhou uma sheet por cima da página. No caminho do clipboard nada visível acontece, então o próprio botão avisa:

```js
function confirmCopy(button) {
    const label = button.querySelector('.rd-share__label');
    const icon = button.querySelector('i');
    const original = label.textContent;

    button.classList.add('is-copied');
    label.textContent = button.dataset.copiedLabel || 'Copied';
    icon.className = 'bi bi-check2';

    setTimeout(() => {
        button.classList.remove('is-copied');
        label.textContent = original;
        icon.className = 'bi bi-share-fill';
    }, 1800);
}
```

O ícone vira um check, o label vira o "Copiado" traduzido, e os dois voltam depois de 1,8 segundo. Sem biblioteca de toast, sem container de notificações, sem state store. O feedback vive no elemento que o usuário acabou de tocar, que é onde os olhos dele já estão.

Ler o `original` do DOM em vez de deixar "Share" hardcoded é o que torna a restauração correta em francês e em espanhol. E 1800 é um número que eu escolhi porque 1000 parecia cortado e 3000 parecia que o botão tinha travado.

## O que eu deixei de fora de propósito

**Por que não tem `text`, nem imagem?**

O payload é `title` e `url`, nada mais, e isso é proposital. A spec é explícita: os três campos são dicas. O app que recebe decide o que fazer com eles, e vários destinos aceitam exatamente um entre `text` e `url` e jogam o outro fora. Passar os dois é como você acaba com uma mensagem que descreve um pedido de forjamagia sem linkar para ele. Se o link é o que importa, mande o link.

O `title` também é ignorado na maior parte das vezes. O Chrome no Android usa como assunto para destinos de email e descarta no resto. Eu passo porque, quando ele é lido, é a string certa, e quando não é, nada se perde.

Arquivos seriam o próximo passo óbvio, já que uma página de detalhe de pedido tem um item e uma linha de stats que dariam um bom screenshot:

```js
if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
}
```

O `canShare()` é o único jeito honesto de descobrir se a plataforma aceita aquele MIME type e aquele tamanho, e ele chegou depois do próprio `share()`, daí a chamada opcional. Pulei tudo isso. Renderizar uma imagem no servidor, fazer prefetch dela antes do clique para o gesto do usuário sobreviver, e aceitar que várias plataformas ignoram `url` quando `files` está presente é uma feature, não um fallback. Fica para outra tarde.

O mesmo vale para a direção contrária. Uma PWA pode se registrar *dentro* da sheet com `share_target` no manifest e receber um POST multipart simples, que qualquer controller Symfony já sabe ler. Só Android, nada no iOS, e o Forgemage.net ainda não é instalável.

## As partes de que não me orgulho

**O que ainda está devendo?**

O link compartilhado bate num muro de login. `RequestController::detail()` chama `denyAccessUnlessGranted('ROLE_USER')`, então um amigo que toca no link sem ter conta cai numa página de login em vez do pedido. Correto para os dados, mas uma primeira impressão ruim para um link que alguém escolheu mandar. Uma view pública de teaser resolveria, e eu ainda não construí.

O locale vai junto. `url()` gera o path no locale de quem compartilha, então um forjamago francês compartilhando com um amigo espanhol manda `/requete/…`, e o app serve em francês. Compartilhar provavelmente pede uma URL canônica neutra em relação ao locale. Eu mando a localizada porque é o que o helper de rota te dá sem pensar no assunto.

O markup do botão existe duas vezes em `detail.html.twig`, uma em cada branch da condição dono/visitante, com os três atributos `data-*` duplicados. Deveria ser um componente ou um include recebendo o pedido. É um copy-paste, e eu percebi enquanto escrevia este parágrafo, não enquanto escrevia o template.

E não faço ideia se alguém usa. Nenhum evento, nenhum contador, nada. A versão honesta deste post começaria com um número em vez de uma história.

## Lições

1. **A restrição é o gesto, não a API.** `navigator.share()` são três strings, e o principal jeito de errar é dar `await` em outra coisa antes. Monte o payload antes do clique, ou compartilhe uma URL que você já tem.
2. **`AbortError` quer dizer "não, obrigado".** Trate uma sheet fechada como falha e o seu app vai dar bronca nas pessoas por mudarem de ideia. Dois `return`s no lugar certo, e todas as outras falhas podem dividir um único fallback.
3. **URLs absolutas ou nada.** No Symfony isso é `url()`, não `path()`. Um link relativo num payload de compartilhamento deixa de ser link no momento em que sai do navegador.
4. **Detecte a feature para mudar o comportamento do botão, não para escondê-lo.** Um único `<button>` no template abre a sheet do sistema no Android, iOS, Windows e macOS, e copia o link no Linux ou no Firefox, e ninguém nunca vê um controle que não faz nada.
5. **Renderize seus microtextos no servidor dentro de `data-*`.** O jeito mais barato de manter um label controlado por JS traduzido sem mandar um catálogo para o cliente.

Quarenta linhas de JavaScript e uma letra de Twig. Não vai aparecer em nenhum changelog que alguém leia. Mas um pedido que é encaminhado para o forjamago certo é um pedido que é feito, e até semana passada encaminhar um significava selecionar a barra de URL com o polegar. Essa é a feature inteira.
