import React from 'react';
import { Platform, Linking } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Card, Copy, Action } from '@/shared/ui';
import { librasManifest } from './libras-manifest';
import type { LibrasVideo } from './libras-manifest';
import { useTheme } from '@/shared/theme/ThemeProvider';
function ReviewedVideo({ video }: { video: LibrasVideo }) {
  const player = useVideoPlayer(video.url);
  return (
    <Card>
      <Copy>{video.title}</Copy>
      <VideoView
        player={player}
        nativeControls
        style={{ width: '100%', minHeight: 240 }}
        accessibilityLabel={'Vídeo em Libras: ' + video.title}
      />
      <Copy>{video.transcript}</Copy>
      <Copy muted>
        Revisão: {video.reviewer}, {video.reviewedAt}. Licença: {video.license}
      </Copy>
    </Card>
  );
}
export function Libras() {
  const { preferences } = useTheme();
  return (
    <Card>
      <Copy heading>Apoio em Libras</Copy>
      <Copy>
        {librasManifest.length
          ? 'Conteúdos essenciais com vídeos revisados.'
          : 'Vídeos essenciais ainda aguardam produção e revisão. O player está preparado; este recurso ainda não está concluído.'}
      </Copy>
      {librasManifest.map((v) => (
        <ReviewedVideo key={v.id} video={v} />
      ))}
      {Platform.OS === 'web' && (
        <>
          <Copy muted>
            VLibras está disponível na ajuda pública, em outra página. Nenhum dado do estudante é
            enviado ao widget. A tradução automática tem limites.
          </Copy>
          <Action
            secondary
            title="Abrir ajuda pública com VLibras"
            onPress={() => {
              if (Platform.OS === 'web')
                window.open(
                  '/ajuda-libras.html?' +
                    new URLSearchParams({
                      theme: preferences.theme,
                      contrast: preferences.contrast ? '1' : '0',
                      scale: String(preferences.font_scale),
                    }),
                  '_blank',
                  'noopener,noreferrer',
                );
              else void Linking.openURL('/ajuda-libras.html');
            }}
          />
        </>
      )}
    </Card>
  );
}
