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
