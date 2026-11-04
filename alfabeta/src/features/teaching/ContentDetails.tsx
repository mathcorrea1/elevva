import React, { useState } from 'react';
import type { Content } from '@/shared/contracts';
import { Stack, Card, Copy, Action } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Reading } from '@/features/accessibility/Reading';
export function ContentDetails({ content }: { content: Content }) {
  const [open, setOpen] = useState(false);
  return (
    <Stack>
      <Action
        secondary
        title={
          open
            ? 'Fechar conteúdo'
            : content.kind === 'guidance'
              ? 'Ler orientação'
              : 'Ver instruções, itens e critérios'
        }
        expanded={open}
        onPress={() => setOpen((v) => !v)}
      />
      <Sheet visible={open} title={content.title} close={() => setOpen(false)}>
        <>
          <Copy>{content.body.instructions}</Copy>
          <Reading text={content.body.instructions} />
          <Copy muted>V?deo revisado em Libras ainda n?o dispon?vel.</Copy>
          {content.body.rubric_text ? (
            <Copy>Critérios propostos: {content.body.rubric_text}</Copy>
          ) : null}
          {content.body.items.map((item, index) => (
            <Card key={item.id}>
              <Copy>
                {index + 1}. {item.prompt}
              </Copy>
              {item.choices.map((choice, i) => (
                <Copy key={i}>
                  {i + 1}. {choice}
                </Copy>
              ))}
              <Copy muted>
                Gabarito do conteúdo adulto:{' '}
                {typeof item.answer === 'number' ? item.choices[item.answer] : 'Não informado'}.
                Leitura:{' '}
                {item.reading_allowed ? 'permitida pelo conteúdo' : 'desabilitada para este item'}.
              </Copy>
            </Card>
          ))}
        </>
      </Sheet>
    </Stack>
  );
}
