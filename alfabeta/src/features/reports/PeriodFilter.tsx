import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react-native';
import { Sheet } from '@/shared/ui/Sheet';
import { Action, Field, Copy } from '@/shared/ui';
import { Badge } from '@/shared/ui/learning';
import { validOptionalDate } from '@/shared/dates';
export function PeriodFilter({
  start,
  end,
  apply,
}: {
  start: string;
  end: string;
  apply: (start: string, end: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const valid = validOptionalDate(from) && validOptionalDate(to) && (!from || !to || from <= to);
  return (
    <>
      <Badge
        text={start || end ? `${start || 'Início'} até ${end || 'hoje'}` : 'Todo o histórico'}
      />
      <Action
        secondary
        icon={SlidersHorizontal}
        title="Filtrar período"
        onPress={() => {
          setFrom(start);
          setTo(end);
          setOpen(true);
        }}
      />
      <Sheet visible={open} title="Qual período acompanhar?" close={() => setOpen(false)}>
        <Copy>Para um relatório bimestral, informe as datas do bimestre.</Copy>
        <Field label="Início (AAAA-MM-DD)" value={from} onChangeText={setFrom} />
        <Field label="Fim (AAAA-MM-DD)" value={to} onChangeText={setTo} />
        {!valid && <Copy>Verifique o formato das datas e a ordem do período.</Copy>}
        <Action
          title="Aplicar período"
          disabled={!valid}
          onPress={() => {
            apply(from, to);
            setOpen(false);
          }}
        />
        <Action
          secondary
          title="Limpar período"
          onPress={() => {
            setFrom('');
            setTo('');
          }}
        />
        <Action quiet title="Cancelar alterações" onPress={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
export function periodQuery(start: string, end: string) {
  return start || end
    ? '?' +
        [start && 'start=' + encodeURIComponent(start), end && 'end=' + encodeURIComponent(end)]
          .filter(Boolean)
          .join('&')
    : '';
}
