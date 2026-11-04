import { useState } from 'react';
import { View } from 'react-native';
import { ArrowUp, ArrowDown, X } from 'lucide-react-native';
import { Action, Card, Copy, Field } from '@/shared/ui';
import { Illustration } from '@/features/trails/Illustration';
import { IconAction } from '@/shared/ui/IconAction';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { Question, ResponseValue, Element } from './types';

const elementLabel = (item: Element | undefined, fallback = 'Imagem') =>
  item?.text || item?.image?.alt || fallback;

function ElementContent({ item }: { item: Element }) {
  return (
    <>
      {item.image && <Illustration image={item.image} height={100} />}
      {!!item.text && <Copy>{item.text}</Copy>}
    </>
  );
}
export function Activity({
  question: q,
  value,
  onChange,
  disabled = false,
}: {
  question: Question;
  value: ResponseValue;
  onChange: (v: ResponseValue) => void;
  disabled?: boolean;
}) {
  const [left, setLeft] = useState<string | null>(null);
  const { colors } = useTheme();
  const list = Array.isArray(value) ? value : [];
  const pairs = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  if (q.kind === 'text')
    return (
      <Field
        label="Sua resposta"
        value={typeof value === 'string' ? value : ''}
        editable={!disabled}
        maxLength={200}
        autoCorrect={false}
        autoCapitalize="none"
        onChangeText={onChange}
      />
    );
  if (q.kind === 'matching')
    return (
      <View style={{ gap: 12 }}>
        <Copy muted>Escolha um elemento e depois seu par. Você também pode usar Tab e Enter.</Copy>
        {q.options.map((o, index) => (
          <View key={o.id} style={{ gap: 6 }}>
            {o.image && <Illustration image={o.image} height={100} />}
            <Action
              secondary
              disabled={disabled}
              selected={left === o.id}
              title={
                elementLabel(o, 'Imagem ' + (index + 1)) +
                (pairs[o.id]
                  ? ' → ' + elementLabel(q.targets.find((t) => t.id === pairs[o.id]))
                  : ' · escolher par')
              }
              onPress={() => setLeft(o.id)}
            />
          </View>
        ))}
        {left && (
          <Card>
            <Copy>Qual é o par de {elementLabel(q.options.find((o) => o.id === left))}?</Copy>
            {q.targets.map((t, index) => (
              <View key={t.id} style={{ gap: 4 }}>
                <ElementContent item={t} />
                <Action
                  secondary
                  title={'Associar a ' + (t.text || t.image?.alt || 'imagem ' + (index + 1))}
                  disabled={disabled}
                  onPress={() => {
                    const next = Object.fromEntries(
                      Object.entries(pairs).filter(([k, v]) => k !== left && v !== t.id),
                    );
                    onChange({ ...next, [left]: t.id });
                    setLeft(null);
                  }}
                />
              </View>
            ))}
          </Card>
        )}
      </View>
    );
  if (q.kind === 'order')
    return (
      <View style={{ gap: 12 }}>
        <Copy muted>Toque nos elementos para montar. As setas permitem mudar a ordem.</Copy>
        {list.map((id, index) => (
          <View
            key={id}
            style={{
              padding: 12,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <Copy muted>{index + 1}.</Copy>
            <View style={{ flex: 1, minWidth: 40 }}>
              <ElementContent item={q.options.find((o) => o.id === id)!} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <IconAction
                icon={ArrowUp}
                label={'Mover elemento ' + (index + 1) + ' antes'}
                disabled={disabled || index === 0}
                onPress={() => {
                  const next = [...list];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }}
              />
              <IconAction
                icon={ArrowDown}
                label={'Mover elemento ' + (index + 1) + ' depois'}
                disabled={disabled || index === list.length - 1}
                onPress={() => {
                  const next = [...list];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  onChange(next);
                }}
              />
              <IconAction
                icon={X}
                label={'Retirar elemento ' + (index + 1)}
                disabled={disabled}
                onPress={() => onChange(list.filter((v) => v !== id))}
              />
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {q.options
            .filter((o) => !list.includes(o.id))
            .map((o, index) => (
              <View key={o.id} style={{ gap: 6 }}>
                {o.image && <Illustration image={o.image} height={80} />}
                <Action
                  secondary
                  title={'Adicionar ' + (o.text || o.image?.alt || 'elemento ' + (index + 1))}
                  disabled={disabled}
                  onPress={() => onChange([...list, o.id])}
                />
              </View>
            ))}
        </View>
      </View>
    );
  return (
    <View style={{ gap: 12 }}>
      {q.options.map((o, index) => {
        const selected = q.kind === 'single' ? value === o.id : list.includes(o.id);
        return (
          <View key={o.id} style={{ gap: 4 }}>
            {o.image && <Illustration image={o.image} height={120} />}
            <Action
              secondary
              selected={selected}
              disabled={disabled}
              title={(selected ? '✓ ' : '') + (o.text || o.image?.alt || 'Imagem ' + (index + 1))}
              onPress={() =>
                onChange(
                  q.kind === 'single'
                    ? o.id
                    : selected
                      ? list.filter((v) => v !== o.id)
                      : [...list, o.id],
                )
              }
            />
          </View>
        );
      })}
    </View>
  );
}
