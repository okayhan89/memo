const SCRIPT = `
(function () {
  try {
    var key = 'memo-theme';
    var stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (_) {}
})();
`.trim();

export function ThemeScript() {
  // Runs before hydration to prevent flash of wrong theme.
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
