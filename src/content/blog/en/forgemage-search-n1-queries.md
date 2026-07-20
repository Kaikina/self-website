---
title: "Every New Smithmagus Made Search Slower: Killing the N+1 Behind Forgemage.net"
description: "Forgemage.net's smithmagus directory ran roughly seven queries per card — reviews, response time, online status, three lazy relations — plus facet counts recomputed on every filter tweak. Here's how I got a page of 24 cards from ~168 queries down to a handful, with a request-scoped batch cache and a paginate-then-hydrate pass, without touching the single-profile pages."
pubDate: 2026-07-20
tags: ["Symfony", "Doctrine", "PHP", "Performance", "N+1"]
cover: ../_assets/forgemage-search-n1-queries.svg
ogImage: ../_assets/forgemage-search-n1-queries.png
coverAlt: "A search page of profile cards, each card firing its own database query, collapsing into a single batched query for the whole page"
translationKey: "forgemage-search-n1-queries"
---

[Forgemage.net](https://forgemage.net) is a side project of mine: a marketplace for Dofus smithmagie, the in-game craft of enchanting gear. Players post what they want maged, and the people who do the maging — smithmaguses — have public profiles with reviews, an average response time, a badge if they've earned one. The heart of it is [the directory](https://forgemage.net/s): a paginated grid of profile cards you filter by server, specialty, and rating.

That page was fast when I was the only profile in the database. It got a little slower every time someone signed up. No error, no timeout, nothing that shows up in an alert — just a page that took longer each week, the way a room gets messier without any single day you'd call the day it got messy. Then I opened the Symfony profiler on a full page of results and the query count made me put my coffee down.

This is a change of pace from the [AI plumbing](/blog/markdown-for-agents/) I've been writing about. No models, no agents. Just Doctrine, a listing page, and the oldest performance bug there is, hiding in the most boring place it could find.

## One query per card is invisible until the cards multiply

**Why does a page that worked fine suddenly crawl?** Because "fine" was measured against three profiles, and the cost was per-profile the whole time.

Each card on the directory renders a small pile of facts: is this person active recently, what's their average rating, how many magings have they completed, how fast do they answer, which badge, which servers, which specialties. In the template that's clean and readable — a handful of Twig functions, one per fact:

```twig
{% set smithmageActive = smithmage_active(smithmage.user) %}
{% set stats = get_forgemage_stats(smithmage.user) %}
{% set maggingsDoneCount = maggings_done_count(smithmage) %}
{% set answerTime = answer_time(smithmage.user) %}
```

Every one of those was a Twig extension calling a repository, and every call was its own `SELECT`. Four queries a card before you count relations. Then `smithmage.badge`, `smithmage.gameServers`, and `smithmage.specialties` are Doctrine associations I never eager-loaded, so touching them in the template lazy-loaded each one on demand — three more queries a card.

Seven queries per card. The page shows 24. So a single listing view was firing something north of 160 queries before the facet counts on the sidebar even got a turn. On my laptop against a near-empty database that's a few milliseconds and you'd never notice. In production, against a table that grows every time the thing actually works, it's the definition of a bug that arrives on a schedule you didn't set.

The frustrating part is that none of it looks wrong. Each function does exactly one sensible thing. The N+1 isn't in any one line — it's in the loop the template wraps around all of them, and you can't see a loop by reading a single card.

## The fix that looks obvious and breaks pagination

**Why not just fetch-join everything onto the listing query?** That's the reflex, and for the badge — a plain many-to-one — it's fine. For `gameServers` and `specialties` it quietly detonates.

The listing query is paginated: 24 rows with a `LIMIT`. The moment you fetch-join a to-many collection onto a query that has `setMaxResults()`, Doctrine can't trust the limit anymore. One profile with four specialties is four rows in the result set, so `LIMIT 24` no longer means 24 profiles — it means 24 rows, which might be six profiles with the last one's specialties sliced in half. Doctrine knows this, which is why it stops applying the limit in SQL and paginates in memory instead: it loads *every* matching row, hydrates the whole set, then hands you page one. You've turned a paginated query into a full-table load to save a few round trips. That's not a fix, it's a bigger version of the same problem.

So I kept the listing query lean — it selects the 24 profiles it's supposed to and nothing more — and hydrate the collections in a second pass, scoped to exactly the ids I already have:

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

There's no `LIMIT` here, so the fan-out is harmless — it's bounded by the 24 ids I pass in. And I never use the return value. That looks like a mistake until you know how Doctrine works: hydrating those entities pulls their collections into the unit of work's identity map, and the profile objects the template already holds are the *same* objects. When a card then reads `smithmage.specialties`, the data is already in memory. No query. The second `SELECT` paid for all of them at once.

Three lazy relations across 24 cards — 72 queries — became one.

## Batching the per-card stats in one place

**Where do you put the batched queries so the cards can find them without threading state through every template?** I gave the request one object whose whole job is to hold this page's stats, warmed once and read many times.

The relations were the easy half, because Doctrine's identity map does the caching for you. The four stat queries had no such luck — they're aggregates (`AVG(rating)`, `COUNT` of completed magings, a response-time row, an online-status row), not entity loads, so nothing dedupes them for free. I wrote a small service, `ForgemageCardStatsCache`, that runs each aggregate once for the whole page:

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

Each of those repository methods is the batched twin of an existing single-item one: `getForgemageStats($user)` gained a `getForgemageStatsForUsers($users)` that does the same aggregate with `WHERE reviewee IN (:users)` and a `GROUP BY`, returning a map keyed by user id. Same query, run once for the page instead of once per row. The search service calls `warmForProfiles()` right after it fetches the page, and four more per-card N+1s collapse into four queries flat.

One detail that matters for correctness: the service `implements ResetInterface`. Symfony calls `reset()` between requests, which clears the warmed maps. Without that, a long-running worker would happily serve one visitor another visitor's cached stats — the kind of bug that's invisible in dev, where every request is a fresh process, and quietly wrong the day you put the app behind a persistent runtime.

## The fallback that keeps single-profile pages honest

**How do you batch the list without breaking the pages that render one profile?** You make the batch cache optional, and let the old single-item path stay exactly where it was.

A profile detail page renders one card. A dashboard renders one. Warming a whole-page batch for those would be silly, so nothing warms it there — and the Twig functions have to cope with a cache that was never filled. They ask the cache first and fall back to the original repository call when it comes up empty:

```php
public function maggingsDoneCount(ForgemageProfile $profile): int
{
    return $this->statsCache->getMaggingsDoneCount($profile)
        ?? $this->requestRepository->findMaggingsDoneCount($profile);
}
```

The directory warms the cache, so cards hit it. Every other page leaves it cold, so those `??` fall through to the query that was always there. No page got a special case; the fast path is just a hint the slow path doesn't need.

There's one spot where `?? ` isn't enough, and it's my favourite bit of the whole change. Response stats can legitimately be `null` — a smithmagus who's never had a conversation has no row. But "not warmed" *also* wants to mean "go ask the repository." If both states were `null`, a genuinely statless user on the directory would fall through to a redundant query, quietly reintroducing the N+1 for exactly the people the cache was supposed to cover. So the not-warmed signal is `false`, a value the real result can never be:

```php
public function getResponseStats(User $user): ParticipantResponseStats|false|null
{
    if (!$this->warmed) {
        return false; // not warmed: caller should fall back to the repo
    }

    return $this->responseStatsByUserId[$user->getId()] ?? null; // warmed, genuinely no row
}
```

Three-state returns get a bad rap, and usually deserve it. But conflating "I don't know" with "I know it's nothing" is a real bug waiting to happen, and a union type that says `false|null` out loud is more honest than a `null` that means two different things depending on who's asking.

## Facet counts don't need to be true to the second

**Why recompute the sidebar numbers on every keystroke?** You don't have to, and I was.

The filter sidebar shows how many profiles sit behind each specialty and each badge. Those are `GROUP BY` aggregates across the whole eligible set, and they were recomputed on every request — so every time someone toggled a filter, the server re-ran the same heavy counts to tell them "142 profiles do Feca gear" when the honest answer hadn't budged in an hour. Facet counts are the textbook case for being slightly stale: nobody notices, and nobody's hurt, if the number is five minutes old.

So they go through Symfony's cache with a five-minute TTL, keyed by the filter combination that actually changes the answer:

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

Getting the key right is the whole game. Leave a filter out of it and you serve one filter's counts under another's — a caching bug that looks exactly like a counting bug and wastes an afternoon before you think to check the key. Put too much in it and the cache never hits. The rule I keep coming back to: the key has to name every input that changes the result, and nothing else.

## The premium check I just deleted

**What's faster than a batched query?** No query.

One of the per-card lookups was a premium-membership check, its own repository call per user to ask "is this person premium." But the directory query already eager-loads the membership association for other reasons, so the answer was sitting in memory the whole time — I was paying for a round trip to fetch a thing I already had. The fix was to delete the repository call and read the object:

```php
public function hasActivePremium(User $user): bool
{
    return $user->isPremium();
}
```

The catch, and I want to be honest about it: `hasActivePremium()` now silently assumes the caller eager-loaded that association. On the directory it's true. If some future page calls this without the eager-load, it'll still work — Doctrine will lazy-load the relation — and I'll have quietly reintroduced the N+1 I just removed, with nothing to warn me. That's real coupling. I traded a guaranteed query for an assumption, and the assumption isn't written down anywhere the compiler can see it. I left a comment; a comment is not a test.

## The bits I'm not proud of

**What's still owed?** A few things, in the spirit of not writing a brochure.

The premium coupling above is the loudest one. It's correct today and load-bearing on exactly one page's setup being right.

The `warmForProfiles()` call lives in the search service, which means the batching only happens because that one call site remembers to make it. Any new page that lists profiles has to know to warm the cache, or it silently gets the slow path back. The fast path is opt-in, and opt-in performance is the kind you lose by accident.

And the five-minute facet staleness is a number I picked by feel, not by measuring anything. It's probably fine. "Probably fine" is an honest description of most TTLs, and I'd rather say that than pretend I derived 300 seconds from data I never collected.

## Takeaways

1. **N+1 is a growth bug, not a code bug.** It reads fine, reviews fine, and passes every test against a small fixture. It only shows up against the data volume that means the product is working. Load the profiler against a *full* page, not a fixture.
2. **Fetch-joining a to-many with a `LIMIT` is a trap.** Doctrine can't paginate a fanned-out result set in SQL, so it does it in memory — turning your paginated query into a full load. Paginate the lean query, then hydrate the collections in a second pass keyed by the ids you already have.
3. **Batch where the loop is, not where the data is.** The cards can't help being a loop. The fix belongs one level up, in a service that warms the whole page's stats once and hands them back by id.
4. **Make the fast path optional and the slow path the default.** A cache the single-profile pages don't fill, and Twig functions that fall back when it's cold, meant the win cost those pages nothing — and cost me no special cases.
5. **A key that forgets an input is a bug that looks like a different bug.** The hardest part of caching the facet counts wasn't the cache. It was naming every filter that changes the answer, and nothing that doesn't.

Forgemage.net is a solo Symfony app I run for a game I like. This kind of fix is the least glamorous work there is — no feature, no screenshot, nothing a user will ever thank you for. They'll just notice the page stopped getting slower. That's usually the way.
