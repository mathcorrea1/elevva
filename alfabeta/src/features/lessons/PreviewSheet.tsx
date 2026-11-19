import { useState } from 'react';
import { Sheet } from '@/shared/ui/Sheet';
import { Action, Copy } from '@/shared/ui';
import { Badge } from '@/shared/ui/learning';
import { LoadState } from '@/shared/ui/ResourceState';
import { useResource } from '@/shared/data/hooks';
import type { Lesson, ResponseValue } from './types';
import { emptyValue } from './types';
import { ContentScreen } from './PlayerScreen';
import { Activity } from './Activity';
export function PreviewSheet({
  lesson,
  close,
  local = false,
}: {
  lesson: Lesson;
  close: () => void;
  local?: boolean;
}) {
  const resource = useResource<Lesson>(
    local ? null : '/lessons/' + lesson.id + '?revision_id=' + lesson.revision_id,
  );
  const data = { ...resource, data: local ? lesson : resource.data };
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState<ResponseValue>(null);
  const s = data.data?.body.screens[index];
  return (
    <Sheet visible title={'Prévia · versão ' + lesson.version} close={close}>
      <LoadState resource={data} />
      <Badge text="PRÉVIA DOCENTE · NÃO GERA RESULTADOS" />
      {s && (
        <>
          <Copy heading>{s.title || 'Tela ' + (index + 1)}</Copy>
          <ContentScreen screen={s} />
          {s.question && (
            <>
              <Copy>{s.question.prompt}</Copy>
              <Activity
                key={s.id}
                question={s.question}
                value={value ?? emptyValue(s.question.kind)}
                onChange={setValue}
              />
            </>
          )}
          <Action
            secondary
            title="Tela anterior da prévia"
            disabled={!index}
            onPress={() => {
              setIndex(index - 1);
              setValue(null);
            }}
          />
          <Action
            title="Próxima tela da prévia"
            disabled={index >= (data.data?.body.screens.length || 0) - 1}
            onPress={() => {
              setIndex(index + 1);
              setValue(null);
            }}
          />
        </>
      )}
      {!!data.data && !data.data.body.screens.length && (
        <Copy>Este rascunho ainda não tem telas.</Copy>
      )}
    </Sheet>
  );
}
