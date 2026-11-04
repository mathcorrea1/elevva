import { useEffect, useState } from 'react';
import { Page, Card, Copy, Field, Action, Notice } from '@/shared/ui';
import { Eyebrow, Pills, MenuRow, SectionTitle } from '@/shared/ui/learning';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { ClipboardList, Route, History, Users, Sparkles } from 'lucide-react-native';
import type { ScreenProps } from '@/app/routes';
import type { Care } from '@/features/trails/types';
import { CharacteristicsForm, emptyCharacteristics } from './Characteristics';
import type { Characteristics } from './Characteristics';
export function CareScreen({ route, navigation }: ScreenProps<'Care'>) {
  const { student } = route.params;
  const data = useResource<Care>('/students/' + student.id + '/care');
  const save = useCommand();
  const [communication, setCommunication] = useState('');
  const [notes, setNotes] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristics>(emptyCharacteristics);
  const [presentation, setPresentation] = useState<Care['presentation']>({
    instruction_mode: 'standard',
    prefer_linear: false,
    font_scale: 1,
  });
  const [version, setVersion] = useState(-1);
  useEffect(() => {
    if (data.data && version < 0) {
      setVersion(data.data.version);
      setCommunication(data.data.communication || '');
      setNotes(data.data.sensitive_notes || '');
      setCharacteristics({ ...emptyCharacteristics, ...data.data.characteristics });
      setPresentation(data.data.presentation);
    }
  }, [data.data, version]);
  return (
    <Page>
      <Eyebrow>UM JEITO DE APRENDER, UM JEITO DE CUIDAR</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Conhecer {student.name}
      </Copy>
      <Copy muted>
        O cadastro do adulto, as preferências dele e o acompanhamento de cada estudante são
        separados.
      </Copy>
      <LoadState resource={data} />
      {data.data && (
        <>
          <Card>
            <Copy heading>Apoios informados</Copy>
            {student.supports.length ? (
              student.supports.map((s) => <Copy key={s}>{s}</Copy>)
            ) : (
              <Copy muted>
                Nenhum apoio cadastrado. Adaptações continuam disponíveis sem diagnóstico.
              </Copy>
            )}
            <Copy muted>
              Condição informada, apoio utilizado, habilidade observada e nível de alfabetização são
              informações diferentes.
            </Copy>
          </Card>
          {data.data.can_view_sensitive ? (
            <Card>
              <Copy heading>Comunicação e informações restritas</Copy>
              {data.data.can_edit ? (
                <>
                  <CharacteristicsForm value={characteristics} onChange={setCharacteristics} />
                  <Field
                    label="Como o estudante se comunica? (informação fornecida)"
                    value={communication}
                    onChangeText={setCommunication}
                    multiline
                    maxLength={1000}
                  />
                  <Field
                    label="Informações específicas restritas (opcional)"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    maxLength={1500}
                  />
                </>
              ) : (
                <>
                  <CharacteristicsForm value={characteristics} readOnly onChange={() => {}} />
                  <Copy>{communication || 'Forma de comunicação ainda não informada.'}</Copy>
                  <Copy>{notes || 'Sem informação restrita adicional.'}</Copy>
                </>
              )}
              {data.data.author_id && (
                <Copy size="caption" muted>
                  Autor: {data.data.author_id} · atualizado em{' '}
                  {new Date(data.data.updated_at!).toLocaleString('pt-BR')}
                </Copy>
              )}
              <Copy muted>
                Este texto não é enviado à IA nem entra automaticamente em gráficos ou notas.
              </Copy>
            </Card>
          ) : (
            <Notice text="O gestor não compartilhou as informações restritas com esta conta. Apoios de apresentação e atividades continuam disponíveis." />
          )}
          <Card>
            <Copy heading>Apresentação deste estudante</Copy>
            {data.data.can_edit ? (
              <>
                <Pills
                  value={presentation.instruction_mode}
                  options={[
                    { value: 'standard', label: 'Texto principal' },
                    { value: 'concise', label: 'Instrução curta' },
                    { value: 'audio', label: 'Apoio de leitura' },
                  ]}
                  onChange={(v) =>
                    setPresentation({
                      ...presentation,
                      instruction_mode: v as Care['presentation']['instruction_mode'],
                    })
                  }
                />
                <Copy muted>
                  Instrução curta usa a variante cadastrada pelo professor. Áudio é opcional, com
                  controles e conforme a habilidade avaliada.
                </Copy>
                <Pills
                  value={String(presentation.font_scale)}
                  options={[
                    { value: '1', label: 'Fonte padrão' },
                    { value: '1.25', label: '125%' },
                    { value: '1.5', label: '150%' },
                  ]}
                  onChange={(v) =>
                    setPresentation({ ...presentation, font_scale: Number(v) as 1 | 1.25 | 1.5 })
                  }
                />
                <Action
                  secondary
                  selected={presentation.prefer_linear}
                  title={'Preferir lista de aulas: ' + (presentation.prefer_linear ? 'sim' : 'não')}
                  onPress={() =>
                    setPresentation({ ...presentation, prefer_linear: !presentation.prefer_linear })
                  }
                />
                <Action
                  title="Salvar informações e preferências do estudante"
                  disabled={save.busy}
                  onPress={() =>
                    void save.run(
                      '/students/' + student.id + '/care',
                      {
                        version,
                        communication,
                        sensitive_notes: notes,
                        presentation,
                        characteristics,
                      },
                      async () => {
                        setVersion(-1);
                        await data.reload();
                      },
                    )
                  }
                />
                <SaveState command={save} />
              </>
            ) : (
              <Copy>
                {presentation.instruction_mode === 'concise'
                  ? 'Preferência por instrução curta'
                  : presentation.instruction_mode === 'audio'
                    ? 'Preferência por apoio de leitura'
                    : 'Instrução principal'}{' '}
                · Fonte mínima {presentation.font_scale * 100}% ·{' '}
                {presentation.prefer_linear ? 'Lista preferida' : 'Mapa disponível'}
              </Copy>
            )}
          </Card>
          <SectionTitle title="Do ponto de partida ao próximo passo" />
          <MenuRow
            icon={History}
            title="1. Histórico e observações"
            detail="O que já foi registrado sobre este estudante"
            onPress={() => navigation.navigate('History', { student })}
          />
          <MenuRow
            icon={ClipboardList}
            title="2. Avaliação inicial ou nova avaliação"
            detail="Evidências próprias, sem inventar instrumento aprovado"
            onPress={() => navigation.navigate('Assessment', { student })}
          />
          <MenuRow
            icon={Sparkles}
            title="3. Análise e revisão das evidências"
            detail="Sugestão assistida, revisão adulta e nível confirmado separados"
            onPress={() => navigation.navigate('Analysis', { student })}
          />
          <MenuRow
            icon={Route}
            title="4. Plano de trilhas e atividades"
            detail="Seleção explícita do adulto; progresso individual"
            onPress={() => navigation.navigate('Trail', { student })}
          />
          {student.role === 'owner' && (
            <MenuRow
              icon={Users}
              title="Gerenciar compartilhamento"
              detail="Conceder ou revogar acesso às informações restritas"
              onPress={() => navigation.navigate('Links', { student })}
            />
          )}
        </>
      )}
    </Page>
  );
}
