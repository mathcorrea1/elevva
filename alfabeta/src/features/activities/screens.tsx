import { useState } from 'react';
import { Page, Copy, Action, Field } from '@/shared/ui';
import { useCommand } from '@/shared/data/hooks';
import type { ScreenProps as Props } from '@/app/routes';
import { SaveState } from '@/shared/ui/ResourceState';
export { ExecuteScreen } from './ExecuteScreen';
export function ObservationScreen({ route }: Props<'Observation'>) {
  const [context, setContext] = useState('');
  const [text, setText] = useState('');
  const [skill, setSkill] = useState('');
  const [support, setSupport] = useState('');
  const [needs, setNeeds] = useState(false);
  const save = useCommand();
  return (
    <Page title="Observação do adulto">
      <Copy>{route.params.student.name}</Copy>
      <Copy muted>
        Descreva uma atividade externa, inclusive leitura oral acompanhada. Este registro não
        conclui tarefas do aplicativo.
      </Copy>
      <Field label="Em que situação?" value={context} onChangeText={setContext} maxLength={120} />
      <Field
        label="O que você observou?"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={1500}
      />
      <Field
        label="Habilidade observada (opcional, rótulo informado)"
        value={skill}
        onChangeText={setSkill}
        maxLength={100}
      />
      <Field
        label="Apoio oferecido (opcional)"
        value={support}
        onChangeText={setSupport}
        maxLength={200}
      />
      <Action
        secondary
        selected={needs}
        title={'Sinalizar necessidade observada de apoio: ' + (needs ? 'sim' : 'não')}
        onPress={() => setNeeds(!needs)}
      />
      <Action
        title="Salvar observação"
        disabled={!context.trim() || !text.trim() || save.busy}
        onPress={() =>
          void save.run(
            '/students/' + route.params.student.id + '/observations',
            { context, text, skill, support, needs_support: needs },
            () => {
              setContext('');
              setText('');
              setSkill('');
              setSupport('');
              setNeeds(false);
            },
          )
        }
      />
      <SaveState command={save} />
    </Page>
  );
}
