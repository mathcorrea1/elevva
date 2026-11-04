import React, { useState } from 'react';
import type { Content } from '@/shared/contracts';
import { Card, Action, Field, Notice, Copy } from '@/shared/ui';
import { useCommand } from '@/shared/data/hooks';
export function ContentReviewCard({
  content,
  canReview,
  isAuthor,
  changed,
}: {
  content: Content;
  canReview: boolean;
  isAuthor: boolean;
  changed: () => Promise<void>;
}) {
  const save = useCommand();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [citation, setCitation] = useState('');
  const [excerpt, setExcerpt] = useState('');
  if (content.status !== 'draft') return null;
  const valid =
    note.trim().length >= 10 &&
    title.trim().length >= 2 &&
    citation.trim().length >= 5 &&
    excerpt.trim().length >= 20;
  return (
    <Card>
      <Copy>
        {content.review
          ? content.review.approved
            ? 'Revisão favorável registrada. Publicação é uma ação separada.'
            : 'Revisão não favorável. O autor pode editar o rascunho e enviar uma nova versão para revisão.'
          : 'Aguarda revisor pedagógico designado. A profissão professor não autoriza aprovação.'}
      </Copy>
      {canReview && !content.review && (
        <>
          <Action
            secondary
            title={open ? 'Fechar revisão pedagógica' : 'Revisar esta versão'}
            onPress={() => setOpen((v) => !v)}
          />
          {open && (
            <>
              <Copy>
                Registre seu parecer e a referência autorizada. A designação do revisor depende do
                responsável pelo projeto.
              </Copy>
              <Field
                label="Parecer pedagógico"
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={1500}
              />
              <Field
                label="Título da referência"
                value={title}
                onChangeText={setTitle}
                maxLength={150}
              />
              <Field
                label="Citação, página ou URL da fonte"
                value={citation}
                onChangeText={setCitation}
                maxLength={500}
              />
              <Field
                label="Trecho autorizado para apoiar a análise"
                value={excerpt}
                onChangeText={setExcerpt}
                multiline
                maxLength={1500}
              />
              {[true, false].map((approved) => (
                <Action
                  key={String(approved)}
                  title={
                    approved ? 'Registrar parecer favorável' : 'Registrar parecer não favorável'
                  }
                  secondary={!approved}
                  disabled={save.busy || !valid}
                  onPress={() =>
                    void save.run(
                      '/content/' + content.id + '/reviews',
                      {
                        version: content.version,
                        approved,
                        note,
                        references: [{ title, citation, excerpt }],
                      },
                      changed,
                    )
                  }
                />
              ))}
            </>
          )}
        </>
      )}
      {isAuthor && (
        <Action
          title="Publicar conteúdo revisado"
          disabled={save.busy || !content.review?.approved}
          onPress={() =>
            void save.run(
              '/content/' + content.id + '/publish',
              {
                version: content.version,
                review_note: 'Publicação pelo autor após revisão registrada.',
              },
              changed,
            )
          }
        />
      )}
      {save.message ? <Notice text={save.message} /> : null}
      {save.error ? <Notice error text={save.error} /> : null}
    </Card>
  );
}
