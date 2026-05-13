import React from 'react';
import { render } from '@testing-library/react-native';

import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders label and value', () => {
    const { getByDisplayValue } = render(
      <Input label="E-mail" value="teste@email.com" onChangeText={jest.fn()} />,
    );
    expect(getByDisplayValue('teste@email.com')).toBeTruthy();
  });
});
