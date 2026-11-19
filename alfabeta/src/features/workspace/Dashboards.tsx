import { TeacherHome } from './TeacherHome';
import { SchoolTeam } from './SchoolTeam';
import { useState, useEffect } from 'react';
import { useDebounced } from '@/shared/data/paged';
import type { PageResult } from '@/shared/data/paged';
import { View, Text, Keyboard } from 'react-native';
import { BookOpen, FileChartColumn, School, Sparkles, Users, Route } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { Eyebrow, Mascot, MenuRow, SectionTitle } from '@/shared/ui/learning';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import type { Student } from '@/shared/contracts';
import { levelLabel } from '@/features/assessments/levels';
import type { ScreenProps } from '@/app/routes';
import { useWorkspace } from '@/app/Workspace';
import { ContextPicker, contextQuery, type School as SchoolType, type Room } from './ContextPicker';
import React from 'react';
type TeachingContext = {
  schools: SchoolType[];
  classrooms: Room[];
  students: (Student & {
    completed_tasks: number;
    assigned_tasks: number;
    assessments: number;
    observations: number;
    pending_followups: number;
  })[];
  summary: {
    students: number;
    pending_assessments: number;
    completed_tasks: number;
    pending_tasks: number;
    pending_followups: number;
  };
  note: string;
  pagination: { total: number; offset: number; next_offset: number | null };
};

function Greeting() {
  const me = useResource<{ display_name: string }>('/me');
  const { profession } = useWorkspace();
  return (
    <View style={{ gap: 6 }}>
      <Eyebrow>
        {profession === 'teacher' ? 'SEU ESPAÇO DE ENSINAR' : 'JUNTOS EM CADA DESCOBERTA'}
      </Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Olá, {me.data?.display_name.split(' ')[0] || 'vamos começar'}.
      </Copy>
    </View>
  );
}
function AIFloat({ open }: { open: () => void }) {
  const [keyboard, setKeyboard] = useState(false);
  React.useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  if (keyboard) return null;
  return (
    <View
      style={{
        minHeight: 76,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <Action icon={Sparkles} title="Apoio com IA" onPress={open} />
    </View>
  );
}
function ChildSummary({
  student,
  open,
  report,
  trail,
}: {
  student: Student;
  open: () => void;
  report: () => void;
  trail: () => void;
}) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Initial name={student.name} />
        <View style={{ flex: 1 }}>
          <Copy heading>{student.name}</Copy>
          <Copy muted>
            {student.next_step === 'assessment'
              ? 'Vamos conhecer o ponto de partida'
              : 'Uma descoberta por vez'}
          </Copy>
        </View>
      </View>
      <Copy muted>
        {levelLabel(student.confirmed_level)}
        {typeof student.completed_tasks === 'number'
          ? ' · ' + student.completed_tasks + ' tarefas concluídas'
          : ''}
      </Copy>
      <Action
        title={
          student.next_step === 'assessment' ? 'Registrar avaliação inicial' : 'Continuar jornada'
        }
        onPress={student.next_step === 'assessment' ? open : trail}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flexGrow: 1 }}>
          <Action secondary title="Acompanhar" onPress={open} />
        </View>
        <View style={{ flexGrow: 1 }}>
          <Action quiet title="Ver relatório" onPress={report} />
        </View>
      </View>
    </Card>
  );
}
export function Initial({ name, size = 52 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{ color: colors.primary, fontFamily: tokens.fontHeading, fontSize: size * 0.36 }}
      >
        {name
          .split('·')[0]
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0])
          .join('')}
      </Text>
    </View>
  );
}
export function DashboardScreen(props: ScreenProps<'Home'>) {
  const { profession } = useWorkspace();
  return profession === 'teacher' ? (
    <TeacherDashboard {...props} />
  ) : (
    <GuardianDashboard {...props} />
  );
}
function GuardianDashboard({ navigation }: ScreenProps<'Home'>) {
  const { colors, preferences } = useTheme();
  const children = useResource<PageResult<Student>>('/students-page?limit=6');
  const { update } = useWorkspace();
  function go(student: Student, destination: 'Student' | 'Trail' | 'Report') {
    update({ studentId: student.id });
    navigation.navigate(destination, { student });
  }
  return (
    <View style={{ flex: 1 }}>
      <Page>
        <Greeting />
        <View style={{ backgroundColor: colors.hero, borderRadius: 28, padding: 24, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, gap: 10 }}>
              <Text
                style={{
                  fontFamily: tokens.fontHeading,
                  color: colors.onHero,
                  fontSize: 24 * preferences.font_scale,
                  lineHeight: 32 * preferences.font_scale,
                }}
              >
                Uma descoberta{'\n'}por vez.
              </Text>
              <Text
                style={{
                  fontFamily: tokens.fontFamily,
                  color: colors.heroMuted,
                  fontSize: 13 * preferences.font_scale,
                  lineHeight: 21 * preferences.font_scale,
                }}
              >
                A Lumi acompanha vocês, no seu ritmo.
              </Text>
            </View>
            <Mascot size={100} />
          </View>
        </View>
        <SectionTitle
          title="Por onde vamos continuar?"
          detail="Próximos passos dos estudantes que você acompanha."
        />
        <LoadState resource={children} />
        {children.data?.items.length === 0 && (
          <Card>
            <Copy heading>Sua primeira jornada</Copy>
            <Copy muted>Cadastre um estudante ou aceite um convite para começar.</Copy>
            <Action
              title="Adicionar estudante"
              onPress={() => navigation.getParent()?.navigate('Estudantes')}
            />
          </Card>
        )}
        {children.data?.items.map((student) => (
          <ChildSummary
            key={student.id}
            student={student}
            open={() => go(student, 'Student')}
            trail={() => go(student, 'Trail')}
            report={() => go(student, 'Report')}
          />
        ))}
        {!!children.data && children.data.total > children.data.items.length && (
          <Action
            secondary
            title="Ver todos os estudantes"
            onPress={() => navigation.navigate('Children')}
          />
        )}
        <MenuRow
          icon={BookOpen}
          title="Ideias e orientações"
          detail="Apoios gerais para acompanhar a aprendizagem"
          onPress={() => navigation.navigate('Library')}
        />
      </Page>
      <AIFloat open={() => navigation.navigate('AIHub')} />
    </View>
  );
}
function TeacherDashboard(props: ScreenProps<'Home'>) {
  return <TeacherHome {...props} />;
}
export function SchoolsScreen({ navigation }: ScreenProps<'Schools'>) {
  const { value, update } = useWorkspace();
  const memberships = useResource<SchoolType[]>('/schools');
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(0), [value.classroomId, query]);
  const context = useResource<TeachingContext>(
    '/teaching/context' + contextQuery(value, query) + '&offset=' + offset,
  );
  return (
    <Page>
      <Eyebrow>ESCOLAS · TURMAS · ESTUDANTES</Eyebrow>
      <Action
        secondary
        icon={Users}
        title="Gerenciar e adicionar estudantes"
        onPress={() => navigation.navigate('Children')}
      />
      <Copy heading headingLevel={1} size="display">
        Cada turma,{'\n'}um universo.
      </Copy>
      <ContextPicker />
      {!!value.schoolId &&
        memberships.data?.some((s) => s.id === value.schoolId && s.can_manage) && (
          <SchoolTeam key={value.schoolId} schoolId={value.schoolId} />
        )}
      <LoadState resource={context} />
      {!value.schoolId && (
        <>
          <SectionTitle title="Suas escolas" />
          {context.data?.schools.map((s) => (
            <MenuRow
              icon={School}
              title={s.name}
              detail="Ver turmas desta escola"
              key={s.id}
              onPress={() => update({ schoolId: s.id, classroomId: '', studentId: '' })}
            />
          ))}
        </>
      )}
      {!!value.schoolId && !value.classroomId && (
        <>
          <SectionTitle title="Turmas desta escola" />
          {context.data?.classrooms.map((r) => (
            <MenuRow
              key={r.id}
              icon={Users}
              title={r.name}
              detail="Ver estudantes autorizados"
              onPress={() => update({ classroomId: r.id, studentId: '' })}
            />
          ))}
        </>
      )}
      {!!value.classroomId && (
        <>
          <Field label="Buscar estudante nesta turma" value={search} onChangeText={setSearch} />
          <SectionTitle title="Estudantes" detail={context.data?.note} />
          {context.data?.students.map((s) => (
            <MenuRow
              key={s.id}
              icon={Users}
              title={s.name}
              detail={
                s.next_step === 'assessment'
                  ? 'Avaliação inicial pendente'
                  : 'Abrir acompanhamento individual'
              }
              onPress={() => {
                update({ studentId: s.id });
                navigation.navigate('Student', { student: s });
              }}
            />
          ))}
          {context.data?.students.length === 0 && (
            <Notice text="Nenhum estudante corresponde à busca ou possui vínculo ativo nesta turma." />
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Action
              secondary
              title="Página anterior de estudantes"
              disabled={!offset}
              onPress={() => setOffset(Math.max(0, offset - 20))}
            />
            <Action
              secondary
              title="Próxima página de estudantes"
              disabled={context.data?.pagination.next_offset == null}
              onPress={() => setOffset(context.data!.pagination.next_offset!)}
            />
          </View>
          <Action
            secondary
            icon={FileChartColumn}
            title="Relatório coletivo"
            onPress={() =>
              navigation.navigate('Collective', {
                classroomId: value.classroomId,
                title:
                  context.data?.classrooms.find((r) => r.id === value.classroomId)?.name || 'Turma',
              })
            }
          />
        </>
      )}
      <MenuRow
        icon={School}
        title="Gerenciar escolas e matrículas"
        detail="Criar escola, turma e matricular estudantes vinculados"
        onPress={() => navigation.navigate('ClassroomManagement')}
      />
    </Page>
  );
}
export function StudentHub({
  navigation,
  kind,
}: {
  navigation: Pick<ScreenProps<'Trails'>['navigation'], 'navigate'>;
  kind: 'Trail' | 'Report' | 'Analysis';
}) {
  const { value, profession, update } = useWorkspace();
  const students = useResource<Student[]>(profession === 'guardian' ? '/students' : null);
  const context = useResource<TeachingContext>(
    profession === 'teacher' ? '/teaching/context' + contextQuery(value) : null,
  );
  const health = useResource<{ ai: string }>(kind === 'Analysis' ? '/health/ready' : null);
  const visible = profession === 'teacher' ? context.data?.students : students.data;
  return (
    <Page>
      <Eyebrow>
        {kind === 'Trail'
          ? 'CAMINHOS DE DESCOBERTA'
          : kind === 'Report'
            ? 'ACOMPANHAR COM CLAREZA'
            : 'INTELIGÊNCIA A SERVIÇO DO CUIDADO'}
      </Eyebrow>
      <Copy heading headingLevel={1} size="display">
        {kind === 'Trail' ? 'Trilhas' : kind === 'Report' ? 'Relatórios' : 'Apoio com IA'}
      </Copy>
      <Copy muted>
        {kind === 'Analysis'
          ? 'Analise evidências, consulte recomendações e revise resultados. A IA apoia o adulto e não confirma níveis.'
          : 'Escolha quem você quer acompanhar.'}
      </Copy>
      {profession === 'teacher' && <ContextPicker />}
      {kind === 'Analysis' && health.data?.ai === 'not_configured' && (
        <Notice text="A análise nova está indisponível neste ambiente. Você ainda pode consultar o último resultado e continuar registrando atividades." />
      )}
      {profession === 'teacher' && !value.classroomId && (
        <Notice text="Selecione uma escola e uma turma para abrir os acompanhamentos deste contexto." />
      )}
      <LoadState resource={profession === 'teacher' ? context : students} />
      {kind === 'Report' && profession === 'teacher' && !!value.classroomId && (
        <MenuRow
          icon={FileChartColumn}
          title="Visão coletiva da turma"
          detail="Contagens e evolução por período"
          onPress={() =>
            navigation.navigate('Collective', {
              classroomId: value.classroomId,
              title:
                context.data?.classrooms.find((r) => r.id === value.classroomId)?.name || 'Turma',
            })
          }
        />
      )}
      {visible?.map((s) => (
        <MenuRow
          key={s.id}
          icon={kind === 'Trail' ? Route : kind === 'Report' ? FileChartColumn : Sparkles}
          title={s.name}
          detail={
            s.id === value.studentId
              ? 'Último acompanhamento selecionado'
              : 'Abrir jornada individual'
          }
          onPress={() => {
            update({ studentId: s.id });
            navigation.navigate(kind, { student: s });
          }}
        />
      ))}
      {visible?.length === 0 && (
        <Notice text="Ainda não há estudantes com vínculo ativo neste contexto. Cadastre ou aceite um convite em Estudantes ou Escolas." />
      )}
      {kind === 'Analysis' && (
        <Card>
          <Copy heading>O que você pode fazer aqui</Copy>
          <Copy>
            Gerar análise sobre registros salvos, consultar o último resultado e revisar
            recomendações antes de utilizá-las.
          </Copy>
          <Copy muted>
            A indisponibilidade da IA não interrompe os demais registros. Exemplos sintéticos são
            identificados como pré-gerados e não comprovam uma chamada ao serviço.
          </Copy>
        </Card>
      )}
    </Page>
  );
}
export const TrailsHub = (p: ScreenProps<'Trails'>) => (
  <StudentHub navigation={p.navigation} kind="Trail" />
);
export const ReportsHub = (p: ScreenProps<'Reports'>) => (
  <StudentHub navigation={p.navigation} kind="Report" />
);
export const AIHub = (p: ScreenProps<'AIHub'>) => (
  <StudentHub navigation={p.navigation} kind="Analysis" />
);
