/* (C) Apply before first paint. Theme preference is separate from user data. */
(() => {
  const choices = ['fleur', 'light', 'dark', 'chrome'];
  const key = 'fleur.appearance';
  function apply(value, persist = true) {
    const theme = choices.includes(value) ? value : 'chrome';
    document.documentElement.dataset.theme = theme;
    if (persist) { try { localStorage.setItem(key, theme); } catch (_) { /* Private storage: retain session theme. */ } }
    window.dispatchEvent(new CustomEvent('fleur-theme-change', { detail: theme }));
  }
  let saved = 'chrome';
  try { saved = localStorage.getItem(key) || 'chrome'; } catch (_) { /* Default remains Chrome. */ }
  apply(saved, false);
  window.FleurAppearance = { apply, current: () => document.documentElement.dataset.theme };
})();
