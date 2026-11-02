---
title: "No Peru, os ônibus nunca dormem: 24 horas de tráfego intermunicipal em um mapa"
description: "Mapeei todos os ônibus e trens intermunicipais que consegui encontrar para uma quarta-feira no Peru: 1.659 partidas de ônibus e 37 trens. O horário mais movimentado é 23h, duas viagens em cada três passam por Lima, e os Andes e a Amazônia recebem menos do que a sua parte."
pubDate: 2026-11-02
tags: ["Data Visualization", "Open Data", "Python", "Peru", "Side Project"]
cover: ../_assets/peru-24h-bus-map.png
ogImage: ../_assets/peru-24h-bus-map.png
coverAlt: "Mapa escuro do centro e do sul do Peru às 23h, com 1.035 pontos âmbar de ônibus ao longo da costa e pelos Andes"
translationKey: "peru-24h-bus-map"
draft: false
---

Um vídeo circulou no LinkedIn recentemente: todos os trens da França ao longo de 24 horas, animados em um mapa. Eu quis a mesma coisa para o Peru.

Só que o Peru quase não tem trens de passageiros entre cidades. Tem ônibus. Milhares, operados por centenas de empresas, e nenhum horário público que cubra todos. Então o mapa abaixo deu mais trabalho de garimpo do que de desenho.

<figure class="embed">
  <iframe src="/embeds/peru-24h/index.html?embed&amp;lang=pt" title="Mapa animado de um dia de ônibus e trens intermunicipais no Peru" loading="lazy" allow="fullscreen"></iframe>
  <figcaption>Uma quarta-feira, 11 de novembro de 2026. Arraste para mover, Ctrl + roda (ou dois dedos) para dar zoom, passe o mouse sobre um ponto para ver a rota. O botão ⛶ abre em tela cheia.</figcaption>
</figure>

## O que o mapa mostra

**O que eu estou vendo?** Cada ponto âmbar é um ônibus, cada ponto azul é um trem. Eles andam pelas estradas e trilhos reais, nos horários que as empresas publicam. O relógio vai de meia-noite a meia-noite, e os ônibus que saem à noite e chegam na manhã seguinte aparecem nas duas pontas do dia, então o ciclo se lê como um dia típico e não como uma partida a frio às 00:00.

São 1.659 partidas de ônibus e 37 trens. No fim eu conto de onde vêm os dados. Primeiro, o que me surpreendeu.

## O país viaja à noite

**O tráfego para em algum momento?** Não. Eu esperava que o mapa ficasse quieto depois da meia-noite, como a maioria dos mapas de transporte de países europeus. Acontece o contrário. O mínimo de ônibus na estrada é às 13h (412). O máximo é às 23h (1.035).

É à noite que o Peru parte. 46% das partidas acontecem entre 18h e meia-noite, e só a faixa das 20h tem 178. Seis em cada dez viagens ainda estão rodando quando o relógio passa da meia-noite.

Faz sentido assim que você olha as distâncias. A viagem mediana nos dados tem 422 km e dura 8,6 horas. Lima–Arequipa são 1.002 km e cerca de 17 horas e meia. Saindo às 20h, você dorme na poltrona, economiza uma noite de hotel e chega com o dia inteiro pela frente. Eu sabia disso na teoria. Ver mil pontos acordando ao anoitecer é outra coisa.

## Uma longa linha pela costa

**Para onde o tráfego realmente vai?** Principalmente pela Panamericana. De Tumbes, na fronteira com o Equador, até Camaná, a costa é um rosário contínuo de ônibus, que só vira para o interior em direção a Arequipa e Tacna. 87% das viagens tocam uma cidade costeira, e metade nunca sai da costa.

E tem Lima. 63% das viagens começam ou terminam lá, e a capital tem ônibus diretos para 115 lugares diferentes. Só Lima–Trujillo tem 115 partidas numa quarta-feira. À noite, se você apertar os olhos diante da animação, dá para ver: a costa é uma esteira rolante com Lima no meio.

## O sul: longe, mas não esquecido

**Tacna e Puno são tão isoladas quanto parecem?** Só pela metade. Minha primeira impressão foi que o sul é mal atendido: Tacna e Puno parecem ilhas no pé do mapa. Os números dizem algo mais preciso.

Por habitante, elas têm mais ou menos tantos ônibus quanto as grandes cidades da costa norte. Tacna tem 77 viagens por dia para cerca de 286 mil habitantes, quase a mesma proporção de Trujillo. Puno, menor, tem 68. O que falta a elas é a ligação com Lima. Só 10 ônibus por dia vão de Lima a Tacna, e a viagem leva 21 horas para 1.224 km. Lima–Puno são 4 ônibus e mais de 23 horas.

Em vez disso, o sul roda a sua própria rede. As ligações mais frequentes de Tacna são Arequipa (26 viagens) e Ilo (20). As de Puno, Cusco (33) e Arequipa (25). Só 13% das viagens de Tacna e 6% das de Puno envolvem Lima. Elas parecem isoladas no mapa porque seus ônibus se espalham por mil quilômetros de estrada, não porque ninguém vai até lá.

## Os Andes e a Amazônia recebem menos do que a sua parte

**A sierra está mesmo isolada?** Compare duas viagens do mesmo tamanho. Lima–Trujillo, 557 km pela costa: 115 ônibus. Lima–Ayacucho, 568 km serra adentro: 24.

Para ir além, classifiquei cada cidade por região natural: sierra acima de 2.000 m, e depois costa ou selva conforme o lado dos Andes em que ela fica (Arequipa, a 2.300 m, conta como sierra). O censo de 2017 coloca 58% dos peruanos na costa, 28% na sierra e 14% na selva. As pontas de viagem dos meus dados se dividem em 69%, 24% e 7%.

A sierra fica um pouco abaixo do seu peso. A selva recebe metade do dela. E as cidades da serra dependem mais da capital do que umas das outras: 73% das viagens de Ayacucho vão para Lima ou vêm de lá, 70% das de Huaraz, 65% das de Huancayo. Há 437 viagens costa–sierra nos dados e só 156 que ligam duas cidades andinas.

A selva está pior. Pucallpa, uma das maiores cidades da Amazônia, tem 10 ônibus por dia, 9 deles para Lima, e eles levam 17 horas para 768 km. Isso dá 45 km/h de média. Iquitos nem aparece no mapa: nenhuma estrada chega lá. Vai-se de avião ou passando dias num barco de rio, e eu deixei aviões e barcos de fora de propósito.

Então minha primeira impressão vale para a serra e a selva, com uma ressalva que merece uma seção própria.

## O que o mapa não vê

**Até que ponto confiar nesses números?** Mais para a costa do que para o resto. As grandes empresas cujos horários consegui ler são muito costeiras: 624 das viagens delas vão para cidades da costa, 155 para a sierra e 45 para a selva. Todo o resto vem das autorizações do governo, que subestimam o tráfego (falo disso abaixo). Além disso, boa parte das viagens andinas e amazônicas é feita em vans, táxis compartilhados e pequenas empresas locais que não publicam nada. Juliaca mostra só 10 viagens, o que está claramente errado para uma cidade desse tamanho: muitos ônibus para Puno param lá, mas eu só registro onde cada viagem começa e termina.

A Civa, uma das grandes empresas nacionais, também ficou fora do scraping porque o site dela bloqueia acessos automatizados. Ela só aparece pelas autorizações.

Tudo isso empurra na mesma direção: a sierra e a selva reais têm mais movimento do que o mapa. Parte da diferença vem dos meus dados. Não sei dizer quanto.

## Como foi feito

**De onde se tiram horários de ônibus do Peru?** Não existe feed GTFS para ônibus intermunicipais no Peru nem dataset aberto de linhas. O que existe é papelada. Cada empresa precisa de uma autorização de linha do Ministério dos Transportes (MTC), e essas autorizações são publicadas em PDF no gob.pe. Cada uma lista o itinerário, os dias da semana e os horários de partida autorizados.

O primeiro passo foi um scraper para a listagem do gob.pe (1.649 documentos), depois `pdftotext` e um parser para os dois modelos que o ministério usou ao longo dos anos. 1.146 autorizações saíram com um horário utilizável. 181 eram imagens escaneadas, que deixei de lado em vez de passar por OCR.

O segundo passo veio depois de uma surpresa ruim. As autorizações dizem o que uma empresa *pode* operar, e as grandes operam muito mais. A Cruz del Sur tinha 6 partidas às quartas nas autorizações e 199 no próprio site. Então, para oito grandes empresas (Cruz del Sur, Oltursa, Movil Bus, Ittsa, Emtrafesa, Transportes Línea, Flores e PerúBus), li as páginas públicas de busca de passagens para a quarta-feira 11 de novembro. O mesmo ônibus costuma ser vendido como várias passagens, uma por par de cidades e por terminal de Lima, então foi preciso juntar esses resultados de volta em ônibus únicos, pelo número da viagem ou pelo horário de partida. Deu 824 ônibus. As autorizações de todas as outras empresas somaram 835.

O resto é encanamento. As 759 cidades são geocodificadas offline com o GeoNames. As estradas vêm do OpenStreetMap, roteadas com um servidor OSRM local, e quando uma empresa não publica horário de chegada a viagem recebe o tempo de carro × 1,20, a razão mediana que medi em 654 viagens que têm os dois. Os trens são o horário da PeruRail digitado à mão e desenhado sobre os trilhos do OpenStreetMap. O mapa em si é deck.gl sobre MapLibre com um mapa base da CARTO, e a versão em vídeo é renderizada quadro a quadro num Chromium headless e montada com ffmpeg.

Um erro que vale contar: a primeira versão pedia ao roteador traçados de estrada *simplificados*, mais ou menos um ponto a cada 30 km. Na costa ninguém ia notar. Nos Andes, os pontos cortavam em linha reta pelas curvas, e as linhas desenhadas eram em média 11% mais curtas que as estradas reais (Lima–Huancayo aparecia com 270 km para uma estrada de 304 km). A geometria completa resolveu.

Construí quase tudo em algumas sessões com o Claude Code, que cuidou de boa parte do trabalho braçal de scraping e parsing enquanto eu decidia o que olhar. O widget acima é uma página estática servida a partir deste site com a sua própria política de segurança de conteúdo: nada é carregado de fora, a não ser os tiles do mapa.

## Lições

**O que um dia de ônibus me ensinou?**

1. **A rede intermunicipal do Peru é mais movimentada à noite.** O ponto mais baixo é na hora do almoço, e mesmo assim há 400 ônibus na estrada.
2. **É uma costa com Lima no meio.** Duas viagens em cada três tocam a capital, e a Panamericana leva quase todo o resto.
3. **Distância não é isolamento.** Tacna e Puno ficam longe de Lima, mas bem ligadas a Arequipa e Cusco. Os lugares realmente mal atendidos estão na serra e na selva.
4. **Dados oficiais dizem o que é permitido, não o que acontece.** As autorizações deixavam de fora 97% dos ônibus da Cruz del Sur. Sem os sites das próprias empresas, este mapa mostraria um país bem mais vazio.

Se você conhece as estradas do Peru e algo aqui parece errado, eu quero saber. Os pontos só valem o que valem os horários por trás deles.
