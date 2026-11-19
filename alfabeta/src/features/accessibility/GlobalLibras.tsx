import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { View, Platform, Linking } from 'react-native';
import { Hand, RotateCcw } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { Action, Copy, Field, Notice } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Badge, Pills } from '@/shared/ui/learning';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { allowedFragment, isolatedFrameURL } from './translation';
import { Libras } from './Libras';
import { LibrasContext as Context } from './libras-context';
import type { Fragment } from './libras-context';

const help: Record<string, string> = {
  navigation:
    'Bem-vindo ao Elevva. Início apresenta seus próximos passos. Em Trilhas, escolha um caminho e continue suas aulas. Perfil reúne sua conta e as configurações. Voltar retorna à tela anterior sem encerrar sua conta.',
  lessons:
    'Cada aula tem uma tela por vez. Use anterior e próxima para navegar. Quando houver uma atividade, escolha sua resposta e confirme. Para continuar depois, use pausar. Confira se o progresso foi salvo antes de sair.',
  reports:
    'Relatórios mostram os registros de aprendizagem no período escolhido. Tarefas concluídas são diferentes de tentativas. Itens aguardando revisão ainda não contam como erro ou acerto. O nível é informado pelo professor.',
  settings:
    'Em configurações, escolha aparência clara, escura ou do sistema. Alto contraste pode ser ativado separadamente. Você pode ampliar o texto, mostrar a leitura das instruções e reduzir movimentos.',
};
export function LibrasProvider({ children }: React.PropsWithChildren) {
  const { colors, dark, preferences, preferenceOwner } = useTheme();
  const [visible, setVisible] = useState(false);
  const [fragment, setFragment] = useState<Fragment | null>(null);
  const [topic, setTopic] = useState('navigation');
  const [text, setText] = useState(help.navigation);
  const [consent, setConsent] = useState(false);
  const [frameURL, setFrameURL] = useState('');
  const [failed, setFailed] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const nativeFrame = useRef<WebView>(null);
  const register = useCallback((value: Fragment) => setFragment(value), []);
  const clear = useCallback(
    (owner: string) => setFragment((old) => (old?.owner === owner ? null : old)),
    [],
  );
  const open = useCallback(() => {
    setVisible(true);
    setFrameURL('');
    setFailed('');
    setConsent(false);
    setTopic(fragment ? 'content' : 'navigation');
    setText(fragment?.text || help.navigation);
  }, [fragment]);
  const context = useMemo(() => ({ open, register, clear }), [open, register, clear]);
  const nativeEnabled =
    Platform.OS !== 'web' && process.env.EXPO_PUBLIC_LIBRAS_WEBVIEW_ENABLED === 'true';
  function send() {
    if (!frameURL) return;
    const data = {
      type: 'elevva-libras-fragment',
      text,
      consent: true,
      dark,
      contrast: preferences.contrast,
      scale: preferences.font_scale,
    };
    if (Platform.OS === 'web')
      frame.current?.contentWindow?.postMessage(data, new URL(frameURL).origin);
    else
      nativeFrame.current?.injectJavaScript(
        'window.elevvaSetFragment && window.elevvaSetFragment(' + JSON.stringify(data) + '); true;',
      );
  }
  function translate() {
    if (!frameURL) return;
    if (Platform.OS === 'web')
      frame.current?.contentWindow?.postMessage(
        { type: 'elevva-libras-translate' },
        new URL(frameURL).origin,
      );
    else
      nativeFrame.current?.injectJavaScript(
        'window.elevvaTranslateFragment && window.elevvaTranslateFragment(); true;',
      );
  }
  useEffect(() => {
    setVisible(false);
    setFrameURL('');
    setFragment(null);
  }, [preferenceOwner]);
  function start() {
    setFailed('');
    try {
      const configured =
        process.env.EXPO_PUBLIC_LIBRAS_FRAME_URL ||
        (__DEV__ && Platform.OS === 'web' ? 'http://127.0.0.1:8081/libras-frame.html' : '');
      const url = isolatedFrameURL(
        configured,
        Platform.OS === 'web' ? window.location.origin : undefined,
      );
      const privateOrigins = [process.env.EXPO_PUBLIC_API_URL, process.env.EXPO_PUBLIC_AUTH_URL]
        .filter(Boolean)
        .map((value) => new URL(value!).origin);
      if (privateOrigins.includes(new URL(url).origin))
        throw new Error(
          'Use uma origem pública exclusiva para Libras, diferente da API e da identidade.',
        );
      if (
        (!__DEV__ && !url.startsWith('https://')) ||
        (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(url))
      )
        throw new Error(
          'Configure EXPO_PUBLIC_LIBRAS_FRAME_URL com URL HTTPS pública acessível ao aparelho.',
        );
      setFrameURL(url);
    } catch (error) {
      setFailed((error as Error).message);
    }
  }
  return (
    <Context.Provider value={context}>
      {children}
      <Sheet
        visible={visible}
        title="Libras, no seu ritmo"
        close={() => {
          setVisible(false);
          setFrameURL('');
        }}
      >
        {frameURL ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <View style={{ flex: 1, minWidth: 130 }}>
                <Action
                  secondary
                  icon={RotateCcw}
                  title="Outro trecho"
                  accessibilityLabel="Escolher outro trecho"
                  onPress={() => setFrameURL('')}
                />
              </View>
              <View style={{ flex: 1, minWidth: 130 }}>
                <Action icon={Hand} title="Traduzir trecho" onPress={translate} />
              </View>
            </View>
            <Copy muted size="caption">
              Aguarde o avatar aparecer e use Traduzir trecho. O serviço depende de conexão e pode
              ficar indisponível.
            </Copy>
            <View
              style={{
                height: 480,
                minHeight: 300,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {Platform.OS === 'web' ? (
                <iframe
                  ref={frame}
                  title="VLibras · trecho selecionado"
                  sandbox="allow-scripts allow-same-origin"
                  referrerPolicy="no-referrer"
                  src={frameURL}
                  onLoad={send}
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              ) : nativeEnabled ? (
                <WebView
                  ref={nativeFrame}
                  source={{ uri: frameURL }}
                  onLoadEnd={send}
                  javaScriptEnabled
                  sharedCookiesEnabled={false}
                  thirdPartyCookiesEnabled={false}
                  incognito
                  onError={() => setFailed('Não foi possível carregar o player.')}
                  onHttpError={() => setFailed('Não foi possível carregar o player.')}
                  onShouldStartLoadWithRequest={(request) =>
                    request.url === frameURL ||
                    request.url === 'about:blank' ||
                    /^https:\/\/([a-z0-9-]+\.)*vlibras\.gov\.br\//i.test(request.url)
                  }
                />
              ) : null}
            </View>
            {!!failed && <Notice error text={failed} />}
            <Copy size="caption" muted>
              Use os controles do VLibras para reproduzir, pausar e repetir. Carregar o widget não
              comprova que uma tradução foi produzida ou revisada.
            </Copy>
          </>
        ) : (
          <>
            <Copy>
              Escolha um trecho para o apoio automático. A navegação e sua aula permanecem abertas.
            </Copy>
            <Pills
              value={topic}
              options={[
                { value: 'navigation', label: 'Navegação' },
                { value: 'lessons', label: 'Aulas' },
                { value: 'reports', label: 'Relatórios' },
                { value: 'settings', label: 'Configurações' },
                ...(fragment ? [{ value: 'content', label: 'Conteúdo desta aula' }] : []),
              ]}
              onChange={(value) => {
                setTopic(value);
                setText(value === 'content' ? fragment?.text || '' : help[value]);
                setConsent(false);
              }}
            />
            <Field
              label="Trecho para traduzir"
              value={text}
              onChangeText={(value) => {
                setText(value);
                setConsent(false);
              }}
              multiline
              maxLength={1800}
            />
            <Copy muted size="caption">
              Somente este trecho será enviado ao serviço externo. Não inclua nomes de estudantes,
              avaliações, informações clínicas ou outros dados privados.
            </Copy>
            <Action
              secondary
              title="Revisei o trecho e autorizo o envio ao VLibras"
              selected={consent}
              onPress={() => setConsent(!consent)}
            />
            {Platform.OS === 'web' || nativeEnabled ? (
              <>
                {nativeEnabled && <Badge text="WEBVIEW · VALIDAÇÃO NO APARELHO PENDENTE" />}
                <Action
                  icon={Hand}
                  title="Abrir tradução do trecho"
                  disabled={!consent || !allowedFragment(text)}
                  onPress={start}
                />
                {!!failed && <Notice error text={failed} />}
              </>
            ) : (
              <>
                <Notice text="O widget automático ainda não foi validado neste aparelho. A integração WebView pode ser habilitada para teste técnico. Os vídeos revisados, quando disponíveis, aparecem abaixo." />
                <Action
                  secondary
                  title="Conhecer o VLibras oficial"
                  onPress={() =>
                    void Linking.openURL(
                      'https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras/vlibras',
                    )
                  }
                />
              </>
            )}
            <Copy size="caption" muted>
              Tradução automática não substitui intérprete nem revisão de conteúdo educacional.
              Questões avaliativas e gabaritos não são capturados automaticamente.
            </Copy>
            <Libras />
          </>
        )}
      </Sheet>
    </Context.Provider>
  );
}
