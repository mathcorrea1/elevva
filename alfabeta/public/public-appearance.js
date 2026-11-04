// Appearance values only. This public page never loads a user profile or private app DOM.
const appearanceQuery = new URLSearchParams(location.search);
const helpTheme = ['light', 'dark', 'system'].includes(appearanceQuery.get('theme'))
  ? appearanceQuery.get('theme')
  : 'system';
const helpContrast = appearanceQuery.get('contrast') === '1';
const helpScale = [1, 1.25, 1.5].includes(Number(appearanceQuery.get('scale')))
  ? Number(appearanceQuery.get('scale'))
  : 1;
function applyPublicAppearance() {
  const dark =
    helpTheme === 'dark' ||
    (helpTheme === 'system' && matchMedia('(prefers-color-scheme:dark)').matches);
  const colors = dark
    ? {
        background: helpContrast ? '#000000' : '#0B1726',
        text: '#FFFFFF',
        primary: '#9CDCFF',
        border: '#FFFFFF',
        focus: '#FFD29A',
      }
    : {
        background: '#FFFFFF',
        text: helpContrast ? '#000000' : '#142B45',
        primary: helpContrast ? '#003E80' : '#0757A8',
        border: helpContrast ? '#000000' : '#778DA6',
        focus: '#A64500',
      };
  Object.entries(colors).forEach(([name, value]) =>
    document.documentElement.style.setProperty('--' + name, value),
  );
  document.documentElement.style.fontSize = 16 * helpScale + 'px';
}
applyPublicAppearance();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', applyPublicAppearance);
document.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('iframe.public-help');
  if (frame)
    frame.src =
      '/ajuda-publica-libras-frame.html?' +
      new URLSearchParams({
        theme: helpTheme,
        contrast: helpContrast ? '1' : '0',
        scale: String(helpScale),
      });
});
