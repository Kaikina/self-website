---
title: "Cada novo forjamago deixava a busca mais lenta: matando o N+1 por trás do Forgemage.net"
description: "O diretório de forjamagos do Forgemage.net rodava umas sete queries por card — reviews, tempo de resposta, status online, três relações lazy — além de contadores de facetas recalculados a cada mudança de filtro. Veja como levei uma página de 24 cards de ~168 queries para um punhado, com um cache em batch escopado à request e uma passada paginate-then-hydrate, sem mexer nas páginas de perfil individuais."
pubDate: 2026-07-20
tags: ["Symfony", "Doctrine", "PHP", "Performance", "N+1"]
cover: ../_assets/forgemage-search-n1-queries.svg
ogImage: ../_assets/forgemage-search-n1-queries.png
coverAlt: "Uma página de busca cheia de cards de perfil, cada card disparando sua própria query no banco, que se reduz a uma única query em batch para a página inteira"
translationKey: "forgemage-search-n1-queries"
---

[Forgemage.net](https://forgemage.net) é um side project meu: um marketplace de forjamagia de Dofus, o craft in-game de encantar equipamentos. Os jogadores postam o que querem magear, e quem faz o mageamento — os forjamagos — tem um perfil público com reviews, um tempo médio de resposta e um badge, se tiver conquistado um. O coração da coisa é [o diretório](https://forgemage.net/s): um grid paginado de cards de perfil que você filtra por servidor, especialidade e avaliação.

Essa página era rápida quando eu era o único perfil no banco. Ela ficava um pouco mais lenta a cada novo cadastro. Nenhum erro, nenhum timeout, nada que aparecesse num alerta — só uma página que demorava mais a cada semana, do jeito que um quarto vai ficando bagunçado sem que exista um dia específico que você chamaria de "o dia em que ficou bagunçado". Aí eu abri o profiler do Symfony numa página cheia de resultados e o número de queries me fez largar o café.

Isso é uma mudança de ritmo em relação ao [encanamento de IA](/pt/blog/markdown-for-agents/) sobre o qual venho escrevendo. Sem modelos, sem agentes. Só Doctrine, uma página de listagem e o bug de performance mais antigo que existe, escondido no lugar mais sem graça que ele conseguiu achar.

## Uma query por card é invisível até os cards se multiplicarem

**Por que uma página que funcionava bem de repente começa a se arrastar?** Porque "bem" foi medido contra três perfis, e o custo era por perfil desde o começo.

Cada card do diretório renderiza uma pequena pilha de informações: se a pessoa esteve ativa recentemente, qual a avaliação média, quantos mageamentos ela concluiu, quão rápido ela responde, qual badge, quais servidores, quais especialidades. No template isso fica limpo e legível — um punhado de funções Twig, uma por informação:

```twig
{% set smithmageActive = smithmage_active(smithmage.user) %}
{% set stats = get_forgemage_stats(smithmage.user) %}
{% set maggingsDoneCount = maggings_done_count(smithmage) %}
{% set answerTime = answer_time(smithmage.user) %}
```

Cada uma delas era uma extensão Twig chamando um repository, e cada chamada era um `SELECT` próprio. Quatro queries por card antes mesmo de contar as relações. Depois, `smithmage.badge`, `smithmage.gameServers` e `smithmage.specialties` são associações do Doctrine que eu nunca fiz eager-load, então acessá-las no template fazia lazy-load de cada uma sob demanda — mais três queries por card.

Sete queries por card. A página mostra 24. Ou seja, uma única visualização da listagem disparava algo acima de 160 queries antes de os contadores de facetas da sidebar sequer terem sua vez. No meu notebook, contra um banco quase vazio, são alguns milissegundos e você nunca percebe. Em produção, contra uma tabela que cresce toda vez que a coisa realmente funciona, é a definição de um bug que chega num cronograma que não foi você que definiu.

O mais frustrante é que nada daquilo parece errado. Cada função faz exatamente uma coisa sensata. O N+1 não está em nenhuma linha — está no loop que o template envolve em volta de todas elas, e você não enxerga um loop lendo um único card.

## O fix que parece óbvio e quebra a paginação

**Por que não fazer fetch-join de tudo na query da listagem?** Esse é o reflexo, e para o badge — um many-to-one simples — funciona. Para `gameServers` e `specialties` ele explode em silêncio.

A query da listagem é paginada: 24 linhas com um `LIMIT`. No momento em que você faz fetch-join de uma coleção to-many numa query que tem `setMaxResults()`, o Doctrine não pode mais confiar no limite. Um perfil com quatro especialidades vira quatro linhas no result set, então `LIMIT 24` não significa mais 24 perfis — significa 24 linhas, o que pode ser seis perfis com as especialidades do último cortadas pela metade. O Doctrine sabe disso, e é por isso que ele para de aplicar o limite no SQL e pagina em memória: ele carrega *todas* as linhas que batem, hidrata o conjunto inteiro e depois te entrega a página um. Você transformou uma query paginada num carregamento da tabela inteira para economizar alguns round trips. Isso não é um fix, é uma versão maior do mesmo problema.

Então mantive a query da listagem enxuta — ela seleciona os 24 perfis que deveria e nada mais — e hidrato as coleções numa segunda passada, escopada exatamente aos ids que eu já tenho:

```php
public function hydrateListingRelations(array $profiles): void
{
    if ($profiles === []) {
        return;
    }

    $ids = array_map(static fn (ForgemageProfile $p) => $p->getId(), $profiles);

    $this->createQueryBuilder('fp')
        ->addSelect('badge', 'gameServers', 'specialties')
        ->leftJoin('fp.badge', 'badge')
        ->leftJoin('fp.gameServers', 'gameServers')
        ->leftJoin('fp.specialties', 'specialties')
        ->where('fp.id IN (:ids)')
        ->setParameter('ids', $ids)
        ->getQuery()
        ->getResult();
}
```

Não tem `LIMIT` aqui, então o fan-out é inofensivo — ele é limitado pelos 24 ids que eu passo. E eu nunca uso o valor de retorno. Parece um erro até você saber como o Doctrine funciona: hidratar essas entidades puxa as coleções delas para o identity map da unit of work, e os objetos de perfil que o template já tem em mãos são os *mesmos* objetos. Quando um card lê `smithmage.specialties`, o dado já está em memória. Nenhuma query. O segundo `SELECT` pagou por todos de uma vez.

Três relações lazy em 24 cards — 72 queries — viraram uma.

## Fazendo batch das stats de cada card num lugar só

**Onde colocar as queries em batch para que os cards as encontrem sem ficar passando estado por todo template?** Dei à request um objeto cuja única função é guardar as stats desta página, aquecido uma vez e lido várias.

As relações eram a metade fácil, porque o identity map do Doctrine faz o cache por você. As quatro queries de stats não tiveram essa sorte — são agregações (`AVG(rating)`, `COUNT` de mageamentos concluídos, uma linha de tempo de resposta, uma linha de status online), não carregamentos de entidade, então nada as deduplica de graça. Escrevi um pequeno service, `ForgemageCardStatsCache`, que roda cada agregação uma vez para a página inteira:

```php
public function warmForProfiles(array $profiles): void
{
    $users = /* dedupe the users behind these profiles */;

    $this->reviewStatsByUserId       = $this->reviewRepository->getForgemageStatsForUsers($users);
    $this->maggingsDoneCountByProfileId = $this->requestRepository->findMaggingsDoneCountForProfiles($profiles);
    $this->responseStatsByUserId     = $this->participantResponseStatsRepository->findByParticipants($users);
    // …online status, same shape

    $this->warmed = true;
}
```

Cada um desses métodos de repository é o gêmeo em batch de um método single-item que já existia: `getForgemageStats($user)` ganhou um `getForgemageStatsForUsers($users)` que faz a mesma agregação com `WHERE reviewee IN (:users)` e um `GROUP BY`, retornando um map indexado por id de usuário. Mesma query, rodada uma vez por página em vez de uma vez por linha. O service de busca chama `warmForProfiles()` logo depois de buscar a página, e mais quatro N+1 por card colapsam em quatro queries, ponto.

Um detalhe que importa para a corretude: o service `implements ResetInterface`. O Symfony chama `reset()` entre requests, o que limpa os maps aquecidos. Sem isso, um worker de longa duração serviria tranquilamente as stats em cache de um visitante para outro visitante — o tipo de bug que é invisível em dev, onde cada request é um processo novo, e silenciosamente errado no dia em que você coloca a aplicação atrás de um runtime persistente.

## O fallback que mantém as páginas de perfil único honestas

**Como fazer batch da listagem sem quebrar as páginas que renderizam um único perfil?** Você torna o cache em batch opcional e deixa o caminho single-item antigo exatamente onde estava.

Uma página de detalhe de perfil renderiza um card. Um dashboard renderiza um. Aquecer um batch da página inteira para essas seria bobagem, então nada o aquece ali — e as funções Twig precisam lidar com um cache que nunca foi preenchido. Elas consultam o cache primeiro e caem de volta na chamada original ao repository quando ele vem vazio:

```php
public function maggingsDoneCount(ForgemageProfile $profile): int
{
    return $this->statsCache->getMaggingsDoneCount($profile)
        ?? $this->requestRepository->findMaggingsDoneCount($profile);
}
```

O diretório aquece o cache, então os cards batem nele. Todas as outras páginas o deixam frio, então esses `??` caem para a query que sempre esteve lá. Nenhuma página ganhou um caso especial; o caminho rápido é só uma dica da qual o caminho lento não precisa.

Tem um ponto em que o `?? ` não basta, e é minha parte favorita de toda a mudança. As stats de resposta podem ser legitimamente `null` — um forjamago que nunca teve uma conversa não tem linha. Mas "não aquecido" *também* quer dizer "vai perguntar ao repository". Se os dois estados fossem `null`, um usuário genuinamente sem stats no diretório cairia numa query redundante, reintroduzindo silenciosamente o N+1 justamente para as pessoas que o cache deveria cobrir. Então o sinal de não aquecido é `false`, um valor que o resultado real nunca pode ter:

```php
public function getResponseStats(User $user): ParticipantResponseStats|false|null
{
    if (!$this->warmed) {
        return false; // not warmed: caller should fall back to the repo
    }

    return $this->responseStatsByUserId[$user->getId()] ?? null; // warmed, genuinely no row
}
```

Retornos de três estados têm má fama, e geralmente merecem. Mas confundir "não sei" com "sei que não tem nada" é um bug real esperando para acontecer, e um union type que diz `false|null` em voz alta é mais honesto do que um `null` que significa duas coisas diferentes dependendo de quem pergunta.

## Contadores de facetas não precisam ser exatos ao segundo

**Por que recalcular os números da sidebar a cada tecla?** Você não precisa, e eu estava fazendo isso.

A sidebar de filtros mostra quantos perfis existem por trás de cada especialidade e de cada badge. Essas são agregações `GROUP BY` sobre todo o conjunto elegível, e eram recalculadas a cada request — então toda vez que alguém alternava um filtro, o servidor rodava de novo as mesmas contagens pesadas para dizer "142 perfis fazem equipamento de Feca", quando a resposta honesta não tinha mudado em uma hora. Contadores de facetas são o caso de manual para estar um pouco desatualizado: ninguém percebe, e ninguém sai prejudicado, se o número tiver cinco minutos.

Então eles passam pelo cache do Symfony com um TTL de cinco minutos, com uma chave baseada na combinação de filtros que realmente muda a resposta:

```php
$cacheKey = sprintf(
    'search_specialty_counts.%s.%s.%s',
    $gameServerId?->value ?? 'all',
    $superSmithmagusOnly ? 1 : 0,
    $minRating ? 1 : 0,
);

return $this->cache->get($cacheKey, function (ItemInterface $item) use (/* … */) {
    $item->expiresAfter(300);
    // …the aggregate that used to run every time
});
```

Acertar a chave é o jogo inteiro. Deixe um filtro de fora e você serve as contagens de um filtro no lugar das de outro — um bug de cache que parece exatamente um bug de contagem e te faz perder uma tarde antes de pensar em checar a chave. Coloque coisa demais e o cache nunca dá hit. A regra a que eu sempre volto: a chave tem que nomear cada input que muda o resultado, e nada além disso.

## A checagem de premium que eu simplesmente apaguei

**O que é mais rápido que uma query em batch?** Nenhuma query.

Um dos lookups por card era uma checagem de assinatura premium, com sua própria chamada ao repository por usuário para perguntar "essa pessoa é premium?". Só que a query do diretório já faz eager-load da associação de assinatura por outros motivos, então a resposta estava em memória o tempo todo — eu estava pagando um round trip para buscar uma coisa que já tinha. O fix foi apagar a chamada ao repository e ler o objeto:

```php
public function hasActivePremium(User $user): bool
{
    return $user->isPremium();
}
```

O porém, e quero ser honesto sobre isso: `hasActivePremium()` agora assume silenciosamente que quem chama fez eager-load dessa associação. No diretório, isso é verdade. Se alguma página futura chamar isso sem o eager-load, ainda vai funcionar — o Doctrine vai fazer lazy-load da relação — e eu terei reintroduzido silenciosamente o N+1 que acabei de remover, sem nada para me avisar. Isso é acoplamento real. Troquei uma query garantida por uma suposição, e a suposição não está escrita em nenhum lugar que o compilador consiga ver. Deixei um comentário; um comentário não é um teste.

## As partes de que não me orgulho

**O que ainda está devendo?** Algumas coisas, no espírito de não escrever um folheto de propaganda.

O acoplamento do premium acima é a mais gritante. Está correto hoje e depende de exatamente o setup de uma única página estar certo.

A chamada a `warmForProfiles()` mora no service de busca, o que significa que o batch só acontece porque esse único ponto de chamada lembra de fazê-lo. Qualquer nova página que liste perfis precisa saber que tem que aquecer o cache, ou ela recebe o caminho lento de volta sem aviso. O caminho rápido é opt-in, e performance opt-in é o tipo que você perde sem querer.

E os cinco minutos de defasagem das facetas são um número que escolhi no feeling, não medindo nada. Provavelmente está ok. "Provavelmente está ok" é uma descrição honesta da maioria dos TTLs, e prefiro dizer isso a fingir que derivei 300 segundos de dados que nunca coletei.

## Lições

1. **N+1 é um bug de crescimento, não um bug de código.** Ele se lê bem, passa no review e passa em todos os testes contra uma fixture pequena. Só aparece com o volume de dados que significa que o produto está funcionando. Abra o profiler numa página *cheia*, não numa fixture.
2. **Fazer fetch-join de uma to-many com `LIMIT` é uma armadilha.** O Doctrine não consegue paginar um result set com fan-out no SQL, então pagina em memória — transformando sua query paginada num carregamento completo. Pagine a query enxuta e depois hidrate as coleções numa segunda passada, usando os ids que você já tem.
3. **Faça batch onde está o loop, não onde estão os dados.** Os cards não têm como não ser um loop. O fix pertence a um nível acima, num service que aquece as stats da página inteira uma vez e as devolve por id.
4. **Torne o caminho rápido opcional e o caminho lento o padrão.** Um cache que as páginas de perfil único não preenchem, e funções Twig que fazem fallback quando ele está frio, fizeram com que o ganho não custasse nada a essas páginas — e não me custasse nenhum caso especial.
5. **Uma chave que esquece um input é um bug que parece outro bug.** A parte mais difícil de colocar os contadores de facetas em cache não foi o cache. Foi nomear cada filtro que muda a resposta, e nenhum que não muda.

Forgemage.net é uma app Symfony que eu toco sozinho, para um jogo de que gosto. Esse tipo de fix é o trabalho menos glamoroso que existe — nenhuma feature, nenhum screenshot, nada pelo qual um usuário vá te agradecer. Eles só vão perceber que a página parou de ficar mais lenta. Geralmente é assim.
