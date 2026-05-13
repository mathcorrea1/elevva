import React from 'react';
import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error('Global ErrorBoundary', error.message);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Ocorreu um erro inesperado.</Text>
          <Button label="Tentar novamente" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}
