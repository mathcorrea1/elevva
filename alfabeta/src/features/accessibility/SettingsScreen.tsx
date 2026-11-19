import { useState } from 'react';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useCommand, useResource } from '@/shared/data/hooks';
import { Reading } from './Reading';
import { Libras } from './Libras';
import { EnvironmentStatus } from './EnvironmentStatus';
import { FollowupCard } from '@/features/feedback/FollowupCard';
import { SaveState } from '@/shared/ui/ResourceState';
import { Pills, MenuRow } from '@/shared/ui/learning';
import { ScreenTitle } from '@/shared/ui/presentation';
import { Sheet } from '@/shared/ui/Sheet';
import { MessageSquare, Info, Play } from 'lucide-react-native';
import { replayOnboarding } from '@/features/onboarding/OnboardingGate';
export function SettingsScreen() {
  const { preferences, update } = useTheme();
  const save = useCommand();
  const appearanceSave = useCommand();
  const [section, setSection] = useState('appearance');
  const [panel, setPanel] = useState<'feedback' | 'about' | null>(null);
  const [feedback, setFeedback] = useState('');
  const sent = useResource<{ id: string; created_at: string }[]>(
    panel === 'feedback' ? '/feedback' : null,
  );
  return (
    <Page>
      <ScreenTitle
        title="Do seu jeito"
        subtitle="Ajustes que acompanham você."
        action={
          <Action
            title={appearanceSave.busy ? 'Salvando…' : 'Salvar'}
            disabled={appearanceSave.busy}
            onPress={() =>
              void appearanceSave.run('/me/preferences', preferences, undefined, 'PUT')
            }
          />
        }
      />
      <SaveState command={appearanceSave} />
      <Pills
        value={section}
        onChange={setSection}
        options={[
          { value: 'appearance', label: 'Aparência' },
          { value: 'reading', label: 'Leitura' },
          { value: 'libras', label: 'Libras' },
        ]}
      />
      {section === 'appearance' && (
        <>
          <Card>
            <Copy heading>Aparência</Copy>
            <Pills
              options={[
                { value: 'system', label: 'Sistema' },
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Escuro' },
              ]}
              value={preferences.theme}
              onChange={(value) => update({ theme: value as 'system' | 'light' | 'dark' })}
            />
            <Action
              secondary
              title={'Alto contraste: ' + (preferences.contrast ? 'ativado' : 'desativado')}
              selected={preferences.contrast}
              onPress={() => update({ contrast: !preferences.contrast })}
            />
          </Card>
          <Card>
            <Copy heading>Tamanho do texto</Copy>
            <Copy muted>Ampliação adicional ao tamanho escolhido no aparelho.</Copy>
            <Pills
              options={[
                { value: '1', label: 'Padrão' },
                { value: '1.25', label: 'Maior' },
                { value: '1.5', label: 'Muito maior' },
              ]}
              value={String(preferences.font_scale)}
              onChange={(v) => update({ font_scale: Number(v) as 1 | 1.25 | 1.5 })}
            />
            <Action
              secondary
              title={
                'Reduzir movimento: ' + (preferences.reduce_motion ? 'ativado' : 'seguir sistema')
              }
              selected={preferences.reduce_motion}
              onPress={() => update({ reduce_motion: !preferences.reduce_motion })}
            />
          </Card>
          <Copy muted size="caption">
            As mudanças já estão aplicadas neste aparelho. Salvar também guarda as preferências na
            sua conta.
          </Copy>
        </>
      )}
      {section === 'reading' && (
        <Card>
          <Copy heading>Leitura em voz alta</Copy>
          <Copy muted>
            Ouça as instruções quando esse apoio estiver disponível para a atividade.
          </Copy>
          <Action
            secondary
            title={'Controles de leitura: ' + (preferences.read_enabled ? 'visíveis' : 'ocultos')}
            selected={preferences.read_enabled}
            onPress={() => update({ read_enabled: !preferences.read_enabled })}
          />
          <Copy>Escolha uma resposta e confirme. Você pode ouvir a instrução novamente.</Copy>
          <Reading text="Escolha uma resposta e confirme. Você pode ouvir a instrução novamente." />
        </Card>
      )}
      {section === 'libras' && <Libras />}
      <MenuRow icon={Play} title="Rever boas-vindas" onPress={replayOnboarding} />
      <MenuRow
        icon={MessageSquare}
        title="Enviar uma sugestão"
        detail="Ajude a melhorar o Eleva"
        onPress={() => setPanel('feedback')}
      />
      <MenuRow icon={Info} title="Sobre esta versão" onPress={() => setPanel('about')} />
      <Sheet
        visible={panel === 'feedback'}
        title="Sua experiência importa"
        close={() => setPanel(null)}
      >
        <Field
          label="Como podemos melhorar? Não inclua dados de estudantes."
          value={feedback}
          onChangeText={setFeedback}
          multiline
          maxLength={2000}
        />
        <Action
          title={save.busy ? 'Salvando…' : 'Enviar sugestão'}
          disabled={feedback.trim().length < 10 || save.busy}
          onPress={() =>
            void save.run('/feedback', { text: feedback }, async () => {
              setFeedback('');
              await sent.reload();
            })
          }
        />
        {!!sent.data?.[0] && (
          <Copy muted>
            Último envio: {new Date(sent.data[0].created_at).toLocaleString('pt-BR')}.
          </Copy>
        )}
        <SaveState command={save} />
        <FollowupCard />
      </Sheet>
      <Sheet visible={panel === 'about'} title="Sobre o Eleva" close={() => setPanel(null)}>
        <Copy>
          Uma aplicação para aprender e acompanhar, com respeito ao ritmo de cada estudante.
        </Copy>
        <Notice text="Demonstração com dados fictícios. Conteúdo pedagógico e vídeos de Libras precisam de revisão humana antes do uso real." />
        <EnvironmentStatus />
      </Sheet>
    </Page>
  );
}
