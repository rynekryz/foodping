export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export function htmlToText(html) {
  if (!html) return '';
  return (new DOMParser().parseFromString(String(html), 'text/html').body.textContent || '').trim();
}

export function setLines(el, text) {
  const nodes = text.split('\n').flatMap((line, i) => (i ? [document.createElement('br'), line] : [line]));
  el.replaceChildren(...nodes);
  el.dataset.text = text;
}

export function openExternal(url) {
  const safe = safeUrl(url);
  if (safe) window.open(safe, '_blank', 'noopener,noreferrer');
}
