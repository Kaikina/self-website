---
title: "RepoWrapped: Spotify Wrapped for a GitHub Repo, and the API That Fought Me"
description: "A weekend idea — a shareable stats page and README badge for any GitHub repo and contributor — turned into a fight with GitHub's stats API: 202s that never resolve, a top-100 wall, and a first-commit lookup you have to trick out of a header."
pubDate: 2026-07-01
tags: ["Laravel", "PHP", "GitHub API", "Caching", "Side Project"]
cover: ../_assets/repo-wrapped.svg
ogImage: ../_assets/repo-wrapped.png
coverAlt: "A terminal-green stats readout for a GitHub repo: a big commit figure, a contributor ranking, and an embeddable SVG card"
translationKey: "repo-wrapped"
---

Every December, Spotify hands you a little year-in-review and half your feed turns into screenshots of it. It works because the numbers were always there — you just never got to see them framed as a story about *you*. I wanted that for a GitHub repo. Point it at `owner/repo`, pick a contributor, and get a page that says: here's how many commits you landed, here's where you rank, here's the week you went feral. Then let you drop an SVG badge into your README so it lives next to the build status.

That was the whole pitch. A weekend, maybe. I called it [RepoWrapped](https://repo-wrapped.tom-girou.dev), and the front-end part really did take a weekend. The rest of the time went into a fight I didn't see coming: **getting the numbers out of GitHub at all.**

This is a change of pace from the [AI-safety posts](/blog/claude-gitlab-ai-review/) I've been writing lately — no models here, just a small Laravel app and an API that does not want to tell you what you're asking. It's the more honest kind of side-project story, the one where the fun idea is a rounding error and the actual work is somewhere you didn't expect.

## The idea is trivial. The data is not.

"Get the commit stats for a repo" sounds like one endpoint. It is not one endpoint, and the ones you need behave in ways that only make sense once you've been burned by them.

Here's what I wanted per contributor: total commits, lines added and removed, a weekly activity sparkline, the date of their first commit, and where they sit in the repo's ranking. Four of those five come from a single GitHub endpoint — `/stats/contributors`. That endpoint is where most of this story happens, because it has two traps in it, and I fell into both.

## Trap one: the 202 that means "come back later"

The first time you hit `/stats/contributors` on a repo GitHub hasn't recently crunched, you don't get data. You get a `202 Accepted` and an empty body. GitHub is telling you: I've started computing this, ask again in a bit.

Fine. So you retry. But "in a bit" is not a number, and for a big repo it can be a while. A naive retry loop either gives up too early on a slow repo or hammers a fast one. So the fetch backs off — 1, 2, 4, 8, 16 seconds, five attempts — and most repos resolve inside that window.

Most. Not all. And this is the part that took me a second pass to get right: a synchronous web request cannot sit there waiting 30 seconds for GitHub to finish a computation. The visitor's browser gives up, and even if it didn't, you're holding a PHP worker hostage for a job that has nothing to do with the response.

So when the backoff runs out and GitHub is *still* returning 202, I stop waiting in the request and hand the problem to a queue instead. A `RetryContributorStats` job gets dispatched (5 tries, 30-second backoff), the page returns immediately with whatever partial data I do have — flagged `partial: true` so the UI can say "still computing" honestly — and when the job finally lands the real numbers, it merges them back into the stored record. The visitor who asked never sees the wait. The person who loads the page a minute later sees the finished thing.

The lesson isn't subtle, but it's easy to skip when you're moving fast: **any external computation that can take longer than a page load belongs in a queue, not in the controller.** The 202 is GitHub politely telling you that upfront. I just didn't listen the first time.

## Trap two: the top-100 wall

The second trap is quieter, because it doesn't error. `/stats/contributors` returns the top 100 contributors by commit count. If the person you're wrapping is contributor 101, the endpoint returns a clean, successful response — and they're simply not in it. No flag, no warning. Your code looks like it works, and then someone tries it on `laravel/framework` for a mid-tier contributor and gets a page full of zeros.

There's no "give me contributor 143" parameter. So the fallback is to do by hand what the stats endpoint would have done for you: page through that user's commits on the repo (`?author=username`), open each one, and sum the additions and deletions off the individual commit diffs. It's an N+1 loop and I know it — one request to list, one per commit to get line counts — so it's capped at 100 commits. Not perfect. But "roughly right for the long tail" beats "confidently zero," and the alternative was pretending contributor 101 doesn't exist.

I left a comment in that method that just says `// N+1 by design`. Some of the best comments are the ones that stop future-you from cleverly "fixing" something that was a deliberate trade-off.

## The first-commit trick

The fifth number — the date of someone's *first* commit — has no endpoint at all. The obvious approach is to page through their commit history to the very end, which on a long-lived repo is a lot of requests to answer "what's the oldest one."

GitHub's commits endpoint is paginated, and paginated responses carry a `Link` header with `rel="first"`, `rel="prev"`, `rel="next"`, and — the useful one — `rel="last"`. So: ask for the commit list with `per_page=1`, read the `rel="last"` URL out of the header, and it points straight at the final page, which is the oldest commit. One request to find the page, one to fetch it. No walking the history.

It felt like getting away with something. It's also just reading the API's own directions — the pagination metadata was there the whole time, I'd just never had a reason to use `rel="last"` for anything before.

## The caching, because the API has a budget

GitHub's rate limit is real and, with the fan-out from that top-100 fallback, closer than you'd think. So nothing recomputes if it doesn't have to. Results live in two layers: Redis with a 1-hour TTL for the fast path, and Postgres for 24 hours as the durable copy. A request checks Redis, then Postgres, and only a genuine miss dispatches the compute job and drops the visitor on a loading page that polls a `/status` endpoint until the record goes `fresh`.

On top of that there's a token-bucket rate limiter in front of the GitHub client itself — 10 requests a second, 4,500 an hour, tracked in Redis. The decision I'm least sure about lives here: if Redis is down, the limiter *bypasses* rather than blocks. It logs a warning and lets the request through. I chose "the app keeps working and I might annoy GitHub" over "Redis hiccups and the whole site 500s." For a personal project that's the right call. For something with a real blast radius I'd want the opposite default, and I think that's the honest way to describe a trade-off — not "this is the correct pattern" but "here's what I optimized for, and here's when I'd flip it."

## The badge had to be a single file

The part I'm quietest-proud of is the embeddable card. You put this in a README:

```markdown
![RepoWrapped](https://repo-wrapped.tom-girou.dev/card/laravel/framework/taylorotwell?theme=dark)
```

and you get an SVG that renders inline, shields.io-style, with `?theme=` and `?hide=` to control it. The catch nobody warns you about: GitHub serves README images through its own image proxy (Camo), and that proxy fetches your SVG once, from its own servers, with no browser and no follow-up requests. Anything your SVG tries to load — an avatar from `avatars.githubusercontent.com`, an external font, a second request of any kind — silently doesn't happen. You get a card with a broken image hole where the face should be.

So the card has to be genuinely self-contained. It's a Blade template rendered with an `image/svg+xml` content type, and before it renders, the controller fetches the contributor's avatar server-side and base64-inlines it straight into the SVG as a data URI. One file, no external dependencies, nothing for the proxy to fail to fetch. It works as an `<img src>` anywhere, which is the entire point of a badge.

## The design, briefly

I'll spare you the full rundown, but the look is deliberate: a terminal readout. Near-black canvas, IBM Plex Mono, one phosphor-green accent held to under five percent of the screen, the big commit figure in plain white because the data is the hero and it doesn't need dressing up. No gradient orbs, no glassmorphism, no fake window chrome with little traffic-light dots. It reads like a CLI printing your stats, which for a tool aimed at people who live in a terminal felt like the only honest choice.

## The bits I'm not proud of

Two, in the spirit of not writing a brochure.

There's a staleness branch in the cache service I commented out and worked *around* instead of through — the controller does its own freshness check first so the commented code never bites, but anyone reading the service in isolation would be confused, and "confusing but correct" is a debt I still owe that file.

And there's a casing bug I know about and haven't fixed: I lowercase `owner` and `repo` before they hit the cache key, but not `username`. So `/u/laravel/framework/TaylorOtwell` and `/.../taylorotwell` are two different cache entries and two different database rows for the same person. It hasn't caused real trouble yet. It absolutely will the day someone links a differently-cased URL. It's written down in the project's notes precisely so it doesn't get forgotten — which is the honest state of most side projects: a working thing with a short list of sins you've chosen to live with for now.

## Takeaways

1. **The idea is never the work.** "Spotify Wrapped for a repo" was a weekend of UI. The real project was three quirks of one GitHub endpoint. When something sounds trivial, the data source is usually where the actual engineering hides.
2. **A 202 is a design instruction.** When an API tells you it needs time, that's your cue to move the work off the request path and onto a queue — not to retry harder in the controller.
3. **Handle the silent gap, not just the loud error.** The top-100 wall never throws. The failures that don't announce themselves are the ones that make it to production looking like success.
4. **Self-contained beats clever.** The badge works everywhere because it asks nothing of whoever embeds it. One file, no fetches, no surprises — that constraint made it robust, not limited.

It's [open source](https://github.com/Kaikina/repo-wrapped), Laravel 13 and PHP 8.3, MIT-licensed. If you point it at a repo of yours and the numbers look right, that quiet correctness cost more than the pretty page did. That's usually the way.
