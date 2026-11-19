import { View, Text } from 'react-native';
import {
  Sparkles,
  BookOpen,
  Users,
  FileChartColumn,
  Plus,
  School,
  Route,
} from 'lucide-react-native';
import { Page, Card, Copy, Action } from '@/shared/ui';
import { Mascot, MenuRow, SectionTitle, Badge } from '@/shared/ui/learning';
import { ScreenTitle, ShortcutGrid, Metrics } from '@/shared/ui/presentation';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { useWorkspace } from '@/app/Workspace';
import type { ScreenProps } from '@/app/routes';
import type { Lesson, Paged } from '@/features/lessons/types';
import type { Student } from '@/shared/contracts';
import { ContextPicker, contextQuery } from './ContextPicker';

type Context = {
  summary: { students: number; completed_tasks: number; pending_assessments: number };
  students: Student[];
  classrooms: { id: string; name: string }[];
  schools: { id: string; access_role: string; can_manage?: boolean }[];
};
export function TeacherHome({ navigation }: ScreenProps<'Home'>) {
  const { colors, preferences } = useTheme();
  const { value, update } = useWorkspace();
  const me = useResource<{ display_name: string }>('/me');
  const data = useResource<Context>('/teaching/context' + contextQuery(value) + '&limit=3');
  const lessons = useResource<Paged<Lesson>>('/lessons?scope=mine&limit=3');
  const selectedSchool = data.data?.schools.find((s) => s.id === value.schoolId);
  const manager =
    selectedSchool?.access_role === 'manager' ||
    (!value.schoolId && data.data?.schools.some((s) => s.access_role === 'manager'));
  return (
    <Page>
      <ScreenTitle
        title={'Olá, ' + (me.data?.display_name.split(' ')[0] || 'professor') + '.'}
        subtitle={manager ? 'Sua escola, cada vez mais perto.' : 'O que vamos ensinar hoje?'}
      />
      <View style={{ backgroundColor: colors.hero, borderRadius: 28, padding: 24, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text
              style={{
                fontFamily: tokens.fontHeading,
                color: colors.onHero,
                fontSize: 25 * preferences.font_scale,
                lineHeight: 33 * preferences.font_scale,
              }}
            >
              {manager ? 'Uma escola. Muitas descobertas.' : 'Uma boa aula abre novos caminhos.'}
            </Text>
            <Text
              style={{
                fontFamily: tokens.fontFamily,
                color: colors.heroMuted,
                fontSize: 14 * preferences.font_scale,
                lineHeight: 22 * preferences.font_scale,
              }}
            >
              {manager
                ? 'Organize turmas, equipe e acompanhamento.'
                : 'Monte sua próxima aula ou continue uma que já começou.'}
            </Text>
          </View>
          <Mascot size={84} />
        </View>
        <Action
          secondary
          icon={manager ? School : Plus}
          title={manager ? 'Organizar escola' : 'Criar uma aula'}
          onPress={() => navigation.navigate(manager ? 'Schools' : 'LessonBuilder')}
        />
      </View>
      <ShortcutGrid
        columns={4}
        items={[
          {
            title: 'Minhas aulas',
            detail: 'Criar, compartilhar e atribuir',
            icon: BookOpen,
            onPress: () => navigation.navigate('LessonLibrary'),
          },
          {
            title: 'Estudantes',
            detail: 'Jornadas e próximos passos',
            icon: Users,
            onPress: () => navigation.navigate('Children'),
          },
          {
            title: 'Escolas e turmas',
            detail: 'Seus grupos e sua equipe',
            icon: School,
            onPress: () => navigation.navigate('Schools'),
          },
          {
            title: 'Relatórios',
            detail: 'Registros que fazem sentido',
            icon: FileChartColumn,
            onPress: () => navigation.navigate('Reports'),
          },
        ]}
      />
      <SectionTitle title="Seu acompanhamento" />
      <ContextPicker />
      <LoadState resource={data} />
      {data.data && !!value.classroomId && (
        <Metrics
          items={[
            { value: data.data.summary.students, label: 'Estudantes vinculados' },
            { value: data.data.summary.completed_tasks, label: 'Tarefas concluídas' },
            { value: data.data.summary.pending_assessments, label: 'Avaliações a registrar' },
          ]}
        />
      )}
      {data.data?.students.map((student) => (
        <MenuRow
          key={student.id}
          icon={Users}
          title={student.name}
          detail={
            student.next_step === 'assessment'
              ? 'Registrar ponto de partida'
              : 'Continuar acompanhamento'
          }
          onPress={() => {
            update({ studentId: student.id });
            navigation.navigate('Student', { student });
          }}
        />
      ))}
      {data.data?.students.length === 0 && (
        <Card>
          <Copy heading>{value.classroomId ? 'Sua turma começa aqui' : 'Escolha um contexto'}</Copy>
          <Copy muted>
            {value.classroomId
              ? 'Adicione um estudante ou aceite um vínculo para acompanhar.'
              : 'Selecione a escola e a turma para consultar os registros. Seus estudantes também estão na aba Estudantes.'}
          </Copy>
          <Action
            secondary
            title="Adicionar estudante"
            onPress={() => navigation.navigate('Children')}
          />
        </Card>
      )}
      <SectionTitle title="Continue criando" />
      <LoadState resource={lessons} />
      {lessons.data?.items.map((lesson) => (
        <MenuRow
          key={lesson.id}
          icon={BookOpen}
          title={lesson.title}
          detail={
            (lesson.status === 'draft'
              ? 'Rascunho'
              : lesson.status === 'synthetic'
                ? 'Demonstração'
                : 'Publicada') +
            ' · ' +
            lesson.screen_count +
            ' telas'
          }
          onPress={() => navigation.navigate('LessonBuilder', { lessonId: lesson.id })}
        />
      ))}
      {lessons.data?.items.length === 0 && <Copy muted>Suas aulas salvas aparecerão aqui.</Copy>}
      <MenuRow
        icon={Route}
        title="Explorar trilhas"
        detail="Percursos prontos para organizar as aulas"
        onPress={() => navigation.navigate('Trails')}
      />
      <Card>
        <Badge text="MÓDULO OPCIONAL · INTELIGÊNCIA ARTIFICIAL" />
        <Copy heading>Mais tempo para ensinar.</Copy>
        <Copy muted>
          Criação assistida de aulas e análise de evidências, sempre com revisão do professor.
        </Copy>
        <Action
          secondary
          icon={Sparkles}
          title="Conhecer os recursos de IA"
          onPress={() => navigation.navigate('AIHub')}
        />
      </Card>
    </Page>
  );
}
