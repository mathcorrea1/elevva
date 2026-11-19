import { View, Text } from 'react-native';
import { BookOpen, Users, Route, Plus } from 'lucide-react-native';
import { Page, Card, Copy, Action } from '@/shared/ui';
import { Mascot, MenuRow, SectionTitle } from '@/shared/ui/learning';
import { ScreenTitle } from '@/shared/ui/presentation';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import type { PageResult } from '@/shared/data/paged';
import type { Student } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
import { useWorkspace } from '@/app/Workspace';
import { TeacherHome } from './TeacherHome';
import { SchoolWorkspace } from './SchoolWorkspace';
export { AIHubScreen as AIHub } from './AIHubScreen';

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
  return profession === 'teacher' ? <TeacherHome {...props} /> : <GuardianHome {...props} />;
}
function GuardianHome({ navigation }: ScreenProps<'Home'>) {
  const { colors, preferences } = useTheme();
  const { update } = useWorkspace();
  const me = useResource<{ display_name: string }>('/me');
  const students = useResource<PageResult<Student>>('/students-page?limit=4');
  return (
    <Page>
      <ScreenTitle
        title={'Olá, ' + (me.data?.display_name.split(' ')[0] || 'vamos aprender') + '.'}
        subtitle="Juntos em cada descoberta."
      />
      <View style={{ backgroundColor: colors.hero, borderRadius: 28, padding: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text
              style={{
                color: colors.onHero,
                fontFamily: tokens.fontHeading,
                fontSize: 25 * preferences.font_scale,
                lineHeight: 33 * preferences.font_scale,
              }}
            >
              Um novo caminho para aprender.
            </Text>
            <Text
              style={{
                color: colors.heroMuted,
                fontFamily: tokens.fontFamily,
                fontSize: 14 * preferences.font_scale,
                lineHeight: 22 * preferences.font_scale,
              }}
            >
              A Lumi acompanha vocês, uma descoberta por vez.
            </Text>
          </View>
          <Mascot size={84} />
        </View>
        <Action
          secondary
          icon={Route}
          title="Explorar trilhas"
          onPress={() => navigation.navigate('Trails')}
        />
      </View>
      <SectionTitle title="Quem vamos acompanhar?" />
      <LoadState resource={students} />
      {students.data?.items.map((student) => (
        <MenuRow
          key={student.id}
          icon={Users}
          title={student.name}
          detail={
            student.next_step === 'assessment'
              ? 'Conhecer o ponto de partida'
              : (student.completed_tasks || 0) + ' tarefas concluídas · abrir jornada'
          }
          onPress={() => {
            update({ studentId: student.id });
            navigation.navigate('Student', { student });
          }}
        />
      ))}
      {students.data?.items.length === 0 && (
        <Card>
          <Copy heading>Sua primeira jornada</Copy>
          <Copy muted>Adicione um estudante ou aceite um convite para começar.</Copy>
          <Action
            icon={Plus}
            title="Adicionar estudante"
            onPress={() => navigation.navigate('Children')}
          />
        </Card>
      )}
      {!!students.data && students.data.total > students.data.items.length && (
        <Action
          secondary
          title="Ver todos os estudantes"
          onPress={() => navigation.navigate('Children')}
        />
      )}
      <MenuRow
        icon={BookOpen}
        title="Ideias e orientações"
        detail="Conteúdos para acompanhar a aprendizagem"
        onPress={() => navigation.navigate('Library')}
      />
    </Page>
  );
}
export function SchoolsScreen({ navigation }: ScreenProps<'Schools'>) {
  return <SchoolWorkspace navigation={navigation} />;
}
