import { View } from 'react-native';
import { Action, Copy, Field } from '@/shared/ui';
import { Disclosure } from '@/shared/ui/learning';
export type Characteristics = {
  reported_conditions: string[];
  disabilities: string[];
  communication: string[];
  pedagogical_supports: string[];
  additional: string;
  source: string;
};
export const emptyCharacteristics: Characteristics = {
  reported_conditions: [],
  disabilities: [],
  communication: [],
  pedagogical_supports: [],
  additional: '',
  source: '',
};
const categories: {
  key: keyof Pick<
    Characteristics,
    'reported_conditions' | 'disabilities' | 'communication' | 'pedagogical_supports'
  >;
  title: string;
  note: string;
  options: [string, string][];
}[] = [
  {
    key: 'reported_conditions',
    title: 'Condições informadas',
    note: 'Relato ou informação fornecida por adulto autorizado. O aplicativo não produz diagnósticos.',
    options: [
      ['tea', 'TEA'],
      ['tdah', 'TDAH'],
      ['dislexia', 'Dislexia'],
      ['other', 'Outra condição informada'],
    ],
  },
  {
    key: 'disabilities',
    title: 'Deficiências informadas',
    note: 'Opcional; não determina capacidade, nível ou acesso às adaptações.',
    options: [
      ['intellectual', 'Intelectual'],
      ['visual', 'Visual'],
      ['hearing', 'Auditiva'],
      ['motor', 'Física ou motora'],
      ['other', 'Outra deficiência informada'],
    ],
  },
  {
    key: 'communication',
    title: 'Características da comunicação',
    note: 'Selecione apoios úteis sem rotular a capacidade do estudante.',
    options: [
      ['limited_oral', 'Comunicação oral limitada'],
      ['nonverbal', 'Sem comunicação oral'],
      ['alternative', 'Comunicação alternativa'],
      ['other', 'Outra característica'],
    ],
  },
  {
    key: 'pedagogical_supports',
    title: 'Apoios pedagógicos e de acesso',
    note: 'Disponíveis mesmo sem informação clínica.',
    options: [
      ['short_instructions', 'Instruções curtas'],
      ['visual_support', 'Apoio visual'],
      ['extra_time', 'Mais tempo, sem cronômetro'],
      ['alternative_input', 'Alternativa a gestos e arrastar'],
      ['guided_reading', 'Leitura acompanhada'],
      ['other', 'Outro apoio'],
    ],
  },
];
export function CharacteristicsForm({
  value,
  onChange,
  readOnly = false,
}: {
  value: Characteristics;
  onChange: (v: Characteristics) => void;
  readOnly?: boolean;
}) {
  return (
    <View style={{ gap: 14 }}>
      <Copy muted>
        Preenchimento opcional. Nenhuma seleção significa “não informado”. Informações restritas só
        são compartilhadas por concessão explícita do gestor.
      </Copy>
      {categories.map((c) => (
        <Disclosure
          key={c.key}
          title={c.title + (value[c.key].length ? ' · ' + value[c.key].length : ' · não informado')}
        >
          <Copy muted>{c.note}</Copy>
          {c.options
            .filter(([id]) => !readOnly || value[c.key].includes(id))
            .map(([id, label]) => (
              <Action
                key={id}
                secondary
                disabled={readOnly}
                title={(value[c.key].includes(id) ? '✓ ' : '') + label}
                selected={value[c.key].includes(id)}
                onPress={() =>
                  onChange({
                    ...value,
                    [c.key]: value[c.key].includes(id)
                      ? value[c.key].filter((v) => v !== id)
                      : [...value[c.key], id],
                  })
                }
              />
            ))}
        </Disclosure>
      ))}
      <Field
        label="Observações adicionais restritas (opcional)"
        value={value.additional}
        onChangeText={(additional) => onChange({ ...value, additional })}
        maxLength={1000}
        multiline
        editable={!readOnly}
      />
      <Field
        label="Origem da informação (opcional)"
        value={value.source}
        onChangeText={(source) => onChange({ ...value, source })}
        maxLength={200}
        editable={!readOnly}
      />
    </View>
  );
}
