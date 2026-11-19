import { allowedFragment, isolatedFrameURL } from './translation';
test('translation frame must use a separate public origin and cannot carry query data or credentials', () => {
  expect(
    isolatedFrameURL('http://127.0.0.1:8081/libras-frame.html', 'http://localhost:8081'),
  ).toContain('127.0.0.1');
  for (const url of [
    'http://localhost:8081/libras-frame.html',
    'javascript:alert(1)',
    'https://user:secret@example.invalid/frame',
    'https://frame.invalid/?text=private',
    'https://frame.invalid/#private',
  ])
    expect(() => isolatedFrameURL(url, 'http://localhost:8081')).toThrow();
});
test('contacts, documents, links and excessive content cannot be sent as a fragment', () => {
  for (const text of [
    '',
    'x'.repeat(1801),
    'Nome aluno@example.com',
    'Documento 123.456.789-10',
    'Veja https://example.com',
  ]) {
    expect(allowedFragment(text)).toBe(false);
  }
  expect(allowedFragment('Vamos juntar as sílabas para formar uma palavra.')).toBe(true);
});
