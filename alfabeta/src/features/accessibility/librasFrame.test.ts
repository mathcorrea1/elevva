/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

function bridge() {
  const parent = { postMessage: jest.fn() };
  const fragment = { textContent: '', click: jest.fn() };
  const status = { textContent: '' };
  let receive: (event: any) => void = () => {};
  const window: any = {
    parent,
    VLibrasWidget: { initBtn: { getBoundingClientRect: () => ({ width: 0 }), click: jest.fn() } },
    addEventListener: (_name: string, callback: typeof receive) => {
      receive = callback;
    },
  };
  const append = jest.fn();
  const document = {
    getElementById: (id: string) => (id === 'fragment' ? fragment : status),
    createElement: () => ({}),
    body: { style: {}, appendChild: append },
  };
  runInNewContext(readFileSync(join(__dirname, '../../../public/libras-frame.js'), 'utf8'), {
    window,
    document,
    setTimeout: jest.fn(),
  });
  return {
    parent,
    fragment,
    append,
    receive: (origin: string, data: object, source = parent) => receive({ origin, data, source }),
  };
}

test('only the parent origin that supplied a consented fragment can request its translation', () => {
  const b = bridge();
  b.receive('https://app.example', { type: 'elevva-libras-translate' });
  expect(b.fragment.click).not.toHaveBeenCalled();
  b.receive('https://app.example', {
    type: 'elevva-libras-fragment',
    consent: true,
    text: 'Bom dia',
  });
  expect(b.fragment.textContent).toBe('Bom dia');
  expect(b.append).toHaveBeenCalledTimes(1);
  b.receive('https://other.example', { type: 'elevva-libras-translate' });
  expect(b.fragment.click).not.toHaveBeenCalled();
  b.receive('https://app.example', { type: 'elevva-libras-translate' }, { postMessage: jest.fn() });
  expect(b.fragment.click).not.toHaveBeenCalled();
  b.receive('https://app.example', { type: 'elevva-libras-translate' });
  expect(b.fragment.click).toHaveBeenCalledTimes(1);
});

test('without consent or with contact data the public document does not initialize translation', () => {
  const b = bridge();
  for (const data of [
    { consent: false, text: 'Bom dia' },
    { consent: true, text: 'pessoa@example.com' },
  ]) {
    b.receive('https://app.example', { type: 'elevva-libras-fragment', ...data });
  }
  b.receive('https://app.example', { type: 'elevva-libras-translate' });
  expect(b.fragment.textContent).toBe('');
  expect(b.append).not.toHaveBeenCalled();
  expect(b.fragment.click).not.toHaveBeenCalled();
});
