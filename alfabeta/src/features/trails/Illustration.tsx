import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { garden, sky, sprout, butterfly, boat, milestone, celebration } from '@/assets/journey';
import { repository } from '@/shared/http/repository';
import type { ImageRef } from './types';
import { Copy } from '@/shared/ui';
const sources = { garden, sky, sprout, butterfly, boat, milestone, lumi: celebration };
export function Illustration({
  image,
  width = '100%',
  height = 140,
  cover = false,
}: {
  image: ImageRef | null | undefined;
  width?: number | '100%';
  height?: number;
  cover?: boolean;
}) {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setUri(null);
    setFailed(false);
    if (image?.asset_id)
      void repository
        .get<{ uri: string }>('/media/' + image.asset_id)
        .then((value) => {
          if (active) setUri(value.uri);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    return () => {
      active = false;
    };
  }, [image?.asset_id]);
  const source = image?.asset_id
    ? uri
      ? { uri }
      : undefined
    : sources[image?.builtin || 'sprout'];
  return (
    <View
      style={{ width, height, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      {source ? (
        <Image
          source={source}
          resizeMode={cover ? 'cover' : 'contain'}
          accessible={!!image?.alt}
          accessibilityLabel={image?.alt || undefined}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Copy size="caption" muted>
          {failed ? 'Imagem indisponível' : 'Carregando imagem…'}
        </Copy>
      )}
    </View>
  );
}
