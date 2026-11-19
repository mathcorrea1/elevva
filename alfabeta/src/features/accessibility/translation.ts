export function allowedFragment(text: string) {
  return (
    text.trim().length > 0 &&
    text.length <= 1800 &&
    !/https?:\/\/|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{10,11}\b/i.test(
      text,
    )
  );
}
export function isolatedFrameURL(configured: string, appOrigin?: string) {
  const url = new URL(configured);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('Configure uma URL pública válida para o player Libras.');
  if (appOrigin && url.origin === appOrigin)
    throw new Error('O player Libras precisa de uma origem diferente da aplicação privada.');
  return url.href;
}
