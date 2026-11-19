import { View, Text } from 'react-native';
import {
  Sparkles,
  BookOpen,
  Users,
  FileChartColumn,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { Page, Card, Copy, Action } from '@/shared/ui';
import { Eyebrow, Mascot, Stat, MenuRow, SectionTitle } from '@/shared/ui/learning';
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
  schools: { id: string; access_role: string }[];
};
export function TeacherHome({ navigation }: ScreenProps<'Home'>) {
  const { colors, preferences } = useTheme();
  const { value, update } = useWorkspace();
  const me = useResource<{ display_name: string }>('/me');
  const data = useResource<Context>('/teaching/context' + contextQuery(value) + '&limit=4');
  const lessons = useResource<Paged<Lesson>>('/lessons?scope=mine&limit=3');
  const manager =
    data.data?.schools.find((s) => s.id === value.schoolId)?.access_role === 'manager';
  return (
    <Page>
      <Eyebrow>{manager ? 'SEU ESPAÇO DE GESTÃO' : 'SEU ESPAÇO DE ENSINAR'}</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Olá, {me.data?.display_name.split(' ')[0] || 'professor'}.
      </Copy>
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
              {manager
                ? 'Uma escola, muitas descobertas.'
                : 'Sua próxima aula começa com uma ideia.'}
            </Text>
            <Text
              style={{
                fontFamily: tokens.fontFamily,
                color: colors.heroMuted,
                fontSize: 13 * preferences.font_scale,
                lineHeight: 21 * preferences.font_scale,
              }}
            >
              {manager
                ? 'Organize a equipe e acompanhe os contextos autorizados.'
                : 'Crie com a Lumi, revise e leve novas descobertas à turma.'}
            </Text>
          </View>
          <Mascot size={76} />
        </View>
        <Action
          icon={manager ? Users : Sparkles}
          title={manager ? 'Gerenciar escola e equipe' : 'Criar aula com IA'}
          onPress={() => navigation.navigate(manager ? 'Schools' : 'LessonAI')}
        />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {manager && (
          <Action
            icon={Sparkles}
            title="Criar aula com IA"
            onPress={() => navigation.navigate('LessonAI')}
          />
        )}
        <View style={{ flexGrow: 1 }}>
          <Action
            secondary
            icon={Plus}
            title="Criar manualmente"
            onPress={() => navigation.navigate('LessonBuilder')}
          />
        </View>
        <View style={{ flexGrow: 1 }}>
          <Action
            secondary
            icon={BookOpen}
            title="Minhas aulas"
            onPress={() => navigation.navigate('LessonLibrary')}
          />
        </View>
      </View>
      <SectionTitle title="Sua turma, de perto" />
      <ContextPicker />
      <LoadState resource={data} />
      {value.classroomId && data.data ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Stat value={data.data.summary.students} label="Estudantes vinculados" />
            <Stat value={data.data.summary.completed_tasks} label="Tarefas concluídas" />
            <Stat value={data.data.summary.pending_assessments} label="Avaliações a registrar" />
          </View>
          <MenuRow
            icon={Users}
            title="Gerenciar estudantes"
            detail="Cadastros, apoios e vínculos"
            onPress={() => navigation.navigate('Children')}
          />
          {data.data.students.map((student) => (
            <MenuRow
              key={student.id}
              icon={ChevronRight}
              title={student.name}
              detail={
                student.next_step === 'assessment'
                  ? 'Avaliação inicial pendente'
                  : 'Ver acompanhamento'
              }
              onPress={() => {
                update({ studentId: student.id });
                navigation.navigate('Student', { student });
              }}
            />
          ))}
          <MenuRow
            icon={FileChartColumn}
            title="Abrir panorama"
            detail="Registros e próximos passos"
            onPress={() => navigation.navigate('Reports')}
          />
        </>
      ) : (
        <Card>
          <Copy heading>Encontre sua turma</Copy>
          <Copy muted>Selecione uma escola ou organize seu primeiro grupo.</Copy>
          <Action
            secondary
            title="Escolas e turmas"
            onPress={() => navigation.navigate('Schools')}
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
        icon={BookOpen}
        title="Atividades e orientações"
        detail="Sua biblioteca pedagógica"
        onPress={() => navigation.navigate('Library')}
      />
    </Page>
  );
}
