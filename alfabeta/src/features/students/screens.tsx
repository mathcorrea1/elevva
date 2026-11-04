import React, { useState } from 'react';
import { View, Text } from 'react-native';
import {
  BookOpen,
  FileText,
  History,
  Sparkles,
  ClipboardList,
  MessageSquare,
  Users,
  Route,
} from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { useFocusEffect } from '@react-navigation/native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import type { Student, Report } from '@/shared/contracts';
import { useResource, useCommand } from '@/shared/data/hooks';
import { StudentProfile } from '@/features/students/StudentProfile';
import { AttentionCard } from './AttentionCard';
import { levelLabel } from '@/features/assessments/levels';
import type { ScreenProps as Props } from '@/app/routes';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { Sheet } from '@/shared/ui/Sheet';
import {
  Mascot,
  Eyebrow,
  Badge,
  SectionTitle,
  MenuRow,
  Stat,
  Disclosure,
} from '@/shared/ui/learning';
type Grant = {
  id: string;
  adult_id: string;
  role: string;
  active: boolean;
  can_view_care: boolean;
};
export function StudentScreen({ route, navigation }: Props<'Student'>) {
  const initial = route.params.student;
  const resource = useResource<Student>('/students/' + initial.id);
  const report = useResource<Report>('/students/' + initial.id + '/report');
  const { colors, preferences } = useTheme();
  useFocusEffect(
    React.useCallback(() => {
      void resource.reload();
    }, [resource.reload]),
  );
  const student = resource.data;
  return (
    <Page>
      <LoadState resource={resource} />
      {!!student && (
        <>
          <View style={{ gap: 8 }}>
            <Eyebrow>UMA JORNADA DE DESCOBERTAS</Eyebrow>
            <Copy heading headingLevel={1} size="display">
              {student.name}
            </Copy>
            <Badge
              text={
                student.confirmed_level
                  ? levelLabel(student.confirmed_level)
                  : 'Nível ainda não confirmado'
              }
            />
          </View>
          <View style={{ backgroundColor: colors.hero, borderRadius: 24, padding: 22, gap: 18 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text
                  style={{
                    fontFamily: tokens.fontSemibold,
                    color: colors.heroMuted,
                    fontSize: 12 * preferences.font_scale,
                    letterSpacing: 1.7,
                  }}
                >
                  PRÓXIMO PASSO
                </Text>
                <Text
                  style={{
                    fontFamily: tokens.fontHeading,
                    color: colors.onHero,
                    fontSize: 23 * preferences.font_scale,
                    lineHeight: 32 * preferences.font_scale,
                  }}
                >
                  {student.next_step === 'assessment'
                    ? 'Vamos conhecer seu ponto de partida?'
                    : 'Prontos para a próxima descoberta?'}
                </Text>
              </View>
              <Mascot size={83} />
            </View>
            <Action
              secondary
              title={
                student.next_step === 'assessment'
                  ? 'Registrar avaliação inicial'
                  : 'Continuar atividades'
              }
              onPress={() =>
                navigation.navigate(student.next_step === 'assessment' ? 'Assessment' : 'Trail', {
                  student,
                })
              }
            />
          </View>
          {!!report.data && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <Stat value={report.data.completed_tasks} label="Tarefas concluídas" />
              <Stat value={report.data.observations} label="Observações registradas" />
            </View>
          )}
          <SectionTitle
            title="Aprender e registrar"
            detail="Atividades no aplicativo e observações do adulto têm registros próprios."
          />
          <MenuRow
            icon={Users}
            title="Comunicação, apoios e ponto de partida"
            detail="Informações do estudante, avaliação e plano inicial"
            onPress={() => navigation.navigate('Care', { student })}
          />
          <View style={{ gap: 10 }}>
            <MenuRow
              icon={BookOpen}
              title="Aulas para explorar"
              detail="Aulas do professor, com seu progresso salvo"
              onPress={() => navigation.navigate('AssignedLessons', { student })}
            />
            <MenuRow
              icon={Route}
              title="Trilha de atividades"
              detail="Etapas, tarefas e próximas descobertas"
              onPress={() => navigation.navigate('Trail', { student })}
            />
            <MenuRow
              icon={ClipboardList}
              title="Avaliação inicial"
              detail="Registrar evidências e apoios oferecidos"
              onPress={() => navigation.navigate('Assessment', { student })}
            />
            <MenuRow
              icon={MessageSquare}
              title="Registrar observação"
              detail="Inclui leitura oral acompanhada"
              onPress={() => navigation.navigate('Observation', { student })}
            />
          </View>
          <SectionTitle title="Olhar para a jornada" />
          <View style={{ gap: 10 }}>
            <MenuRow
              icon={History}
              title="Histórico"
              detail="Cada registro, com sua origem e data"
              onPress={() => navigation.navigate('History', { student })}
            />
            <MenuRow
              icon={FileText}
              title="Relatórios"
              detail="Visão individual e por período"
              onPress={() => navigation.navigate('Report', { student })}
            />
            <MenuRow
              icon={Sparkles}
              title="Análise com IA"
              detail="Apoio ao adulto, com revisão humana"
              onPress={() => navigation.navigate('Analysis', { student })}
            />
            <MenuRow
              icon={BookOpen}
              title="Orientações"
              detail="Recomendações registradas pelo professor"
              onPress={() => navigation.navigate('Guidance', { student })}
            />
          </View>
          <AttentionCard studentId={student.id} />
          {student.role === 'owner' && (
            <>
              <Disclosure title="Perfil e adaptações">
                <StudentProfile student={student} changed={resource.reload} />
              </Disclosure>
              <MenuRow
                icon={Users}
                title="Adultos autorizados"
                detail="Compartilhar acompanhamento e gerenciar vínculos"
                onPress={() => navigation.navigate('Links', { student })}
              />
            </>
          )}
        </>
      )}
    </Page>
  );
}

export function LinksScreen({ route }: Props<'Links'>) {
  const sid = route.params.student.id;
  const result = useResource<Grant[]>('/students/' + sid + '/grants');
  const save = useCommand();
  const [token, setToken] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  return (
    <Page title="Adultos autorizados">
      <Copy>
        Convites expiram em 24 horas e só podem ser aceitos uma vez. Compartilhe o código apenas com
        o adulto desejado.
      </Copy>
      <Field
        label="Identificador da conta do adulto destinatário"
        value={recipient}
        onChangeText={setRecipient}
        autoCapitalize="none"
        maxLength={128}
      />
      <Copy muted>O adulto encontra o identificador em Perfil. Só essa conta poderá aceitar.</Copy>
      {(['guardian', 'teacher'] as const).map((role) => (
        <Action
          key={role}
          title={
            role === 'teacher' ? 'Criar convite para professor' : 'Criar convite para responsável'
          }
          disabled={save.busy || !recipient.trim()}
          onPress={() =>
            void save.run<{ token: string }>(
              '/students/' + sid + '/invitations',
              { role, recipient_id: recipient },
              (result) => setToken(result.token),
            )
          }
        />
      ))}
      {!!token && (
        <Card>
          <Copy>Código do convite: {token}</Copy>
        </Card>
      )}
      <LoadState resource={result} />
      {result.data?.map((g) => (
        <Card key={g.id}>
          <Copy>
            {g.adult_id} · {g.role} · {g.active ? 'Ativo' : 'Revogado'}
          </Copy>
          {g.role !== 'owner' && g.active && (
            <>
              <Action
                secondary
                title={'Compartilhar informações restritas: ' + (g.can_view_care ? 'sim' : 'não')}
                selected={g.can_view_care}
                disabled={save.busy}
                onPress={() =>
                  void save.run(
                    '/students/' + sid + '/grants/' + g.id + '/care-permission',
                    { allowed: !g.can_view_care },
                    result.reload,
                  )
                }
              />
              <Action secondary title="Revogar vínculo" onPress={() => setConfirm(g.id)} />
            </>
          )}
          <Sheet visible={confirm === g.id} title="Revogar acesso?" close={() => setConfirm(null)}>
            <Notice text="Após confirmar, esta conta perderá acesso ao estudante e aos relatórios." />
            <Action
              title="Confirmar revogação"
              destructive
              icon={Users}
              disabled={save.busy}
              onPress={() =>
                void save.run(
                  '/students/' + sid + '/grants/' + g.id,
                  {},
                  async () => {
                    setConfirm(null);
                    await result.reload();
                  },
                  'DELETE',
                )
              }
            />
            <Action secondary title="Cancelar" onPress={() => setConfirm(null)} />
          </Sheet>
        </Card>
      ))}
      <SaveState command={save} />
    </Page>
  );
}
