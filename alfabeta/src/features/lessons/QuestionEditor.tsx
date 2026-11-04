import { View } from 'react-native';
import { useState } from 'react';
import { Sheet } from '@/shared/ui/Sheet';
import { Action, Copy, Field } from '@/shared/ui';
import { Pills, Disclosure } from '@/shared/ui/learning';
import { ImageSelector } from '@/features/trails/ImageSelector';
import type { Question, Mechanic, Element } from './types';
import { mechanics } from './types';
import { newQuestion } from './defaults';
export function QuestionEditor({
  question: q,
  onChange,
}: {
  question: Question;
  onChange: (q: Question) => void;
}) {
  const [choosing, setChoosing] = useState(false);
  function patch(p: Partial<Question>) {
    onChange({ ...q, ...p });
  }
  function options(value: Element[], key: 'options' | 'targets') {
    return value.map((o, i) => (
      <View key={o.id} style={{ gap: 8 }}>
        <Field
          label={(key === 'targets' ? 'Par ' : 'Elemento ') + (i + 1)}
          value={o.text}
          maxLength={120}
          onChangeText={(text) =>
            patch({ [key]: value.map((v) => (v.id === o.id ? { ...v, text } : v)) })
          }
        />
        <Disclosure title={'Imagem do ' + (key === 'targets' ? 'par ' : 'elemento ') + (i + 1)}>
          <ImageSelector
            value={o.image || null}
            onChange={(image) =>
              patch({ [key]: value.map((v) => (v.id === o.id ? { ...v, image } : v)) })
            }
          />
        </Disclosure>
      </View>
    ));
  }
  const answerList = Array.isArray(q.answer) ? q.answer : [];
  const answerPairs =
    q.answer && typeof q.answer === 'object' && !Array.isArray(q.answer) ? q.answer : {};
  return (
    <View style={{ gap: 16 }}>
      <Copy heading>Como vamos aprender?</Copy>
      <Action
        secondary
        title={'Formato: ' + mechanics.find((m) => m.value === q.kind)?.label + ' · alterar'}
        onPress={() => setChoosing(true)}
      />
      <Field
        label="Enunciado da atividade"
        value={q.prompt}
        maxLength={500}
        multiline
        onChangeText={(prompt) => patch({ prompt })}
      />
      <Field
        label="Habilidade trabalhada"
        value={q.skill}
        maxLength={100}
        onChangeText={(skill) => patch({ skill })}
      />
      <Field
        label="Instrução de apoio (opcional)"
        value={q.instruction}
        maxLength={1000}
        multiline
        onChangeText={(instruction) => patch({ instruction })}
      />
      <Disclosure title="Imagem de apoio à questão">
        <ImageSelector value={q.image} onChange={(image) => patch({ image })} />
      </Disclosure>
      {q.kind === 'text' ? (
        <>
          <Field
            label="Respostas aceitas (uma por linha)"
            value={answerList.join('\n')}
            multiline
            maxLength={2000}
            onChangeText={(t) => patch({ answer: t.split('\n').slice(0, 10) })}
          />
          <Action
            secondary
            selected={q.normalization.ignore_case}
            title={
              'Ignorar maiúsculas/minúsculas: ' + (q.normalization.ignore_case ? 'sim' : 'não')
            }
            onPress={() =>
              patch({
                normalization: { ...q.normalization, ignore_case: !q.normalization.ignore_case },
              })
            }
          />
          <Action
            secondary
            selected={q.normalization.ignore_accents}
            title={'Aceitar sem acento: ' + (q.normalization.ignore_accents ? 'sim' : 'não')}
            onPress={() =>
              patch({
                normalization: {
                  ...q.normalization,
                  ignore_accents: !q.normalization.ignore_accents,
                },
              })
            }
          />
          <Copy>Resposta fora das variantes</Copy>
          <Pills
            value={q.normalization.unmatched}
            options={[
              { value: 'human_review', label: 'Aguardar revisão docente' },
              { value: 'incorrect', label: 'Aplicar correção estrita' },
            ]}
            onChange={(v) =>
              patch({
                normalization: { ...q.normalization, unmatched: v as 'incorrect' | 'human_review' },
              })
            }
          />
        </>
      ) : (
        <>
          <Copy heading>
            {q.kind === 'order'
              ? 'Elementos para montar'
              : q.kind === 'matching'
                ? 'Elementos e seus pares'
                : 'Alternativas'}
          </Copy>
          {options(q.options, 'options')}
          <Action
            secondary
            title="Adicionar elemento"
            disabled={q.options.length >= 12}
            onPress={() => {
              const id = 'e' + Date.now();
              const next = [...q.options, { id, text: '' }];
              patch(
                q.kind === 'order'
                  ? { options: next, answer: [...answerList, id] }
                  : q.kind === 'matching'
                    ? {
                        options: next,
                        targets: [...q.targets, { id: 'p' + id, text: '' }],
                        answer: { ...answerPairs, [id]: 'p' + id },
                      }
                    : { options: next },
              );
            }}
          />
          <Action
            secondary
            quiet
            title="Remover último elemento"
            disabled={q.options.length <= 2}
            onPress={() => {
              const last = q.options[q.options.length - 1].id;
              const next = q.options.slice(0, -1);
              patch({
                options: next,
                answer:
                  q.kind === 'single'
                    ? q.answer === last
                      ? next[0].id
                      : q.answer
                    : q.kind === 'matching'
                      ? Object.fromEntries(Object.entries(answerPairs).filter(([k]) => k !== last))
                      : answerList.filter((id) => id !== last),
                ...(q.kind === 'matching'
                  ? { targets: q.targets.filter((t) => t.id !== answerPairs[last]) }
                  : {}),
              });
            }}
          />
          {q.kind === 'single' && (
            <>
              <Copy>Resposta correta</Copy>
              <Pills
                value={String(q.answer)}
                options={q.options.map((o, i) => ({
                  value: o.id,
                  label: o.text || 'Alternativa ' + (i + 1),
                }))}
                onChange={(answer) => patch({ answer })}
              />
            </>
          )}
          {q.kind === 'multiple' && (
            <>
              <Copy>Marque todas as respostas corretas</Copy>
              {q.options.map((o, i) => (
                <Action
                  key={o.id}
                  secondary
                  title={
                    (answerList.includes(o.id) ? '✓ ' : '') + (o.text || 'Alternativa ' + (i + 1))
                  }
                  selected={answerList.includes(o.id)}
                  onPress={() =>
                    patch({
                      answer: answerList.includes(o.id)
                        ? answerList.filter((a) => a !== o.id)
                        : [...answerList, o.id],
                    })
                  }
                />
              ))}
            </>
          )}
          {q.kind === 'order' && (
            <>
              <Copy>Ordem correta</Copy>
              <Copy muted>
                O estudante recebe os elementos embaralhados. Defina a sequência abaixo.
              </Copy>
              {answerList.map((id, i) => (
                <View key={id} style={{ gap: 6 }}>
                  <Copy>
                    {i + 1}. {q.options.find((o) => o.id === id)?.text || 'Elemento sem texto'}
                  </Copy>
                  <Action
                    secondary
                    quiet
                    title={'Mover posição ' + (i + 1) + ' para antes'}
                    disabled={!i}
                    onPress={() => {
                      const a = [...answerList];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      patch({ answer: a });
                    }}
                  />
                </View>
              ))}
            </>
          )}
          {q.kind === 'matching' && (
            <>
              {options(q.targets, 'targets')}
              {q.options.map((o) => (
                <View key={o.id} style={{ gap: 8 }}>
                  <Copy>Par correto de {o.text || 'elemento sem texto'}</Copy>
                  <Pills
                    value={answerPairs[o.id]}
                    options={q.targets.map((t, i) => ({
                      value: t.id,
                      label: t.text || 'Par ' + (i + 1),
                    }))}
                    onChange={(id) => patch({ answer: { ...answerPairs, [o.id]: id } })}
                  />
                </View>
              ))}
            </>
          )}
        </>
      )}
      <Disclosure title="Feedback, dicas e tentativas">
        <Field
          label="Feedback de acerto"
          value={q.feedback_correct}
          maxLength={500}
          multiline
          onChangeText={(feedback_correct) => patch({ feedback_correct })}
        />
        <Field
          label="Feedback de outra resposta"
          value={q.feedback_incorrect}
          maxLength={500}
          multiline
          onChangeText={(feedback_incorrect) => patch({ feedback_incorrect })}
        />
        <Field
          label="Dica opcional"
          value={q.hint}
          maxLength={500}
          onChangeText={(hint) => patch({ hint })}
        />
        <Action
          secondary
          selected={q.required}
          title={'Questão obrigatória: ' + (q.required ? 'sim' : 'não')}
          onPress={() => patch({ required: !q.required })}
        />
        <Action
          secondary
          selected={q.reading_allowed}
          title={'Permitir ouvir enunciado: ' + (q.reading_allowed ? 'sim' : 'não')}
          onPress={() => patch({ reading_allowed: !q.reading_allowed })}
        />
        <Copy muted>A leitura não deve alterar a habilidade que você pretende observar.</Copy>
        <Action
          secondary
          selected={q.allow_retry}
          title={'Tentar novamente: ' + (q.allow_retry ? 'permitido' : 'uma resposta')}
          onPress={() => patch({ allow_retry: !q.allow_retry })}
        />
        {q.allow_retry && (
          <Field
            label="Limite de tentativas (1–30; vazio = até 100 por segurança)"
            value={q.max_attempts === null ? '' : String(q.max_attempts)}
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(t) =>
              patch({ max_attempts: t ? Number(t.replace(/\D/g, '')) || 1 : null })
            }
          />
        )}
      </Disclosure>
      <Sheet
        visible={choosing}
        title="Escolher formato de atividade"
        close={() => setChoosing(false)}
      >
        {mechanics.map((m) => (
          <Action
            key={m.value}
            secondary
            selected={q.kind === m.value}
            title={m.label}
            onPress={() => {
              onChange({
                ...newQuestion(q.id, m.value as Mechanic),
                prompt: q.prompt,
                skill: q.skill,
                instruction: q.instruction,
                image: q.image,
              });
              setChoosing(false);
            }}
          />
        ))}
      </Sheet>
    </View>
  );
}
