/* Serve this PUBLIC file on an origin different from the private application and API. */
(() => {
  let loaded = false;
  let parentOrigin = '';
  const status = (message) => {
    document.getElementById('status').textContent = message;
    if (parentOrigin)
      window.parent.postMessage({ type: 'elevva-libras-status', message }, parentOrigin);
    if (window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'elevva-libras-status', message }),
      );
  };
  // Explicit native injection or an authenticated parent-window relationship, never URL/query data.
  window.elevvaSetFragment = (value) => {
    const text = value && typeof value.text === 'string' ? value.text : '';
    if (
      !value ||
      value.consent !== true ||
      !text.trim() ||
      text.length > 1800 ||
      /https?:\/\/|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/i.test(text)
    ) {
      status('Revise o trecho. Não inclua contato, documentos ou links.');
      return;
    }
    document.getElementById('fragment').textContent = text;
    document.body.style.background = value.contrast
      ? value.dark
        ? '#000000'
        : '#FFFFFF'
      : value.dark
        ? '#15273B'
        : '#FFFFFF';
    document.body.style.color = value.contrast
      ? value.dark
        ? '#FFFFFF'
        : '#000000'
      : value.dark
        ? '#F2F7FF'
        : '#142239';
    document.body.style.fontSize = 16 * Math.min(1.5, Math.max(1, Number(value.scale) || 1)) + 'px';
    if (loaded) return;
    loaded = true;
    status('Carregando VLibras. O player pode levar alguns instantes.');
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = () => {
      setTimeout(() => {
        if (window.VLibras && !document.querySelector('#vlibras-access-wrapper,[vw]'))
          new window.VLibras.Widget('https://vlibras.gov.br/app');
        if (!window.VLibras) {
          status('VLibras indisponível. Confira a rede ou tente novamente.');
          return;
        }
        // Public documented launcher reference; do not call private translation APIs.
        const launcher = window.VLibrasWidget && window.VLibrasWidget.initBtn;
        if (launcher && launcher.getBoundingClientRect().width) launcher.click();
        status('Aguarde o avatar aparecer. Depois use Traduzir trecho.');
      }, 1000);
    };
    script.onerror = () =>
      status('Não foi possível carregar o VLibras. O texto continua disponível.');
    document.body.appendChild(script);
  };
  window.elevvaTranslateFragment = () => {
    if (!loaded || !document.getElementById('fragment').textContent.trim()) return;
    const launcher = window.VLibrasWidget && window.VLibrasWidget.initBtn;
    if (!launcher) {
      status('O player ainda está carregando. Aguarde e tente novamente.');
      return;
    }
    if (launcher.getBoundingClientRect().width) {
      launcher.click();
      status('Aguarde o avatar aparecer e use Traduzir trecho novamente.');
      return;
    }
    // Same text-selection click supported by the widget, restricted to the consented fragment.
    document.getElementById('fragment').click();
    status('Tradução solicitada. Confira o player; se não responder, tente novamente.');
  };
  window.addEventListener('message', (event) => {
    if (
      event.source !== window.parent ||
      event.origin === 'null' ||
      !['elevva-libras-fragment', 'elevva-libras-translate'].includes(event.data?.type)
    )
      return;
    if (event.data.type === 'elevva-libras-translate') {
      if (event.origin === parentOrigin) window.elevvaTranslateFragment();
      return;
    }
    parentOrigin = event.origin;
    window.elevvaSetFragment(event.data);
  });
})();
