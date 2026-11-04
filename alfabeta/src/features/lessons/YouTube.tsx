import { useState } from 'react';
import { Platform, View, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Copy, Action, Notice } from '@/shared/ui';
import { Disclosure } from '@/shared/ui/learning';
import { useTheme } from '@/shared/theme/ThemeProvider';
export function YouTube({ id, transcript }: { id: string; transcript: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { colors } = useTheme();
  if (!__DEV__ && process.env.EXPO_PUBLIC_YOUTUBE_EMBEDS_ENABLED !== 'true')
    return (
      <>
        <Notice text="Vídeo externo ainda não habilitado neste ambiente. A alternativa textual mantém a aula disponível." />
        <Copy>{transcript}</Copy>
      </>
    );
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id))
    return (
      <Notice text="Complete o identificador do vídeo para visualizar. A alternativa textual continua disponível." />
    );
  const url =
    'https://www.youtube-nocookie.com/embed/' +
    id +
    '?autoplay=0&playsinline=1&cc_load_policy=1&hl=pt-br';
  return (
    <View style={{ gap: 12 }}>
      {!loaded ? (
        <>
          <Copy muted>
            Vídeo externo do YouTube. Requer internet e carrega somente ao escolher reproduzir.
          </Copy>
          <Action secondary title="Carregar vídeo do YouTube" onPress={() => setLoaded(true)} />
        </>
      ) : (
        <View
          style={{
            minHeight: 220,
            height: 280,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: colors.mutedSurface,
          }}
        >
          {Platform.OS === 'web' ? (
            <iframe
              title="Vídeo da aula no YouTube"
              src={url}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onError={() => setFailed(true)}
            />
          ) : (
            <WebView
              source={{ uri: url }}
              originWhitelist={['https://www.youtube-nocookie.com', 'https://www.youtube.com']}
              allowsInlineMediaPlayback
              incognito
              sharedCookiesEnabled={false}
              thirdPartyCookiesEnabled={false}
              javaScriptCanOpenWindowsAutomatically={false}
              mediaPlaybackRequiresUserAction
              onError={() => setFailed(true)}
              onHttpError={() => setFailed(true)}
              onShouldStartLoadWithRequest={(r) =>
                r.url === 'about:blank' ||
                /^https:\/\/(www\.)?youtube(-nocookie)?\.com\//.test(r.url)
              }
            />
          )}
        </View>
      )}
      {failed && (
        <Notice
          error
          text="Não foi possível exibir o vídeo. A alternativa textual continua disponível."
        />
      )}
      <Disclosure title="Ler alternativa ao vídeo" initiallyOpen>
        <Copy>{transcript}</Copy>
      </Disclosure>
      {loaded && (
        <Action
          secondary
          quiet
          title="Abrir vídeo no navegador"
          onPress={() => void Linking.openURL('https://www.youtube.com/watch?v=' + id)}
        />
      )}
    </View>
  );
}
