const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]!);
}

const URL_RE = /(?<![@a-zA-Z0-9-])((?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<) ]*)?)/g;

export function autolinkUrls(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(URL_RE, (match) => {
    const trimmed = match.replace(/[.,;:!?]+$/, "");
    const trailing = match.slice(trimmed.length);
    if (!trimmed) return match;
    const href = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    return `<a href="${href}" target="_blank" rel="noopener">${trimmed}</a>${trailing}`;
  });
}
