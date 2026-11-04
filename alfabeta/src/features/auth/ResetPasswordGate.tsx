import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Linking, Platform } from 'react-native';
import { Page, Copy, Field, Action, Notice } from '@/shared/ui';
import { authRequest, betterAuthSession } from './session';
function tokenFrom(url: string) {
  try {
    const match = /(?:[?&])token=([^&#]*)/.exec(url);
    const token = match ? decodeURIComponent(match[1]) : null;
    return token && token.length <= 512 ? token : null;
  } catch {
    return null;
  }
}
export function ResetPasswordGate({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() =>
    Platform.OS === 'web' ? tokenFrom(window.location.href) : null,
  );
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Linking.getInitialURL().then((url) => {
      if (url) setToken(tokenFrom(url));
    });
    const sub = Linking.addEventListener('url', ({ url }) => setToken(tokenFrom(url)));
    return () => sub.remove();
  }, []);
  async function reset() {
    setBusy(true);
    setMessage('');
    try {
      await authRequest('/reset-password', { token, newPassword: password });
      await betterAuthSession.logout().catch(() => undefined);
      setPassword('');
      setRepeat('');
      setToken(null);
      if (Platform.OS === 'web') window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!token) return <>{children}</>;
  return (
    <Page title="Nova senha">
      <Copy>O link é de uso único. Após salvar, entre novamente.</Copy>
      <Field
        label="Nova senha (mínimo 10 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        label="Repita a nova senha"
        value={repeat}
        onChangeText={setRepeat}
        secureTextEntry
        autoComplete="new-password"
      />
      <Action
        title="Salvar nova senha"
        disabled={busy || password.length < 10 || password !== repeat}
        onPress={() => void reset()}
      />
      {message ? <Notice error text={message} /> : null}
      <Action
        secondary
        title="Cancelar recuperação"
        onPress={() => {
          setToken(null);
          if (Platform.OS === 'web') window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    </Page>
  );
}
