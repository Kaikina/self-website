---
title: "Three Strings and Two Fallbacks: Wiring the Native Share Sheet Into Forgemage.net"
description: "The share button on Forgemage.net's request detail page opens the OS share sheet wherever the operating system has one — Android, iOS, Windows, macOS — copies the link where it doesn't, and stays quiet when you simply change your mind. Here's the whole implementation: navigator.share with three strings, an AbortError guard that falls through instead of catching, a clipboard fallback with an execCommand fallback under it, and the one-letter Symfony detail that decides whether the shared link works at all."
pubDate: 2026-08-27
tags: ["JavaScript", "Web Share API", "Symfony", "Twig", "Progressive Enhancement"]
cover: ../_assets/forgemage-native-share-sheet.svg
ogImage: ../_assets/forgemage-native-share-sheet.png
coverAlt: "A share button on a web page opening the operating system share sheet, with a clipboard copy path underneath it for browsers that have no sheet"
translationKey: "forgemage-native-share-sheet"
---

Every mobile app has that button. You tap it, a tray slides up from the bottom of the screen, and there's WhatsApp, Messages, AirDrop, Notes, Discord, whatever you happen to have installed. For years that tray was native-only territory, and the web's answer was a row of brand icons opening `twitter.com/intent/tweet` in a new tab.

The tray is available to web pages now. `navigator.share()` opens the exact same OS sheet, and the happy path is six lines.

I shipped it last week on [Forgemage.net](https://forgemage.net), the Dofus smithmagie marketplace I keep writing about after [taking the N+1 out of its search page](/blog/forgemage-search-n1-queries/). A smithmage opens a magging request, wants to send it to a friend who might take the job, and until last week the only way to do that was selecting the URL bar on a phone. Now there's a Share button next to Archive.

The six lines were the easy part. What took the afternoon was everything around them: where the URL comes from, what happens when someone swipes the sheet away, and what the button should do in a browser whose OS has no share sheet at all.

## The API is three strings and a promise

**What does the browser actually hand you?**

Not much, and that's the appeal:

```js
await navigator.share({
    title: 'Magging Request Details',
    text: 'Someone wants a Gelano maged',
    url: 'https://forgemage.net/request/01JQ...',
});
```

Three optional strings, plus a `files` array. No SDK, no app ID, no OAuth dance, no script tag from a company that would like to A/B test my page for me.

Two hard requirements, though. The page has to be a secure context, so HTTPS in production and localhost while you work. And the call has to happen inside a real user gesture. Not on `DOMContentLoaded`, not in a `setTimeout`, and — this is the one that catches people — not after an `await` that goes to the network. Fetch a short link from your own API and *then* call `share()`, and the transient activation is gone and the browser rejects you. Whatever you're going to share has to be sitting in memory before the click.

## Where the URL comes from decides whether the link works

**Why not just share `location.href`?**

Because on Forgemage.net the address bar isn't reliably the thing worth sending. The request detail route is localized, so the same page lives at `/request/{ulid}` in English, `/requete/{ulid}` in French and `/pedido/{ulid}` in Spanish. Several of the interesting entry points are dashboard views whose visible URL carries query state nobody else needs.

So the URL comes from the server, in the markup:

```twig
<button type="button" class="rd-cta rd-cta--ghost rd-share"
        data-share-url="{{ url('app_request_detail', {'ulid': fmRequest.ulid}) }}"
        data-share-title="{{ 'Magging Request Details'|trans }}"
        data-copied-label="{{ 'Copied'|trans }}">
    <i class="bi bi-share-fill"></i>
    <span class="rd-share__label">{% trans %}Share{% endtrans %}</span>
</button>
```

The important character in there is the `u` in `url()`. Symfony's `path()` generates `/request/01JQ…`, which is perfect for an `href` and useless in a share payload: pasted into Discord it isn't a link, and a native target has no idea what host to prepend. `url()` gives the absolute form. One letter between a working feature and a bug report that says "the link doesn't open".

The rest of the attributes exist because JavaScript can't reach the Twig translator. The label, the confirmation string and the share title are rendered server-side into `data-*` and read back at click time. Slightly ugly, and the alternative is shipping a translation catalogue to the client so a button can say "Copied" in three languages.

The ULID is doing quiet work too. The route is `/{ulid:fmRequest}`, so shared links aren't guessable the way sequential ids are. Nobody's going to walk `/request/1`, `/request/2` and read the whole table because I put a share button on the page.

## One fallthrough handles every failure

**What happens when the sheet doesn't open?**

This is the entire share handler, and its shape is the only real decision in the file:

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

Two `return`s and no `else`. The success path returns, the cancel path returns, and everything else falls out of the `if` and lands on the clipboard: no `navigator.share` at all, a `NotAllowedError` from a lost gesture, a `DataError` from a URL that doesn't parse, a Permissions Policy blocking the call inside an iframe. I never had to enumerate the failures. I only had to name the two cases where doing nothing is the correct behaviour.

`AbortError` is the one worth being careful about. It's what you get when the user swipes the sheet away, and it arrives as a rejected promise looking exactly like a real problem. Catch it generically and you show "Sharing failed" to somebody who simply changed their mind, which is the kind of small thing that makes software feel like it isn't paying attention. Cancelling is a successful outcome of a share sheet. It just isn't a share.

The other quiet win is desktop, and it isn't the one I expected. The share sheet isn't a phone feature: Chrome and Edge on Windows hand the payload to the Windows share flyout, and Safari on macOS opens the same sheet any Mac app gets. What decides it is whether the OS has a share UI and the browser bothers to wire it up. Linux doesn't have one, so `navigator.share` is undefined and my own Chrome copies the link instead — the fallback was the only path I saw for the first hour of building this. Firefox on desktop doesn't implement it anywhere. All of that is one `if` and no feature flag: the markup ships one button and each browser decides what it means.

## The fallback has a fallback

**Why keep `document.execCommand('copy')` around in 2026?**

Because `navigator.clipboard` needs a secure context and a permission that can be refused, and a copy button that silently does nothing is worse than no copy button:

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

The off-screen textarea trick is deprecated, works nearly everywhere, and returns a boolean I can act on. Note the `opacity: 0` with `position: fixed` rather than `display: none` or a negative offset: the field has to be selectable, so it can be invisible but it can't be gone, and it shouldn't scroll the page on the way in. It also has to come out in the same tick, otherwise a slow frame leaves a real focusable element in the DOM for a screen reader to find.

Both paths return a boolean rather than throwing, which is why the caller reads as one clean `if`.

## The button has to answer

**How does the user know anything happened?**

On the native path they know, because the OS drew a sheet over the page. On the clipboard path nothing visible happens at all, so the button says it itself:

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

Icon becomes a checkmark, label becomes the translated "Copied", both go back after 1.8 seconds. No toast library, no notification container, no state store. The feedback lives on the element the user just touched, which is where their eyes already are.

Reading `original` off the DOM instead of hardcoding "Share" is what makes the restore correct in French and Spanish. And 1800 is a number I picked because 1000 felt clipped and 3000 felt like the button was stuck.

## What I left out on purpose

**Why is there no `text`, and no image?**

The payload is `title` and `url`, nothing else, and that's deliberate. The spec is explicit that all three fields are hints: the receiving app decides what to do with them, and several targets take exactly one of `text` or `url` and drop the other on the floor. Passing both is how you end up with a message that describes a magging request without linking to it. If the link is the point, send the link.

`title` is mostly ignored too. Android Chrome uses it as the subject line for mail targets and discards it elsewhere. I pass it because when it does get read it's the right string, and when it doesn't, nothing is lost.

Files would be the obvious next step, since a request detail page has an item and a stat line that would screenshot nicely:

```js
if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
}
```

`canShare()` is the only honest way to find out whether the platform accepts that MIME type and that size, and it shipped later than `share()` itself, hence the optional call. I skipped all of it. Rendering an image server-side, prefetching it before the click so the user gesture survives, and accepting that several platforms ignore `url` when `files` is present is a feature, not a fallback. Different afternoon.

Same for the other direction. A PWA can register itself *inside* the sheet with `share_target` in its manifest and receive a plain multipart POST, which any Symfony controller already knows how to read. Android only, nothing on iOS, and Forgemage.net isn't installable yet.

## The bits I'm not proud of

**What's still owed?**

The shared link hits a login wall. `RequestController::detail()` calls `denyAccessUnlessGranted('ROLE_USER')`, so a friend who taps the link without an account lands on a login page instead of the request. Correct for the data, rough as a first impression for a link somebody chose to send. A public teaser view would fix it and I haven't built one.

The locale rides along. `url()` generates the path for the sharer's locale, so a French smithmage sharing to a Spanish friend sends them `/requete/…`, and the app serves it in French. Sharing arguably wants a locale-neutral canonical URL. I send the localized one because that's what the route helper gives you without thinking about it.

The button markup exists twice in `detail.html.twig`, once in each branch of the owner/visitor condition, all three `data-*` attributes duplicated. It should be a component or an include taking the request. It's a copy-paste, and I noticed it while writing this paragraph rather than while writing the template.

And I have no idea whether anyone uses it. No event, no counter, nothing. The honest version of this post opens with a number instead of a story.

## Takeaways

1. **The gesture is the constraint, not the API.** `navigator.share()` is three strings, and the main way to get it wrong is to `await` something else first. Build the payload before the click, or share a URL you already have.
2. **`AbortError` means "no, thanks".** Treat a dismissed sheet as a failure and your app tells people off for changing their mind. Two `return`s in the right place, and every other failure can share one fallback.
3. **Absolute URLs or nothing.** In Symfony that's `url()`, not `path()`. A relative link in a share payload stops being a link the moment it leaves the browser.
4. **Feature-detect to reshape the button, not to hide it.** One `<button>` in the template opens the OS sheet on Android, iOS, Windows and macOS, and copies the link on Linux or in Firefox, and nobody ever sees a control that does nothing.
5. **Server-render your microcopy into `data-*`.** Cheapest way to keep a JS-driven label translated without shipping a catalogue to the client.

Forty lines of JavaScript and one letter of Twig. It won't appear in a changelog anyone reads. But a request that gets forwarded to the right smithmage is a request that gets done, and until last week forwarding one meant selecting the URL bar with your thumb. That's the whole feature.
