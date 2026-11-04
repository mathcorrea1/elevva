import { useState } from 'react';
import { Action, Copy, Field } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Pills } from '@/shared/ui/learning';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import type { EvidenceRow } from '@/features/reports/overviewTypes';
import type { LessonAttempt } from './types';
export function AnswerReview({
  studentId,
  evidence,
  close,
  changed,
}: {
  studentId: string;
  evidence: EvidenceRow;
  close: () => void;
  changed: () => Promise<void>;
}) {
  const base = '/students/' + studentId + '/attempts/' + evidence.evidence_id;
  const data = useResource<LessonAttempt>(base);
  const save = useCommand();
  const [correct, setCorrect] = useState('accepted');
  const [note, setNote] = useState('');
  return (
    <Sheet visible title="Revisar resposta escrita" close={close}>
      <Copy heading>{evidence.prompt}</Copy>
      <Copy>Resposta registrada: {evidence.response}</Copy>
      <Copy muted>
        A revisão identifica uma variante aceita ou uma resposta diferente dos critérios desta
        questão. Não confirma nível de alfabetização.
      </Copy>
      <LoadState resource={data} />
      <Pills
        value={correct}
        options={[
          { value: 'accepted', label: 'Aceitar variante' },
          { value: 'different', label: 'Diferente do esperado' },
        ]}
        onChange={setCorrect}
      />
      <Field
        label="Justificativa da revisão"
        value={note}
        onChangeText={setNote}
        maxLength={1000}
        multiline
      />
      <Action
        title="Registrar revisão"
        disabled={!data.data || note.trim().length < 5 || save.busy}
        onPress={() =>
          void save.run(
            base + '/review-answer',
            {
              version: data.data?.version,
              item_id: evidence.item_id,
              correct: correct === 'accepted',
              note,
              response_event_id: evidence.response_event_id || null,
            },
            async () => {
              await changed();
              close();
            },
          )
        }
      />
      <SaveState command={save} />
    </Sheet>
  );
}
