import React, { useState } from 'react';
import type { Content } from '@/shared/contracts';
import { Action, Card, Copy, Field, Notice } from '@/shared/ui';
import { useCommand } from '@/shared/data/hooks';

type DraftItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  reading_allowed: boolean;
};
const blankItem = (id: string): DraftItem => ({
  id,
  prompt: '',
  choices: ['', ''],
  answer: 0,
  reading_allowed: false,
});
export function ContentEditor({
  initial,
  saved,
  cancel,
}: {
  initial?: Content;
  saved: () => Promise<void>;
  cancel: () => void;
}) {
  const save = useCommand();
  const [kind, setKind] = useState<Content['kind']>(initial?.kind ?? 'guidance');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [instructions, setInstructions] = useState(initial?.body.instructions ?? '');
  const [rubric, setRubric] = useState(initial?.body.rubric_text ?? '');
  const [items, setItems] = useState<DraftItem[]>(
    initial?.body.items.length
      ? initial.body.items.map((item) => ({ ...item, answer: item.answer ?? 0 }))
      : [blankItem('item-1')],
  );
  const [index, setIndex] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const item = items[index];
  const patchItem = (patch: Partial<DraftItem>) =>
    setItems((current) =>
      current.map((value, i) => (i === index ? { ...value, ...patch } : value)),
    );
  const invalidItems = items.flatMap((value, i) => {
    const choices = value.choices.map((choice) => choice.trim());
    return !value.prompt.trim() ||
      choices.some((choice) => !choice) ||
      new Set(choices).size !== choices.length
      ? [i + 1]
      : [];
  });
  const valid =
    !!title.trim() &&
    !!instructions.trim() &&
    (kind === 'guidance' || invalidItems.length === 0) &&
    (kind !== 'instrument' || rubric.trim().length >= 20);
  return (
    <Card>
      <Copy heading>
        {initial ? 'Editar rascunho · versão ' + initial.version : 'Novo rascunho'}
      </Copy>
      <Copy muted>Salvar não publica. Cada alteração de um rascunho salvo exige nova revisão.</Copy>
      {!initial &&
        (['guidance', 'activity', 'instrument'] as const).map((value) => (
          <Action
            key={value}
            selected={kind === value}
            secondary={kind !== value}
            title={
              {
                guidance: 'Orientação',
                activity: 'Atividade',
                instrument: 'Instrumento de avaliação',
              }[value]
            }
            onPress={() => setKind(value)}
          />
        ))}
      <Field label="Título" value={title} onChangeText={setTitle} maxLength={120} />
      <Field
        label="Instruções / orientação"
        value={instructions}
        onChangeText={setInstructions}
        multiline
        maxLength={1500}
      />
      {kind === 'instrument' && (
        <Field
          label="Critérios e limites propostos para interpretação do instrumento"
          value={rubric}
          onChangeText={setRubric}
          multiline
          maxLength={3000}
        />
      )}
      {kind !== 'guidance' && (
        <>
          <Card key={item.id}>
            <Copy heading headingLevel={3}>
              Item {index + 1} de {items.length}
            </Copy>
            <Field
              label="Pergunta do item"
              value={item.prompt}
              onChangeText={(prompt) => patchItem({ prompt })}
              maxLength={400}
            />
            {item.choices.map((choice, choiceIndex) => (
              <Field
                key={choiceIndex}
                label={'Alternativa ' + String.fromCharCode(65 + choiceIndex)}
                value={choice}
                onChangeText={(text) =>
                  patchItem({
                    choices: item.choices.map((value, i) => (i === choiceIndex ? text : value)),
                  })
                }
                maxLength={100}
              />
            ))}
            {item.choices.map((_, choiceIndex) => (
              <Action
                key={choiceIndex}
                title={'Gabarito: alternativa ' + String.fromCharCode(65 + choiceIndex)}
                secondary={item.answer !== choiceIndex}
                selected={item.answer === choiceIndex}
                onPress={() => patchItem({ answer: choiceIndex })}
              />
            ))}
            <Action
              secondary
              title="Adicionar alternativa"
              disabled={item.choices.length >= 6}
              onPress={() => patchItem({ choices: [...item.choices, ''] })}
            />
            <Action
              secondary
              title="Remover última alternativa"
              disabled={item.choices.length <= 2}
              onPress={() =>
                patchItem({
                  choices: item.choices.slice(0, -1),
                  answer: Math.min(item.answer, item.choices.length - 2),
                })
              }
            />
            <Action
              secondary
              selected={item.reading_allowed}
              title={
                'Proposta de leitura deste item: ' +
                (item.reading_allowed ? 'permitida' : 'desabilitada')
              }
              onPress={() => patchItem({ reading_allowed: !item.reading_allowed })}
            />
            <Copy muted>
              O revisor precisa avaliar se a leitura altera a habilidade observada. O gabarito fica
              na área adulta.
            </Copy>
          </Card>
          <Action
            secondary
            title="Item anterior"
            disabled={index === 0}
            onPress={() => setIndex(index - 1)}
          />
          <Action
            secondary
            title="Próximo item"
            disabled={index === items.length - 1}
            onPress={() => setIndex(index + 1)}
          />
          <Action
            secondary
            title="Adicionar item"
            disabled={items.length >= 20}
            onPress={() => {
              let suffix = items.length + 1;
              while (items.some((value) => value.id === 'item-' + suffix)) suffix++;
              setItems([...items, blankItem('item-' + suffix)]);
              setIndex(items.length);
            }}
          />
          <Action
            secondary
            title="Remover este item do rascunho"
            disabled={items.length === 1}
            onPress={() => {
              setItems(items.filter((_, i) => i !== index));
              setIndex(Math.max(0, index - 1));
            }}
          />
          {!!invalidItems.length && (
            <Copy muted>
              Revise pergunta e alternativas distintas dos itens: {invalidItems.join(', ')}.
            </Copy>
          )}
        </>
      )}
      <Action
        title="Salvar rascunho"
        disabled={save.busy || !valid}
        onPress={() =>
          void save.run(
            initial ? '/content/' + initial.id + '/revisions' : '/content',
            {
              kind,
              title,
              instructions,
              rubric_text: kind === 'instrument' ? rubric : null,
              items: kind === 'guidance' ? [] : items,
              ...(initial ? { version: initial.version } : {}),
            },
            saved,
          )
        }
      />
      <Action
        secondary
        title="Cancelar edição"
        disabled={save.busy}
        expanded={confirmCancel}
        onPress={() => setConfirmCancel((value) => !value)}
      />
      {confirmCancel && (
        <>
          <Notice text="As alterações ainda não enviadas serão descartadas. O rascunho já salvo continuará disponível." />
          <Action secondary title="Continuar editando" onPress={() => setConfirmCancel(false)} />
          <Action title="Descartar alterações não salvas" onPress={cancel} />
        </>
      )}
      {!!save.message && <Notice text={save.message} />}
      {!!save.error && <Notice error text={save.error} />}
    </Card>
  );
}
