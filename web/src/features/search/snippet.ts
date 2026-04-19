// Convert a server-produced snippet with private delimiters («mark» / «/mark»)
// into safe HTML where the original text is escaped and only our own <mark>
// tags are left intact. Prevents stored-XSS through note content.

const MARK_OPEN = '«mark»';
const MARK_CLOSE = '«/mark»';

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char);
}

export function renderSnippet(snippet: string | null | undefined): string {
  if (!snippet) return '';
  return escapeHtml(snippet).replaceAll(MARK_OPEN, '<mark>').replaceAll(MARK_CLOSE, '</mark>');
}
