const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format "YYYY-MM" → "Mon YYYY", or year-only "YYYY" → "YYYY".
 * Returns "Present" for falsy input.
 */
export function formatDate(value: string | undefined | null): string {
  if (!value) return 'Present';
  const trimmed = value.trim();
  // Year-only: "2025"
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  // "YYYY-MM"
  const match = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const monthIdx = parseInt(match[2], 10) - 1;
    const monthName = MONTHS[monthIdx] ?? match[2];
    return `${monthName} ${match[1]}`;
  }
  return trimmed;
}

/** "startDate – endDate" with endDate defaulting to "Present" */
export function dateRange(startDate: string, endDate?: string): string {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

/** HTML-escape user content to prevent XSS */
export function esc(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render HTML only if value is truthy */
export function renderIf(value: string | undefined | null, htmlFn: (v: string) => string): string {
  return value ? htmlFn(value) : '';
}

/**
 * Resolve a project link (string | { url, label }) into a usable href + display
 * text (feature 1.4 — "link display mode"). Returns null when there is no URL.
 * `href` is normalized so bare domains become clickable in the exported PDF.
 */
export function linkParts(
  link: string | { url?: string; label?: string } | undefined | null,
): { href: string; text: string } | null {
  if (!link) return null;
  const url = (typeof link === 'string' ? link : link.url || '').trim();
  if (!url) return null;
  const label = (typeof link === 'string' ? '' : (link.label || '')).trim();
  const href = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`;
  return { href, text: label || url };
}

/**
 * Rewrite a template's CSS so every selector is scoped to `.resume-root`.
 * Without this, the template's `*`, `html`, `body`, `h1`, `ul`, etc. rules
 * leak onto the host page when the HTML is `innerHTML`'d into a div during
 * PDF export — which is exactly what made all five templates produce blank
 * PDFs and squish the running app's layout.
 *
 * Idempotent: selectors already starting with `.resume-root` are left alone.
 * `@page`, `@font-face`, `@keyframes`, etc. are passed through unchanged.
 */
export function scopeCssToResumeRoot(css: string): string {
  const rules: string[] = [];
  let i = 0;
  const len = css.length;

  while (i < len) {
    // Skip leading whitespace and comments
    while (i < len && /\s/.test(css[i])) i++;
    if (i + 1 < len && css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? len : end + 2;
      continue;
    }
    if (i >= len) break;

    if (css[i] === '@') {
      // @rule: pass through verbatim. May end with `;` (no body) or `}` (with body)
      const start = i;
      while (i < len && css[i] !== '{' && css[i] !== ';') i++;
      if (i >= len) { rules.push(css.slice(start)); break; }
      if (css[i] === ';') {
        i++;
        rules.push(css.slice(start, i));
      } else {
        let depth = 1;
        i++;
        while (i < len && depth > 0) {
          if (css[i] === '{') depth++;
          else if (css[i] === '}') depth--;
          i++;
        }
        rules.push(css.slice(start, i));
      }
      continue;
    }

    // Regular rule: <selectors> { <body> }
    const sStart = i;
    while (i < len && css[i] !== '{' && css[i] !== '}') i++;
    if (i >= len || css[i] === '}') break;
    const selectors = css.slice(sStart, i).trim();
    let depth = 1;
    i++;
    const bStart = i;
    while (i < len && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const body = css.slice(bStart, i - 1);

    const scopedList = selectors
      .split(',')
      .map((sRaw) => {
        const s = sRaw.trim();
        if (!s) return '';
        if (s.startsWith('.resume-root')) return s;          // already scoped
        if (s === '*') return '.resume-root, .resume-root *'; // include root for resets
        // `html`, `body`, `html.foo`, `body.bar` → replace the root
        const m = /^(html|body)(\b[^,]*)?$/.exec(s);
        if (m) return '.resume-root' + (m[2] ?? '');
        return '.resume-root ' + s;
      })
      .filter(Boolean);

    // Dedupe: html, body → .resume-root, .resume-root → just .resume-root
    const seen = new Set<string>();
    const scoped = scopedList
      .flatMap((s) => s.split(',').map((p) => p.trim()).filter(Boolean))
      .filter((s) => (seen.has(s) ? false : (seen.add(s), true)))
      .join(', ');

    rules.push(`${scoped} {${body}}`);
  }

  return rules.join('\n');
}

/**
 * Ensure the template's body content is wrapped in `<div class="resume-root">`
 * — the scoping selectors above need this wrapper to take effect. Idempotent:
 * skips templates that already contain a `.resume-root` wrapper.
 */
export function wrapBodyInResumeRoot(html: string): string {
  if (/class="resume-root"/.test(html)) return html;
  return html.replace(
    /<body([^>]*)>([\s\S]*?)<\/body>/i,
    '<body$1><div class="resume-root">$2</div></body>',
  );
}

/** Apply both transforms — call from renderTemplate so every template benefits */
export function applyResumeRootScoping(html: string): string {
  return wrapBodyInResumeRoot(
    html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_m, attrs: string, css: string) =>
      `<style${attrs}>${scopeCssToResumeRoot(css)}</style>`),
  );
}
