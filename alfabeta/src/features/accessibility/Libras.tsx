import React from 'react';
import { Platform, Linking } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Card, Copy, Action } from '@/shared/ui';
import { librasManifest } from './libras-manifest';
import type { LibrasVideo } from './libras-manifest';
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
            O acesso global a Libras fica no cabeçalho. Escolha e revise o trecho antes de usar o
            serviço externo.
          </Copy>
          <Action
            secondary
            title="Conhecer o VLibras oficial"
            onPress={() => {
              if (Platform.OS === 'web')
                window.open(
                  'https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras/vlibras',
                  '_blank',
                  'noopener,noreferrer',
                );
              else
                void Linking.openURL(
                  'https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras/vlibras',
                );
            }}
          />
        </>
      )}
    </Card>
  );
}
