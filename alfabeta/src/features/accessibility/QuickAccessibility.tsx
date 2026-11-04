import { useState } from 'react';
import { Accessibility } from 'lucide-react-native';
import { Action, Copy } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Pills } from '@/shared/ui/learning';
import { useTheme } from '@/shared/theme/ThemeProvider';
export function QuickAccessibility() {
  const [open, setOpen] = useState(false);
  const { preferences, update } = useTheme();
  return (
    <>
      <Action
        secondary
        icon={Accessibility}
        title="Apoios de acessibilidade"
        onPress={() => setOpen(true)}
      />
      <Sheet visible={open} title="Seu jeito de aprender" close={() => setOpen(false)}>
        <Copy>Estes apoios não mudam suas respostas.</Copy>
        <Pills
          value={String(preferences.font_scale)}
          options={[
            { value: '1', label: '100%' },
            { value: '1.25', label: '125%' },
            { value: '1.5', label: '150%' },
          ]}
          onChange={(v) => update({ font_scale: Number(v) as 1 | 1.25 | 1.5 })}
        />
        <Action
          secondary
          selected={preferences.contrast}
          title={'Alto contraste: ' + (preferences.contrast ? 'ativado' : 'desativado')}
          onPress={() => update({ contrast: !preferences.contrast })}
        />
        <Action
          secondary
          selected={preferences.read_enabled}
          title={'Leitura: ' + (preferences.read_enabled ? 'visível' : 'oculta')}
          onPress={() => update({ read_enabled: !preferences.read_enabled })}
        />
        <Copy muted>
          A leitura só é oferecida quando permitida para o item. Vídeos em Libras aguardam produção
          e revisão.
        </Copy>
      </Sheet>
    </>
  );
}
