import React from 'react';
import type { PropsWithChildren } from 'react';
import { Page, Notice, Action } from '@/shared/ui';
export class AccessibleErrorBoundary extends React.Component<
  PropsWithChildren,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <Page title="Não foi possível abrir esta tela">
          <Notice
            error
            text="Tente abrir novamente. As gravações confirmadas continuam no servidor; alterações ainda não enviadas podem precisar ser refeitas."
          />
          <Action title="Tentar novamente" onPress={() => this.setState({ failed: false })} />
        </Page>
      );
    return this.props.children;
  }
}
