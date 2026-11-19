import { useEffect, useRef, useState } from 'react';
import type { NavigationAction } from '@react-navigation/native';
import { ClipboardCheck, Save } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { useCommand, useResource } from '@/shared/data/hooks';
import type { Content } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
import { SaveState, LoadState } from '@/shared/ui/ResourceState';
import { ScreenTitle } from '@/shared/ui/presentation';
import { Sheet } from '@/shared/ui/Sheet';

type Evidence = { item: string; response: string; support: string };
type DraftBody = {
  instrument_id: string | null;
  item: string;
  response: string;
  support: string;
  evidence: Evidence[];
  notes: string;
};
type Draft = { version: number; body: DraftBody | null; updated_at: string | null };
const empty: DraftBody = {
  instrument_id: null,
  item: '',
  response: '',
  support: '',
  evidence: [],
  notes: '',
};
export function AssessmentScreen({ route, navigation }: ScreenProps<'Assessment'>) {
  const { student } = route.params;
  const save = useCommand();
  const draftSave = useCommand();
  const catalog = useResource<Content[]>('/content');
  const draft = useResource<Draft>('/students/' + student.id + '/assessment-draft');
  const [form, setForm] = useState<DraftBody>(empty);
  const [version, setVersion] = useState(0);
  const [lastSaved, setLastSaved] = useState(JSON.stringify(empty));
  const [saved, setSaved] = useState(false);
  const [exit, setExit] = useState<NavigationAction | null>(null);
  const loaded = useRef(false);
  const [ready, setReady] = useState(false);
  const leaving = useRef(false);
  const fingerprint = JSON.stringify(form);
  const dirty = fingerprint !== lastSaved;
  const instrument = catalog.data?.find((c) => c.id === form.instrument_id);
  const unavailableInstrument =
    !!form.instrument_id && !!catalog.data && (!instrument || instrument.status !== 'published');
  useEffect(() => {
    if (!loaded.current && draft.data) {
      loaded.current = true;
      const restored = draft.data.body || empty;
      setForm(restored);
      setVersion(draft.data.version);
      setLastSaved(JSON.stringify(restored));
      setReady(true);
    }
  }, [draft.data]);
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (!dirty || leaving.current) return;
        event.preventDefault();
        setExit(event.data.action);
      }),
    [navigation, dirty],
  );
  const patch = (value: Partial<DraftBody>) => {
    setForm((old) => ({ ...old, ...value }));
    setSaved(false);
  };
  function leave() {
    if (!exit) return;
    leaving.current = true;
    navigation.dispatch(exit);
  }
  async function persist(after?: () => void) {
    const snapshot = form;
    await draftSave.run<Draft>(
      '/students/' + student.id + '/assessment-draft',
      { ...snapshot, version },
      (value) => {
        setVersion(value.version);
        setLastSaved(JSON.stringify(snapshot));
        after?.();
      },
      'PUT',
    );
  }
  const busy = save.busy || draftSave.busy;
  return (
    <Page>
      <ScreenTitle
        title="Ponto de partida"
        subtitle={student.name}
        action={
          <Action
            secondary
            icon={Save}
            title={draftSave.busy ? 'Salvando…' : 'Salvar rascunho'}
            disabled={busy || draft.loading || !ready}
            onPress={() => void persist()}
          />
        }
      />
      <Copy muted size="caption">
        {dirty
          ? 'Alterações ainda não salvas.'
          : version
            ? 'Rascunho salvo na sua conta. Você pode continuar depois.'
            : 'Registre o que foi apresentado e observado. Este registro não calcula um nível.'}
      </Copy>
      <LoadState resource={draft} />
      <SaveState command={draftSave} />
      {!!unavailableInstrument && (
        <Notice
          error
          text="O instrumento deste rascunho não está disponível para aplicação. O registro foi preservado; consulte o autor antes de finalizar."
        />
      )}
      <LoadState resource={catalog} />
      {(catalog.data || [])
        .filter((c) => c.kind === 'instrument' && c.status === 'published')
        .map((c) => (
          <Action
            key={c.id}
            secondary={form.instrument_id !== c.id}
            title={'Usar instrumento revisado: ' + c.title}
            disabled={busy || !!form.evidence.length}
            onPress={() => patch({ instrument_id: c.id, item: '', response: '' })}
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
                  key={option}
                  secondary={form.item !== i.id || form.response !== option}
                  title={option}
                  disabled={busy}
                  onPress={() => patch({ item: i.id, response: option })}
                />
              ))}
            </Card>
          ))}
        </>
      ) : (
        <Card>
          <Copy heading>Uma evidência por vez</Copy>
          <Field
            label="Proposta apresentada / item"
            value={form.item}
            onChangeText={(item) => patch({ item })}
            maxLength={100}
            editable={!busy && ready && !draft.loading}
          />
          <Field
            label="Resposta observada"
            value={form.response}
            onChangeText={(response) => patch({ response })}
            multiline
            maxLength={500}
            editable={!busy && ready && !draft.loading}
          />
        </Card>
      )}
      <Field
        label="Apoio oferecido (opcional)"
        value={form.support}
        onChangeText={(support) => patch({ support })}
        maxLength={300}
        editable={!busy && ready && !draft.loading}
      />
      <Action
        secondary
        title="Adicionar evidência"
        disabled={
          busy ||
          !ready ||
          draft.loading ||
          !form.item.trim() ||
          !form.response.trim() ||
          form.evidence.length >= 20
        }
        onPress={() =>
          patch({
            evidence: [
              ...(instrument ? form.evidence.filter((e) => e.item !== form.item) : form.evidence),
              { item: form.item, response: form.response, support: form.support },
            ],
            item: '',
            response: '',
            support: '',
          })
        }
      />
      {!!form.evidence.length && (
        <Copy heading>{form.evidence.length} evidência(s) registrada(s)</Copy>
      )}
      {form.evidence.map((e, i) => (
        <Card key={i}>
          <Copy>
            {i + 1}. {e.item}: {e.response}
          </Copy>
          <Action
            quiet
            destructive
            title={'Remover evidência ' + (i + 1)}
            disabled={busy}
            onPress={() => patch({ evidence: form.evidence.filter((_, n) => n !== i) })}
          />
        </Card>
      ))}
      <Field
        label="Notas adicionais (opcional)"
        value={form.notes}
        onChangeText={(notes) => patch({ notes })}
        multiline
        maxLength={1500}
        editable={!busy && ready && !draft.loading}
      />
      <Action
        icon={ClipboardCheck}
        title={save.busy ? 'Registrando…' : 'Finalizar avaliação'}
        disabled={busy || !form.evidence.length || unavailableInstrument || draft.loading || !ready}
        onPress={() =>
          void save.run(
            '/students/' + student.id + '/assessments',
            {
              instrument: form.instrument_id || 'coleta-descritiva-v1-pendente-D03',
              evidence: form.evidence,
              notes: form.notes,
              synthetic: false,
            },
            () => {
              setForm(empty);
              setVersion(0);
              setLastSaved(JSON.stringify(empty));
              setSaved(true);
            },
          )
        }
      />
      <SaveState command={save} />
      {saved && (
        <Card>
          <Copy heading>Avaliação registrada</Copy>
          <Copy muted>
            As evidências já fazem parte do histórico. O nível continua sendo uma confirmação
            pedagógica separada.
          </Copy>
          <Action
            title="Ir para as atividades"
            onPress={() => navigation.replace('Trail', { student })}
          />
        </Card>
      )}
      <Sheet
        visible={!!exit}
        title="Guardar seu ponto de partida?"
        close={() => {
          if (!busy) setExit(null);
        }}
      >
        <Copy>Salve o rascunho para continuar depois, inclusive ao reabrir o aplicativo.</Copy>
        <Action
          title="Salvar rascunho e sair"
          disabled={busy}
          onPress={() => void persist(leave)}
        />
        <Action secondary title="Continuar preenchendo" onPress={() => setExit(null)} />
        <Action
          quiet
          destructive
          title="Sair sem salvar estas alterações"
          disabled={busy}
          onPress={leave}
        />
        <SaveState command={draftSave} />
      </Sheet>
    </Page>
  );
}
