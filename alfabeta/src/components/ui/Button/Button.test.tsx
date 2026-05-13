import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders and calls onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Entrar" onPress={onPress} />);
    fireEvent.press(getByText('Entrar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
