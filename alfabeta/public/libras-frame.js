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
    document.body.style.background = value.dark ? '#15273B' : '#FFFFFF';
    document.body.style.color = value.dark ? '#F2F7FF' : '#142239';
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
        status('Abra o botão do VLibras e selecione o trecho para traduzir.');
      }, 1000);
    };
    script.onerror = () =>
      status('Não foi possível carregar o VLibras. O texto continua disponível.');
    document.body.appendChild(script);
  };
  window.addEventListener('message', (event) => {
    if (
      event.source !== window.parent ||
      event.origin === 'null' ||
      event.data?.type !== 'elevva-libras-fragment'
    )
      return;
    parentOrigin = event.origin;
    window.elevvaSetFragment(event.data);
  });
})();
