import { useState } from 'react';
import { View } from 'react-native';
import {
  Eye,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Users,
  ClipboardList,
} from 'lucide-react-native';
import { Page, Card, Copy, Field, Action, Notice } from '@/shared/ui';
import { Eyebrow, Pills, MenuRow, Badge } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { levelLabel } from '@/features/assessments/levels';
import type { ScreenProps } from '@/app/routes';
import type { Care } from '@/features/trails/types';
import { CharacteristicsForm, emptyCharacteristics, categories } from './Characteristics';
import type { Characteristics } from './Characteristics';
export function CareScreen({ route, navigation }: ScreenProps<'Care'>) {
  const { student } = route.params;
  const data = useResource<Care>('/students/' + student.id + '/care');
  const profile = useResource<typeof student>('/students/' + student.id);
  const { colors } = useTheme();
  const save = useCommand();
  const [section, setSection] = useState<'presentation' | 'communication' | 'sensitive' | null>(
    null,
  );
  const [communication, setCommunication] = useState('');
  const [notes, setNotes] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristics>(emptyCharacteristics);
  const [presentation, setPresentation] = useState<Care['presentation']>({
    instruction_mode: 'standard',
    prefer_linear: false,
    font_scale: 1,
  });
  const [version, setVersion] = useState(0);
  const care = data.data;
  function edit(next: typeof section) {
    if (!care) return;
    setCommunication(care.communication || '');
    setNotes(care.sensitive_notes || '');
    setCharacteristics({ ...emptyCharacteristics, ...care.characteristics });
    setPresentation(care.presentation);
    setVersion(care.version);
    setSection(next);
  }
  const supports =
    categories
      .find((c) => c.key === 'pedagogical_supports')
      ?.options.filter(([id]) => care?.characteristics?.pedagogical_supports?.includes(id))
      .map(([, label]) => label) || [];
  const mode = care?.presentation.instruction_mode;
  return (
    <Page>
      <Eyebrow>CADA JEITO DE APRENDER IMPORTA</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Apoios de {student.name.split('·')[0].trim()}
      </Copy>
      <LoadState resource={data} />
      {care && (
        <>
          <Card>
            <Badge text={levelLabel(profile.data?.confirmed_level ?? student.confirmed_level)} />
            <Copy heading>O que ajuda a aprender</Copy>
            {student.supports.length || supports.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[...new Set([...student.supports, ...supports])].map((label) => (
                  <Badge key={label} text={label} />
                ))}
              </View>
            ) : (
              <Copy muted>Vamos descobrir juntos quais apoios são úteis.</Copy>
            )}
            <MenuRow
              icon={Eye}
              title="Apresentação da aula"
              detail={
                (mode === 'concise'
                  ? 'Instruções curtas'
                  : mode === 'audio'
                    ? 'Apoio de leitura'
                    : 'Texto principal') +
                ' · fonte ' +
                care.presentation.font_scale * 100 +
                '%'
              }
              onPress={() => edit('presentation')}
            />
          </Card>
          <Card>
            <HeartHandshake color={colors.primary} size={28} />
            <Copy heading>Comunicação e adaptações</Copy>
            <Copy muted>
              {care.can_view_sensitive
                ? care.communication || 'Registre a melhor forma de apoiar a comunicação.'
                : 'Informações compartilhadas apenas com adultos autorizados.'}
            </Copy>
            {care.can_view_sensitive && (
              <Action
                secondary
                icon={MessageCircle}
                title={
                  care.can_edit ? 'Ajustar apoios e comunicação' : 'Consultar apoios e comunicação'
                }
                onPress={() => edit('communication')}
              />
            )}
          </Card>
          {care.can_view_sensitive && (
            <MenuRow
              icon={LockKeyhole}
              title="Informações restritas"
              detail="Condições informadas e notas · acesso protegido"
              onPress={() => edit('sensitive')}
            />
          )}
          <MenuRow
            icon={ClipboardList}
            title="Avaliação e habilidades observadas"
            detail="Ver evidências do acompanhamento"
            onPress={() => navigation.navigate('Report', { student })}
          />
          {student.role === 'owner' && (
            <MenuRow
              icon={Users}
              title="Quem pode acompanhar"
              detail="Gerenciar vínculos e compartilhamento"
              onPress={() => navigation.navigate('Links', { student })}
            />
          )}
        </>
      )}
      <Sheet
        visible={!!section}
        title={
          section === 'presentation'
            ? 'Apresentação da aula'
            : section === 'communication'
              ? 'Apoios e comunicação'
              : 'Informações restritas'
        }
        close={() => {
          if (!save.busy) setSection(null);
        }}
        footer={
          care?.can_edit ? (
            <Action
              title={save.busy ? 'Salvando…' : 'Salvar ajustes'}
              disabled={save.busy}
              onPress={() =>
                void save.run(
                  '/students/' + student.id + '/care',
                  { version, communication, sensitive_notes: notes, presentation, characteristics },
                  async () => {
                    await data.reload();
                    setSection(null);
                  },
                )
              }
            />
          ) : undefined
        }
      >
        {section === 'presentation' && !care?.can_edit ? (
          <Copy>
            Instruções:{' '}
            {mode === 'concise'
              ? 'curtas'
              : mode === 'audio'
                ? 'com apoio de leitura'
                : 'texto principal'}
            . Fonte mínima:{' '}
            {care?.presentation.font_scale ? care.presentation.font_scale * 100 : 100}%. Alterações
            são feitas pelo gestor do cadastro.
          </Copy>
        ) : section === 'presentation' ? (
          <>
            <Copy>Como apresentar as instruções?</Copy>
            <Pills
              value={presentation.instruction_mode}
              options={[
                { value: 'standard', label: 'Texto principal' },
                { value: 'concise', label: 'Instrução curta' },
                { value: 'audio', label: 'Leitura' },
              ]}
              onChange={(v) => {
                if (care?.can_edit)
                  setPresentation({
                    ...presentation,
                    instruction_mode: v as Care['presentation']['instruction_mode'],
                  });
              }}
            />
            <Copy>Tamanho mínimo do texto</Copy>
            <Pills
              value={String(presentation.font_scale)}
              options={[
                { value: '1', label: '100%' },
                { value: '1.25', label: '125%' },
                { value: '1.5', label: '150%' },
              ]}
              onChange={(v) => {
                if (care?.can_edit)
                  setPresentation({ ...presentation, font_scale: Number(v) as 1 | 1.25 | 1.5 });
              }}
            />
            <Action
              secondary
              title="Preferir aulas em lista"
              selected={presentation.prefer_linear}
              disabled={!care?.can_edit}
              onPress={() =>
                setPresentation({ ...presentation, prefer_linear: !presentation.prefer_linear })
              }
            />
            <Copy size="caption" muted>
              Disponível sem diagnóstico. Leitura respeita a configuração de cada atividade.
            </Copy>
          </>
        ) : section === 'communication' ? (
          <>
            <Field
              label="O que facilita a comunicação?"
              value={communication}
              onChangeText={setCommunication}
              multiline
              maxLength={1000}
              editable={!!care?.can_edit}
            />
            <Copy>Apoios úteis no dia a dia</Copy>
            {categories
              .find((c) => c.key === 'pedagogical_supports')
              ?.options.map(([id, label]) => (
                <Action
                  key={id}
                  secondary
                  title={label}
                  selected={characteristics.pedagogical_supports.includes(id)}
                  disabled={!care?.can_edit}
                  onPress={() =>
                    setCharacteristics({
                      ...characteristics,
                      pedagogical_supports: characteristics.pedagogical_supports.includes(id)
                        ? characteristics.pedagogical_supports.filter((v) => v !== id)
                        : [...characteristics.pedagogical_supports, id],
                    })
                  }
                />
              ))}
          </>
        ) : section === 'sensitive' ? (
          <>
            <CharacteristicsForm
              value={characteristics}
              onChange={setCharacteristics}
              readOnly={!care?.can_edit}
            />
            <Field
              label="Notas restritas (opcional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={1500}
              editable={!!care?.can_edit}
            />
            <Copy size="caption" muted>
              Informação fornecida por adulto autorizado. Não é diagnóstico do aplicativo e não será
              enviada à IA.
            </Copy>
          </>
        ) : null}
        {!!save.error && <Notice error text={save.error} />}
      </Sheet>
    </Page>
  );
}
