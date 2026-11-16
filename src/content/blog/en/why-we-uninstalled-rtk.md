---
title: "Why I Uninstalled rtk: Saving Tokens Isn't Worth a Wrong grep"
description: "rtk rewrites an AI agent's shell commands to shrink their output. For my unattended Claude Code pipeline it also turned a correct grep into a confident zero, and the agent spent a morning asking me to add a config entry that was already there."
pubDate: 2026-11-16
tags: ["Claude Code", "AI Agents", "Developer Tools", "Bash", "Workflow"]
cover: ../_assets/why-we-uninstalled-rtk.svg
ogImage: ../_assets/why-we-uninstalled-rtk.png
coverAlt: "A terminal where grep -c on a settings file prints '🔍 0', next to the same file opened with jq showing 18 matching entries"
translationKey: "why-we-uninstalled-rtk"
---

This morning my agent pipeline asked me the same question about ten times. Every pass of the triage loop, it checked a config file, found nothing, and wrote in my briefing that an entry was still missing and that I should add it.

I had added it at 09:23. The file had 18 matching lines. The agent wasn't lying, exactly. It ran `grep`, `grep` said zero, and it believed `grep`. The problem was that the thing answering wasn't really `grep`.

So I uninstalled rtk. Here's why.

## What rtk does

**What is rtk?** rtk, "Rust Token Killer", is a small CLI proxy for AI coding agents. You wire it into Claude Code as a `PreToolUse` hook, and every Bash command the agent runs gets rewritten on the way out: `git status` becomes `rtk git status`, `grep` becomes `rtk grep`, `cat` becomes `rtk read`. rtk runs the real command and compresses the output before the model sees it. The pitch is 60 to 90% fewer tokens on routine dev operations.

The pitch isn't wrong. A `git log` or a long `ls` is mostly noise to a model, and context is the scarce resource in a long agent session. I installed it, I liked `rtk gain` telling me how much it had saved, and for interactive work I barely noticed it was there.

My setup isn't only interactive, though. I run an unattended pipeline (the one I mentioned in the [disk-full post](/blog/disk-full-ssh-rescue/)) that polls Jira and Gmail, writes me a morning briefing, and takes queued tickets all the way to a draft merge request. Headless `claude -p` runs, on systemd timers, with nobody watching the transcript as it happens. That's where it went wrong.

## The zero that wasn't

**What actually broke?** A worker job for a client shop needed to reproduce a front-end bug in a real browser. I'd said yes to giving the worker the `chrome-devtools` MCP tools, and the allowlist in `settings.worker.json` got its 18 new entries. The triage loop's job was to notice that and stop asking.

Here's what it ran, and what came back:

```bash
$ /usr/bin/grep -c chrome-devtools config/settings.worker.json
🔍 0 for 'chrome-devtools'
```

The agent even used the absolute path to `grep`, which looks like it was trying to get around something. The hook rewrote it anyway. The real answer:

```bash
$ jq -r '.permissions.allow[] | select(startswith("mcp__chrome"))' config/settings.worker.json | wc -l
18
```

That "🔍 0" landed in my briefing as a fact: *chrome-devtools is still missing (0 occurrences, re-checked 09:35)*. Each pass re-checked it, got the same answer, and wrote the same sentence with a fresher timestamp. The re-checking made it look more reliable than it was.

## It wasn't the first time

**Was this a one-off?** No, and that's the part that bothers me most. Going back through the pipeline's notes, the agent had been fighting rtk for days and writing down workarounds as it went:

- On November 11, a `grep "a\|b"` with an alternation returned 0 with no error. Three questions I had already answered got reported as still open.
- Flags like `-n`, `-E`, `-c` sometimes failed with `error: unexpected argument '-n' found`, because `rtk grep` only accepts `PATTERN [PATH]`.
- On November 15, `cat a.md b.md > report.md` got rewritten into `rtk read`, which refuses more than one file. The shell had already truncated `report.md` by then. My daily report was empty and had to be rebuilt from a backup.
- `git -C <path> …` became `rtk git -C …`, which rtk refused. I ended up writing a dedicated `git.sh` wrapper partly to dodge that.
- `ls` on several directories merged everything into one list with no headers, so you couldn't tell which file lived where.

None of these is a huge bug on its own, and some may be fixed in newer versions (I was on 0.18.1). What adds up is the folklore. My agent's memory had a whole note called "rtk grep pitfalls": one pattern per grep, never trust a zero, concatenate with `tail -n +1` instead of `cat`. The agent was spending its attention learning the quirks of a tool whose only job was to save it attention.

## Why the trade doesn't work for agents

**Why not just keep it and be careful?** Because a token saved is only worth something if the answer is still right, and for a lot of commands the output *is* the answer. `grep -c` returning `0` isn't verbose noise to be squeezed. It's a yes/no question, and getting it wrong is worse than paying for an extra 200 tokens.

A human using rtk in a terminal sees "🔍 0", frowns, and opens the file. An agent running alone at 6 a.m. doesn't frown. It writes the zero into a report, asks me to fix something that isn't broken, and parks a job on it. Unattended, a transparent rewrite becomes a silent one. I had no idea `grep` wasn't `grep` until I read the raw transcript.

There was a second cost, which I only saw once I stopped believing the briefing. The worker had actually run the job at 09:31 with the browser tools loaded and working. It had parked for a completely different reason: the staging URL was filed under another ticket's notes. The fake "missing config" story hid the real blocker for an hour. A wrong answer cost me more than the tokens it saved, and it also sent me looking in the wrong place.

## How I removed it

**What did uninstalling involve?** Not much, which is one nice thing about the hook design:

1. Remove the `PreToolUse` hook that calls `rtk-rewrite.sh` from `~/.claude/settings.json`.
2. Drop the `@RTK.md` include from the global `CLAUDE.md`, so the agent stops being told to use rtk commands.
3. Remove `Bash(rtk git:*)` from the pipeline's allowlist.
4. Replace the agent's "rtk pitfalls" memory with a short note: rtk is gone, `grep` and `cat` behave normally again, use `jq` to check JSON anyway.

Then a `sudo rm` on the binary, and it was gone.

## What I'd tell someone installing it

**Should you use rtk?** If you're at the keyboard watching the agent, maybe. The savings are real and you'll catch the weird outputs. If anything runs unattended, I wouldn't put a layer between the agent and its tools that changes what the commands *mean* and not only how much they print. Or at least I'd keep it away from anything whose output gets read as a yes or no.

I'll take the bigger context bill. Tokens are cheap next to a morning of an agent confidently asking me to fix something that wasn't broken.
