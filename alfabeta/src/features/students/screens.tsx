import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  History,
  Sparkles,
  ClipboardList,
  MessageSquare,
  Users,
  Route,
  HeartHandshake,
  Pencil,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import type { Student, Report } from '@/shared/contracts';
import { useResource, useCommand } from '@/shared/data/hooks';
import { StudentProfile } from './StudentProfile';
import { AttentionCard } from './AttentionCard';
import { levelLabel } from '@/features/assessments/levels';
import type { ScreenProps as Props } from '@/app/routes';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { Sheet } from '@/shared/ui/Sheet';
import { Badge, MenuRow, Pills } from '@/shared/ui/learning';
import { ScreenTitle, ShortcutGrid, Metrics } from '@/shared/ui/presentation';

type Grant = {
  id: string;
  adult_id: string;
  display_name?: string;
  role: string;
  active: boolean;
  can_view_care: boolean;
};
export function StudentScreen({ route, navigation }: Props<'Student'>) {
  const initial = route.params.student;
  const resource = useResource<Student>('/students/' + initial.id);
  const report = useResource<Report>('/students/' + initial.id + '/report');
  const [tab, setTab] = useState('learn');
  const [edit, setEdit] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      void resource.reload();
      void report.reload();
    }, [resource.reload, report.reload]),
  );
  const student = resource.data;
  return (
    <Page>
      <LoadState resource={resource} />
      {!!student && (
        <>
          <ScreenTitle title={student.name} subtitle="Cada descoberta tem o seu tempo." />
          <Badge
            text={
              student.confirmed_level
                ? levelLabel(student.confirmed_level)
                : 'Ponto de partida em construção'
            }
          />
          <Pills
            value={tab}
            onChange={setTab}
            options={[
              { value: 'learn', label: 'Aprender' },
              { value: 'follow', label: 'Acompanhar' },
              { value: 'profile', label: 'Perfil' },
            ]}
          />
          {tab === 'learn' && (
            <>
              <Card>
                <Copy heading>
                  {student.next_step === 'assessment'
                    ? 'Vamos conhecer o ponto de partida?'
                    : 'Qual será a próxima descoberta?'}
                </Copy>
                <Copy muted>
                  {student.next_step === 'assessment'
                    ? 'Registre uma observação inicial antes de começar as atividades.'
                    : 'Abra a jornada para escolher uma trilha e continuar.'}
                </Copy>
                <Action
                  title={
                    student.next_step === 'assessment'
                      ? 'Registrar avaliação inicial'
                      : 'Continuar jornada'
                  }
                  onPress={() =>
                    navigation.navigate(
                      student.next_step === 'assessment' ? 'Assessment' : 'Trail',
                      { student },
                    )
                  }
                />
              </Card>
              <ShortcutGrid
                items={[
                  {
                    icon: BookOpen,
                    title: 'Aulas',
                    detail: 'Conteúdo e atividades do professor',
                    onPress: () => navigation.navigate('AssignedLessons', { student }),
                  },
                  {
                    icon: Route,
                    title: 'Trilhas',
                    detail: 'Um caminho por descoberta',
                    onPress: () => navigation.navigate('Trail', { student }),
                  },
                  {
                    icon: ClipboardList,
                    title: 'Avaliação',
                    detail: 'Registrar evidências iniciais',
                    onPress: () => navigation.navigate('Assessment', { student }),
                  },
                  {
                    icon: MessageSquare,
                    title: 'Observação',
                    detail: 'O que o adulto acompanhou',
                    onPress: () => navigation.navigate('Observation', { student }),
                  },
                ]}
              />
            </>
          )}
          {tab === 'follow' && (
            <>
              <LoadState resource={report} />
              {!!report.data && (
                <Metrics
                  items={[
                    { value: report.data.completed_tasks, label: 'Tarefas concluídas' },
                    { value: report.data.assessments, label: 'Avaliações' },
                    { value: report.data.observations, label: 'Observações' },
                  ]}
                />
              )}
              <ShortcutGrid
                items={[
                  {
                    icon: FileText,
                    title: 'Relatório',
                    detail: 'Resultados e evidências',
                    onPress: () => navigation.navigate('Report', { student }),
                  },
                  {
                    icon: History,
                    title: 'Histórico',
                    detail: 'Cada registro, com sua origem',
                    onPress: () => navigation.navigate('History', { student }),
                  },
                ]}
              />
              <MenuRow
                icon={BookOpen}
                title="Orientações do professor"
                detail="Apoios registrados para a jornada"
                onPress={() => navigation.navigate('Guidance', { student })}
              />
              <MenuRow
                icon={Sparkles}
                title="Análise assistida por IA"
                detail="Módulo opcional · revisão humana"
                onPress={() => navigation.navigate('Analysis', { student })}
              />
              <AttentionCard studentId={student.id} />
            </>
          )}
          {tab === 'profile' && (
            <>
              <MenuRow
                icon={HeartHandshake}
                title="Comunicação e apoios"
                detail="Adaptações e preferências do estudante"
                onPress={() => navigation.navigate('Care', { student })}
              />
              {student.role === 'owner' ? (
                <>
                  <MenuRow
                    icon={Pencil}
                    title="Editar cadastro"
                    detail="Nome, nascimento e apoios gerais"
                    onPress={() => setEdit(true)}
                  />
                  <MenuRow
                    icon={Users}
                    title="Adultos autorizados"
                    detail="Convites e permissões de acompanhamento"
                    onPress={() => navigation.navigate('Links', { student })}
                  />
                </>
              ) : (
                <Copy muted>
                  O adulto gestor do cadastro organiza os vínculos e os dados básicos.
                </Copy>
              )}
            </>
          )}
          <Sheet visible={edit} title={'Cadastro de ' + student.name} close={() => setEdit(false)}>
            <StudentProfile
              startEditing
              student={student}
              changed={async () => {
                await resource.reload();
                setEdit(false);
              }}
            />
          </Sheet>
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
            {g.display_name || 'Adulto autorizado'} ·{' '}
            {g.role === 'owner'
              ? 'Gestor do cadastro'
              : g.role === 'teacher'
                ? 'Professor'
                : 'Responsável'}{' '}
            · {g.active ? 'Ativo' : 'Revogado'}
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
