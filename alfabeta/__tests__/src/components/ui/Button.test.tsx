import React from 'react';
import { render } from '@testing-library/react-native';

import { Button } from '@/components/ui/Button';

describe('Button from mirrored tests', () => {
  it('renders label', () => {
    const { getByText } = render(<Button label="Teste" onPress={() => {}} />);
    expect(getByText('Teste')).toBeTruthy();
  });
});
