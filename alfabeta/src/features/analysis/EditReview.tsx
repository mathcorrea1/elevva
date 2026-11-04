import React, { useState } from 'react';
import type { Analysis } from '@/shared/contracts';
import { Card, Action, Field, Copy, Notice } from '@/shared/ui';
import { useCommand } from '@/shared/data/hooks';
export function EditReview({
  analysis,
  studentId,
  changed,
}: {
  analysis: Analysis;
  studentId: string;
  changed: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(analysis.result?.summary || '');
  const [note, setNote] = useState('');
  const save = useCommand();
  if (analysis.review || !analysis.result) return null;
  return (
    <Card>
      <Action
        secondary
        title={open ? 'Cancelar ajuste' : 'Ajustar resumo e registrar revisão'}
        onPress={() => setOpen((v) => !v)}
      />
      {open && (
        <>
          <Copy>
            O resultado original e suas referências serão conservados. Este ajuste não confirma
            nível nem publica uma recomendação.
          </Copy>
          <Field
            label="Resumo revisado pelo adulto"
            value={summary}
            onChangeText={setSummary}
            maxLength={1000}
            multiline
          />
          <Field
            label="Por que o texto foi ajustado?"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={1000}
          />
          <Action
            title="Salvar revisão com ajuste"
            disabled={save.busy || !summary.trim() || note.trim().length < 10}
            onPress={() =>
              void save.run(
                '/students/' + studentId + '/analyses/' + analysis.id + '/review',
                { decision: 'edited', note, revised_result: { ...analysis.result, summary } },
                changed,
              )
            }
          />
          {save.error ? <Notice error text={save.error} /> : null}
        </>
      )}
    </Card>
  );
}
