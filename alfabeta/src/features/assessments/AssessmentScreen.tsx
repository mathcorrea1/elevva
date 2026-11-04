import { useState } from 'react';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { useCommand, useResource } from '@/shared/data/hooks';
import type { Content } from '@/shared/contracts';
import type { ScreenProps as Props } from '@/app/routes';
import { SaveState } from '@/shared/ui/ResourceState';
import { Eyebrow } from '@/shared/ui/learning';

export function AssessmentScreen({ route, navigation }: Props<'Assessment'>) {
  const { student } = route.params;
  const save = useCommand();
  const catalog = useResource<Content[]>('/content');
  const [instrument, setInstrument] = useState<Content | null>(null);
  const [item, setItem] = useState('');
  const [response, setResponse] = useState('');
  const [support, setSupport] = useState('');
  const [evidence, setEvidence] = useState<{ item: string; response: string; support: string }[]>(
    [],
  );
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <Page>
      <Eyebrow>CONHECER PARA ACOMPANHAR</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        O ponto de partida
      </Copy>
      <Copy>{student.name}</Copy>
      <Notice text="Registre o que foi apresentado e observado. Os critérios pedagógicos ainda aguardam revisão; este registro descritivo não calcula um nível." />
      {catalog.data
        ?.filter((c) => c.kind === 'instrument' && c.status === 'published')
        .map((c) => (
          <Action
            key={c.id}
            secondary={instrument?.id !== c.id}
            title={'Usar instrumento revisado: ' + c.title}
            disabled={!!evidence.length}
            onPress={() => {
              setInstrument(c);
              setItem('');
              setResponse('');
            }}
          />
        ))}
      {instrument ? (
        <>
          <Copy>{instrument.body.instructions}</Copy>
          {instrument.body.items.map((i) => (
            <Card key={i.id}>
              <Copy>{i.prompt}</Copy>
              {i.choices.map((option) => (
                <Action
                  secondary={item !== i.id || response !== option}
                  key={option}
                  title={option}
                  onPress={() => {
                    setItem(i.id);
                    setResponse(option);
                  }}
                />
              ))}
            </Card>
          ))}
        </>
      ) : (
        <>
          <Field
            label="Proposta apresentada / item"
            value={item}
            onChangeText={setItem}
            maxLength={100}
          />
          <Field
            label="Resposta observada"
            value={response}
            onChangeText={setResponse}
            multiline
            maxLength={500}
          />
        </>
      )}
      <Field label="Apoio oferecido" value={support} onChangeText={setSupport} maxLength={300} />
      <Action
        secondary
        title="Adicionar evidência"
        disabled={!item.trim() || !response.trim() || evidence.length >= 20}
        onPress={() => {
          setEvidence((v) => [
            ...(instrument ? v.filter((e) => e.item !== item) : v),
            { item, response, support },
          ]);
          setItem('');
          setResponse('');
          setSupport('');
        }}
      />
      {evidence.map((e, i) => (
        <Card key={i}>
          <Copy>
            {i + 1}. {e.item}: {e.response}
          </Copy>
          <Action
            secondary
            title={'Remover evidência ' + (i + 1)}
            onPress={() => setEvidence((v) => v.filter((_, n) => n !== i))}
          />
        </Card>
      ))}
      <Field
        label="Notas adicionais (opcional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={1500}
      />
      <Action
        title="Salvar avaliação"
        disabled={!evidence.length || save.busy}
        onPress={() =>
          void save.run(
            '/students/' + student.id + '/assessments',
            {
              instrument: instrument?.id || 'coleta-descritiva-v1-pendente-D03',
              evidence,
              notes,
              synthetic: false,
            },
            () => {
              setEvidence([]);
              setNotes('');
              setSaved(true);
            },
          )
        }
      />
      <SaveState command={save} />
      {saved && evidence.length === 0 && (
        <Action
          title="Ir para as atividades"
          onPress={() => navigation.replace('Trail', { student })}
        />
      )}
    </Page>
  );
}
