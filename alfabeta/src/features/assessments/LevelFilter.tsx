import { useState } from 'react';
import { ListFilter } from 'lucide-react-native';
import { Action, Copy } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Pills } from '@/shared/ui/learning';
import { literacyOptions, levelLabel } from './levels';
export function LevelFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Action
        quiet
        icon={ListFilter}
        title={value ? levelLabel(value) : 'Filtrar por nível'}
        onPress={() => setOpen(true)}
      />
      <Sheet visible={open} title="Nível do público-alvo" close={() => setOpen(false)}>
        <Copy muted>Classificação definida pelo autor do conteúdo.</Copy>
        <Pills
          value={value}
          options={[{ value: '', label: 'Todos os níveis' }, ...literacyOptions]}
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
