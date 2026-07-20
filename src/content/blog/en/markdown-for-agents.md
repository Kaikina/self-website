---
title: "Markdown for Agents, Self-Hosted: One Symfony Subscriber Instead of a Cloudflare Plan"
description: "Cloudflare converts pages to markdown for AI agents via Accept: text/markdown — on paid plans. The same HTTP contract fits in a 144-line Symfony event subscriber. My homepage went from 59 KB of HTML to 7.7 KB of markdown, same URL."
pubDate: 2026-07-08
tags: ["Symfony", "PHP", "AI Agents", "HTTP", "SEO"]
cover: ../_assets/markdown-for-agents.svg
ogImage: ../_assets/markdown-for-agents.png
coverAlt: "A curl request with Accept: text/markdown next to an HTML document being converted into a clean markdown rendition, with an 87% size reduction"
translationKey: "markdown-for-agents"
---

A growing share of my side project's traffic isn't people. [Forgemage](https://forgemage.net) is a marketplace where Dofus players find smithmages, and since AI-assisted search took off, some of its "visitors" are LLMs fetching a page to answer somebody's question. They get what browsers get: 59 KB of HTML for roughly a thousand words of actual content. The rest is Bootstrap classes, SVG icons, a cookie banner, and a footer the agent will dutifully tokenize and ignore.

In February, Cloudflare shipped a feature called [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/): when a client sends `Accept: text/markdown`, their edge converts the HTML response to markdown on the fly. They claim about 80% fewer tokens per page. It's a dashboard toggle — on Pro plans and up.

The thing is, there's no Cloudflare magic in that contract. It's HTTP content negotiation, a mechanism older than most of the web's problems, plus an HTML-to-markdown converter. Forgemage is a Symfony app, so I implemented the same behavior myself: one event subscriber, one composer package, an afternoon including tests. This post walks through the implementation and the three details that would have bitten me in production if the RFC hadn't warned me first.

## The contract before the code

**How do you serve HTML and markdown from the same URL?** Both renditions live at the same URL. A browser requesting `https://forgemage.net/` gets HTML; an agent sending `Accept: text/markdown` gets markdown. No `/md/` prefix, no `.md` suffix, no separate route to maintain.

That's the pleasant part. The negotiation rules are where implementations quietly go wrong:

Markdown must be requested *by name*. Every browser's Accept header ends with `*/*;q=0.8`, and a wildcard technically matches `text/markdown`. Treat the wildcard as opt-in and you'll serve markdown to Chrome. Been careful about this one since I read the header Firefox actually sends.

`q=0` is an explicit refusal, not a low preference — RFC 9110 says a quality of zero means "never send me this". A client saying `text/markdown;q=0` gets HTML, full stop.

Ties go to markdown. If a client lists both `text/html` and `text/markdown` at equal quality, it named markdown explicitly. Browsers never do that. A machine that bothered to spell out `text/markdown` in its Accept header wants it.

Here's that logic in the subscriber, using Symfony's `AcceptHeader` parser so I don't hand-roll quality sorting:

```php
private function prefersMarkdown(Request $request): bool
{
    $accept = AcceptHeader::fromString($request->headers->get('Accept'));

    // Markdown must be asked for by name (case-insensitively, with any
    // media parameters) — a wildcard match is not opt-in.
    $markdown = null;
    foreach ($accept->all() as $item) {
        if (strcasecmp($item->getValue(), 'text/markdown') === 0) {
            $markdown = $item;
            break;
        }
    }

    // q=0 is an explicit refusal per RFC 9110.
    if ($markdown === null || $markdown->getQuality() <= 0.0) {
        return false;
    }

    $html = $accept->get('text/html');

    return $html === null || $markdown->getQuality() >= $html->getQuality();
}
```

The manual loop instead of `$accept->get('text/markdown')` is deliberate: it tolerates casing (`Text/Markdown`) and media parameters (`text/markdown;variant=GFM`), both legal per the RFC and both things a strict string lookup would miss.

## Where to hook it, and what to guard

**Where should the conversion live, and what has to be guarded?** The whole feature is a `kernel.response` subscriber. The controller renders HTML exactly as before; the subscriber decides afterwards whether to swap the body. No controller changes, no template changes, and deleting the class removes the feature cleanly.

Before converting anything, it bails unless *all* of these hold: it's the main request, the method is GET or HEAD, the response is `text/html`, the status is 200, and — the guard I care most about — the route is indexable.

```php
if (!\in_array($request->getMethod(), [Request::METHOD_GET, Request::METHOD_HEAD], true)
    || !$this->sitemapService->isIndexable($request->attributes->get('_route'))
    || !str_starts_with($response->headers->get('Content-Type') ?? 'text/html', 'text/html')
) {
    return;
}
```

That `isIndexable()` call reuses the service that already builds my sitemap and robots.txt. The app has one definition of "public page", and the markdown rendition inherits it. A logged-in agent hitting `/wishlist` or a messaging thread with `Accept: text/markdown` gets plain HTML, because those routes were never indexable to begin with. I didn't have to enumerate private pages a second time, which means I can't forget one a second time either.

## Converting HTML that was never written to be markdown

**What does turning page HTML into clean markdown actually involve?** The conversion itself is [`league/html-to-markdown`](https://github.com/thephpleague/html-to-markdown), configured once and cached in the subscriber:

```php
$this->htmlConverter = new HtmlConverter([
    'strip_tags' => true,
    'strip_placeholder_links' => true,
    'remove_nodes' => 'head script style noscript template iframe canvas svg nav header footer',
]);
$this->htmlConverter->getEnvironment()->addConverter(new TableConverter());
```

The `remove_nodes` list is the editorial decision hiding in the config. Scripts and styles are obvious. `nav`, `header` and `footer` are a choice: an agent asking for the markdown rendition wants the content of the page, not forty navigation links and a language switcher repeated on every single URL of the site. Cutting the chrome is a big part of why the output shrinks so much. `TableConverter` is opt-in in the league package, and Forgemage has pricing tables I'd rather agents read as tables than as run-on text.

Two small touches after conversion. If the result doesn't start with an `# ` heading, the subscriber promotes the HTML `<title>` to one, so every markdown document opens with its subject — the thing an agent skims first. And the whole conversion sits in a `try/catch (Throwable)` that falls back to serving the HTML untouched. A markdown rendition is a nice-to-have; it doesn't get to 500 a public page.

## The three details that actually matter

**Which implementation details actually bite in production?** Everything above is straightforward. These three are the reason I'd point a colleague at this post instead of just at the package's README.

**`Vary: Accept`, on both renditions.** Two different bodies live at one URL, so every cache between the agent and the app must key on the Accept header. Miss it and a CDN happily caches the markdown rendition, then serves it to the next browser. The subscriber sets it before checking whether markdown was even requested, and before the 200 check, because the URL negotiates regardless of what this particular response turned out to be. Symfony's `setVary('Accept', false)` appends rather than replaces, so an existing `Vary` from another listener survives.

**HEAD must negotiate like GET.** An agent may HEAD a URL first to check the Content-Type before committing to the download. Symfony's own `ResponseListener` (priority 0) strips HEAD bodies during `prepare()`, so this subscriber registers at priority 10 to run first — the HEAD response carries `Content-Type: text/markdown` and `Vary: Accept` exactly like its GET twin, just without a body.

**Recompute what the body swap invalidates.** After replacing the content, the stale `Content-Length` header has to go (Symfony recalculates it), and the Content-Type becomes `text/markdown; charset=utf-8`. For the HTML rendition, the subscriber instead adds a discoverability hint: `Link: <same-url>; rel="alternate"; type="text/markdown"`, which is how a crawler learns the markdown exists without being told out of band.

## Proving it works

**How do you prove the negotiation works?** Seven `WebTestCase` tests pin the negotiation matrix: browser Accept keeps HTML, `*/*` is not opt-in, `q=0` refuses, `Text/Markdown;variant=GFM` matches, HEAD carries the same headers, and a logged-in request to a private route never converts. The whole suite is boring on purpose — each test is four lines of "send this Accept header, assert this Content-Type".

Against production:

```bash
$ curl -sI https://forgemage.net/ | grep -i -e vary -e "text/markdown"
link: <https://forgemage.net/>; rel="alternate"; type="text/markdown"
vary: Accept

$ curl -s -H "Accept: text/markdown" https://forgemage.net/ | head -2
# Trouve tes forgemages sur notre plateforme Forgemage.net

$ curl -so /dev/null -w "%{size_download}\n" https://forgemage.net/
59432
$ curl -so /dev/null -w "%{size_download}\n" -H "Accept: text/markdown" https://forgemage.net/
7670
```

59,432 bytes down to 7,670 — an 87% reduction on the wire, in line with Cloudflare's ~80% token figure. The markdown version is the page a human would describe if you asked them what's on it.

## The honest limits

**When does serving markdown this way fall short?**

**Garbage in, garbage out.** The converter transforms your rendered HTML; it can't add structure your templates don't have. Forgemage's Twig templates use real headings and semantic lists, so the markdown comes out readable. A div-soup frontend would produce markdown soup.

**Almost nobody asks yet.** I haven't seen a mainstream crawler send `Accept: text/markdown` unprompted. Today's agents mostly fetch HTML and convert it client-side — Claude Code's own WebFetch tool does exactly that. This feature is a bet that the convention Cloudflare is pushing becomes the norm, and the stake is small: one dependency, 144 lines, no ongoing cost. Serving the conversion from the origin also means the agent's own converter never sees my cookie banner.

**It complements llms.txt, not replaces it.** This very site has an `/llms.txt` — a curated map for agents. Content negotiation answers a different question: "give me *this page*, cheaply". One is a table of contents, the other is the book printed in a readable font.

## Takeaways

**What carries over to your own stack?**

1. **Cloudflare's Markdown for Agents is a contract, not a product.** `Accept: text/markdown` in, converted body plus `Vary: Accept` out. Any framework with response events can honor it.
2. **The negotiation edge cases are the feature.** Wildcard is not opt-in, `q=0` means never, matching is case-insensitive and parameter-tolerant. Get these wrong and browsers see markdown.
3. **Reuse your indexability logic as the safety rail.** If the sitemap wouldn't list it, the markdown rendition shouldn't exist. One definition of "public", enforced twice for free.
4. **Strip the chrome in the converter config.** Removing `nav`, `header` and `footer` is where most of the 87% comes from, and it's one config string.

An afternoon of work, most of it spent writing tests for Accept headers I hope no client ever sends. But when the first agent asks my server for markdown by name, it'll get a clean answer at an 87% discount — and I didn't have to change plans for it.
