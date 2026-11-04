import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider, palette, useTheme } from './ThemeProvider';
import { Field, Action } from '@/shared/ui';
import { useState } from 'react';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
function contrast(a: string, b: string) {
  function luminance(value: string) {
    const channels = [1, 3, 5]
      .map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
])('semantic text and controls contrast dark=%s high=%s', (dark, high) => {
  const c = palette(dark, high);
  expect(contrast(c.text, c.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.secondary, c.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.onPrimary, c.error)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.focus, c.surface)).toBeGreaterThanOrEqual(3);
  expect(contrast(c.border, c.surface)).toBeGreaterThanOrEqual(3);
  expect(contrast(c.primary, c.primarySoft)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.onHero, c.hero)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.onHero, c.heroEnd)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
});
function Form() {
  const [value, setValue] = useState('');
  const t = useTheme();
  return (
    <>
      <Field label="Nome" value={value} onChangeText={setValue} />
      <Action
        title="Tema"
        onPress={() => t.update({ theme: 'dark', contrast: true, font_scale: 1.5 })}
      />
    </>
  );
}
test('appearance update keeps the mounted input and form value', async () => {
  const view = render(
    <ThemeProvider>
      <Form />
    </ThemeProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.changeText(view.getByLabelText('Nome'), 'Lia fictícia');
  fireEvent.press(view.getByRole('button', { name: 'Tema' }));
  expect(view.getByLabelText('Nome').props.value).toBe('Lia fictícia');
});
