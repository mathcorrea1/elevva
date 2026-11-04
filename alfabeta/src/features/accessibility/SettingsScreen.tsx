import React, { useState } from 'react';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useCommand, useResource } from '@/shared/data/hooks';
import { Reading } from './Reading';
import { Libras } from './Libras';
import { EnvironmentStatus } from './EnvironmentStatus';
import { FollowupCard } from '@/features/feedback/FollowupCard';
import { SaveState } from '@/shared/ui/ResourceState';
import { Disclosure, Eyebrow, Pills } from '@/shared/ui/learning';
import { replayOnboarding } from '@/features/onboarding/OnboardingGate';
export function SettingsScreen() {
  const { preferences, update } = useTheme();
  const save = useCommand();
  const appearanceSave = useCommand();
  const [feedback, setFeedback] = useState('');
  const sent = useResource<{ id: string; created_at: string }[]>('/feedback');
  return (
    <Page>
      <Eyebrow>SEU ELEVA, DO SEU JEITO</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Configurações
      </Copy>
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
        <Copy>Tamanho adicional da fonte, além do tamanho do sistema:</Copy>
        <Pills
          options={[
            { value: '1', label: '100%' },
            { value: '1.25', label: '125%' },
            { value: '1.5', label: '150%' },
          ]}
          value={String(preferences.font_scale)}
          onChange={(value) => update({ font_scale: Number(value) as 1 | 1.25 | 1.5 })}
        />
        <Action
          secondary
          title={'Reduzir movimento: ' + (preferences.reduce_motion ? 'ativado' : 'seguir sistema')}
          selected={preferences.reduce_motion}
          onPress={() => update({ reduce_motion: !preferences.reduce_motion })}
        />
        <Action
          title="Salvar preferências na conta"
          disabled={appearanceSave.busy}
          onPress={() => void appearanceSave.run('/me/preferences', preferences, undefined, 'PUT')}
        />
        <SaveState command={appearanceSave} />
        <Copy muted>
          Preferências locais são desta conta neste dispositivo; o botão sincroniza com o servidor.
          Nenhuma adaptação exige diagnóstico.
        </Copy>
      </Card>
      <Disclosure title="Leitura e áudio">
        <Card>
          <Copy heading>Leitura em voz alta</Copy>
          <Action
            secondary
            title={'Controles de leitura: ' + (preferences.read_enabled ? 'visíveis' : 'ocultos')}
            selected={preferences.read_enabled}
            onPress={() => update({ read_enabled: !preferences.read_enabled })}
          />
          <Copy>Escolha uma resposta e confirme. Você pode ouvir a instrução novamente.</Copy>
          <Reading text="Escolha uma resposta e confirme. Você pode ouvir a instrução novamente." />
        </Card>
      </Disclosure>
      <Disclosure title="Apoio em Libras">
        <Libras />
      </Disclosure>
      <Disclosure title="Ajude a melhorar o Eleva">
        <Card>
          <Copy heading>Enviar feedback</Copy>
          <Field
            label="Como podemos melhorar? Não inclua dados de estudantes."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            maxLength={2000}
          />
          <Action
            secondary
            title="Salvar feedback"
            disabled={feedback.trim().length < 10 || save.busy}
            onPress={() =>
              void save.run('/feedback', { text: feedback }, async () => {
                setFeedback('');
                await sent.reload();
              })
            }
          />
          {sent.data?.[0] && (
            <Copy muted>
              Último feedback enviado em {new Date(sent.data[0].created_at).toLocaleString('pt-BR')}
              .
            </Copy>
          )}
        </Card>
        {!!save.message && <Notice text={save.message} />}
        <FollowupCard />
      </Disclosure>
      {!!save.error && <Notice error text={save.error} />}
      <Action secondary title="Rever apresentação do Eleva" onPress={replayOnboarding} />
      <Disclosure title="Sobre esta versão">
        <EnvironmentStatus />
        <Copy muted>
          Eleva · Desenvolvimento. Conteúdo pedagógico e vídeos em Libras exigem revisão humana.
          Consulte o registro de validação antes da apresentação.
        </Copy>
      </Disclosure>
    </Page>
  );
}
