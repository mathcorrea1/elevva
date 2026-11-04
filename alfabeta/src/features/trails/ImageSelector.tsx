import { useState } from 'react';
import { View } from 'react-native';
import {pickImage} from './pickImage';
import { Upload, Trash2 } from 'lucide-react-native';
import { Action, Field, Copy } from '@/shared/ui';
import { Pills } from '@/shared/ui/learning';
import { useCommand } from '@/shared/data/hooks';
import { SaveState } from '@/shared/ui/ResourceState';
import { Illustration } from './Illustration';
import type { ImageRef } from './types';
export function ImageSelector({
  value,
  onChange,
  cover = false,
}: {
  value: ImageRef | null;
  onChange: (value: ImageRef | null) => void;
  cover?: boolean;
}) {
  const save = useCommand();
  const [error, setError] = useState('');
  async function pick() {
    setError('');
    try {
      const asset=await pickImage();
      if(!asset)return;
      if (!asset.base64) throw new Error('Não foi possível ler este arquivo.');
      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024)
        throw new Error('Escolha uma imagem de até 2 MB.');
      await save.run<{ id: string; alt: string }>(
        '/media',
        { base64: asset.base64, alt: value?.alt || '' },
        (data) => onChange({ asset_id: data.id, alt: data.alt }),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <View style={{ gap: 12 }}>
      {!value&&<Copy muted>Sem imagem própria. O Eleva usará uma ilustração padrão.</Copy>}
      <Illustration image={value} height={cover ? 150 : 110} cover={cover} />
      <Pills
        value={value?.builtin || 'upload'}
        options={(cover
          ? ['garden', 'sky']
          : ['sprout', 'butterfly', 'boat', 'milestone', 'lumi']
        ).map((id, i) => ({
          value: id,
          label: cover
            ? i === 0
              ? 'Jardim'
              : 'Céu'
            : ['Broto', 'Borboleta', 'Barquinho', 'Livro', 'Lumi'][i],
        }))}
        onChange={(id) => onChange({ builtin: id as ImageRef['builtin'], alt: value?.alt || '' })}
      />
      <Field
        label="Descrição alternativa (se a imagem informar algo)"
        value={value?.alt || ''}
        onChangeText={(alt) =>
          onChange({
            ...value,
            builtin: value?.builtin || (!value?.asset_id ? 'sprout' : null),
            alt,
          })
        }
        maxLength={300}
      />
      <Action
        secondary
        icon={Upload}
        title="Selecionar ou substituir arquivo"
        disabled={save.busy}
        onPress={() => void pick()}
      />
      <Copy size="caption" muted>
        Ilustrações sem dados de estudantes. PNG/JPEG/WebP estático, até 2 MB. Arquivo validado e
        normalizado no servidor.
      </Copy>
      {value && (
        <Action
          secondary
          icon={Trash2}
          title="Remover imagem escolhida"
          onPress={() => onChange(null)}
        />
      )}
      <SaveState command={save} />
      {!!error && <Copy>{error}</Copy>}
    </View>
  );
}
