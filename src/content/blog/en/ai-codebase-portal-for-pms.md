---
title: "Letting Non-Technical PMs Query the Codebase in Plain Language"
description: "Why I built a read-only AI analyst that lets project managers ask questions about a codebase and walk away with a ready-to-file ticket — and why the whole thing only works because the AI can read but never write."
pubDate: 2026-06-29
tags: ["Claude", "Agent SDK", "Developer Tools", "Jira", "PrestaShop"]
cover: ../_assets/ai-codebase-portal-for-pms.svg
ogImage: ../_assets/ai-codebase-portal-for-pms.png
coverAlt: "A plain-language question flows into a read-only codebase analyst and out as a ready-to-file ticket"
translationKey: "ai-codebase-portal-for-pms"
---

There's a particular interruption that every developer at a web agency knows. A project manager appears at your desk holding a client email. "The customer says checkout is broken on their store. Is that a real bug? Where is it? How big a job is it?" And you stop what you're doing, swap your whole mental context for theirs, go spelunking in a codebase you maybe haven't touched in three months, and come back twenty minutes later with an answer.

The answer was useful. The twenty minutes were expensive, and they were expensive for everyone: the PM waited, you lost your thread, and the next time it happened the cycle started over.

This is the story of an internal tool I built to remove that interruption — a portal where a non-technical project manager can ask a question about a client's PrestaShop codebase in plain language, get an answer grounded in the actual code, and turn it into a well-formed Jira ticket without ever bothering a developer. The interesting part isn't the chat box. It's the single constraint the entire design is built around: **the AI can read everything and write nothing.**

## The problem: developers are the only bridge to the code

At an agency that builds custom modules for clients, the codebase is the source of truth for an enormous number of everyday questions. Is this behaviour a bug or a config choice? Which files would a fix touch? Is the thing the client is describing even possible in how the code is structured? Has this always worked this way?

Every one of those questions has an answer sitting in the repository. But reading code fluently is a developer skill, and the project managers — the people who field the client emails and write the tickets — usually can't. So the codebase sits behind glass. The only way through it is to grab a developer.

That bottleneck costs more than the interruption itself. Tickets get written from a vague verbal summary instead of from the code, so they arrive thin: no file paths, no real sense of scope. Then the developer who picks the ticket up weeks later starts the investigation from scratch — the same investigation a colleague already did standing at someone's desk, lost because nobody wrote it down.

## What I actually wanted

The goal was deliberately narrow: let a PM ask a question in their own words and get back two things.

First, a **plain-language answer grounded in the real code.** Not a confident guess, and not a generic "here's how PrestaShop usually works" — an answer that points at real files and real lines in *this* client's repository, and that says so when the code doesn't actually support a conclusion.

Second, that answer **shaped like a ticket**: observed behaviour, suspected cause, the files involved, what would need to change. Close enough to drop straight into Jira, so the investigation survives.

If I could get those two things reliably, the developer interruption mostly disappears, and the tickets that reach the dev team arrive with a head start instead of from zero.

## The core idea: a read-only analyst, not an assistant

The temptation with anything agentic is to make it powerful — let it open pull requests, run commands, fix things. I went hard in the opposite direction, and that decision is the foundation everything else rests on.

The tool can **read** the codebase and nothing else. It can open files, search across them, and look things up — and that's the entire list of verbs it has. It cannot edit a file, run a shell command, or change anything anywhere. Its toolset is an explicit, short allowlist, and everything outside that list is denied at the boundary rather than discouraged in a prompt.

That powerlessness is the whole point. I can hand this tool to a non-technical colleague and not lose sleep, because **the worst thing it can do is be wrong** — and a wrong answer gets caught the moment a developer reads the ticket. There's no route from "the AI misunderstood something" to "the repository is in a bad state", since the repository was never writable to begin with. Power would have meant a long list of failure modes to defend against. Powerlessness meant I could ship it.

Regular readers will recognise the instinct. In an [earlier post about adding AI review to a self-hosted GitLab](/blog/claude-gitlab-ai-review/), the load-bearing rule was *never let a model read untrusted input and hold a privileged credential at the same time.* Here it's the same principle pointed the other way: give the AI the least power that still lets it do its job, and most of the frightening scenarios stop being possible instead of just being mitigated.

## How it works, without the plumbing

A few design choices turn "an AI that can read code" into something a PM can actually rely on.

**It works on a fresh, faithful copy of the code.** Each conversation analyses an isolated checkout of the client's repository, kept current in the background so an answer reflects what's actually in the project rather than a snapshot from whenever someone last looked. Different conversations don't step on each other. The point is that when the tool says "line 240 of this file does X", it's talking about the real, current code — grounding is the entire value proposition, so the copy it reads from has to be trustworthy.

**It's forced to cite, and forbidden to speculate.** The analyst is instructed to ground every claim in files it actually read, to quote only a few lines rather than dump code at someone who can't read it, and — the hard part — to say "the code doesn't support that conclusion" instead of inventing a plausible one. For external facts (a PrestaShop version, a library's behaviour, a CVE) it's told to look them up rather than trust its own memory.

**It translates, instead of explaining.** The audience is explicitly a non-technical PM. So the answer isn't a code walkthrough; it's the business impact in plain language, with the technical detail available but not in the way. "This affects every customer using a discount code at checkout" lands; "there's an off-by-one in the cart rule loop" does not.

**It hands off cleanly to Jira.** Because the answer is already structured like a ticket — observed behaviour, suspected cause, files involved, proposed change — turning it into a real Jira issue is one step, not a re-write. The investigation that used to evaporate at someone's desk now becomes a durable ticket with file paths already in it.

**Everything is logged.** Every question, every file the AI looked at, every ticket it drafted is recorded. Partly that's good hygiene for anything touching client code; partly it's so I can actually see how the tool is being used and where its answers go wrong.

## The part that was harder than I expected

The plumbing — reading code, keeping copies fresh, talking to Jira — was the easy half. The hard half was teaching the analyst to *not know things*.

A capable model's default failure mode isn't going blank; it's answering confidently anyway. Ask it where a bug is and it will happily reason its way to a plausible-sounding location whether or not the code actually says so. For a tool whose entire purpose is *grounding*, that's the one behaviour that would poison it. A PM can't tell a real, code-backed answer from a confident hallucination — that's exactly why they're using the tool — so an answer that *sounds* grounded but isn't is worse than no answer at all.

Most of the iteration went into pulling the analyst back toward "I checked, and the code doesn't show that" and away from "here's a tidy theory." Getting that calibration right mattered far more than any of the engineering around it. A tool like this earns trust slowly and loses it all at once: the first time a PM acts on a confident answer that turns out to be invented, they stop believing the next ten that were correct.

## What it changed

The interruptions dropped. A PM who would have walked over to a developer now asks the portal first, and most of the time that's the end of it. When it isn't — when the question is genuinely subtle, or the answer needs a human judgment call — the developer who gets pulled in is starting from a real answer with real file references, not a cold "can you look at this."

And the tickets got better. They arrive shaped by the actual code: a suspected cause, the files in play, a sense of scope. The investigation that used to happen verbally and then disappear now gets written down once and carried into the work.

It's still deliberately small — an internal, localhost-only tool, scoped so that the worst case stays small while it earns its trust. That constraint is a feature too. I'd rather ship something narrow that people rely on than something sprawling they're afraid to.

## Takeaways

1. **The most useful AI tool is often the least powerful one.** Read-only is what made this safe to hand to non-developers. Strip the verbs down to the job and most failure modes disappear by construction.
2. **Grounding is the product.** For an analyst aimed at people who can't check its work, "cite the file or say you don't know" is the entire value, not a nicety. Calibrating *that* was harder than all the engineering.
3. **Don't replace the developer; remove the interruption.** The point was never to automate judgment. It was to answer the easy questions directly and hand the genuinely hard ones to a developer who now starts warm instead of cold.
4. **Build for the reader who can't read code.** Translate to business impact, structure the output for where it's going to live, and the tool stops being a toy for engineers and starts being something the whole team uses.

People assume the clever part is the model reading a codebase and explaining it to someone who can't. Maybe. The part I actually care about is duller than that: it reads, and it never writes. That's the whole safety story, and it's why I sleep fine with it running on client code.
