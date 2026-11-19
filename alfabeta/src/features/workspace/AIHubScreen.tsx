import { useState } from 'react';
import { Sparkles, BookOpen, Search, Users } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { Badge, MenuRow } from '@/shared/ui/learning';
import { ScreenTitle } from '@/shared/ui/presentation';
import { Sheet } from '@/shared/ui/Sheet';
import { useResource } from '@/shared/data/hooks';
import { usePaged, useDebounced } from '@/shared/data/paged';
import { useWorkspace } from '@/app/Workspace';
import type { Student } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
import { useTheme } from '@/shared/theme/ThemeProvider';
export function AIHubScreen({ navigation }: ScreenProps<'AIHub'>) {
  const { profession, update } = useWorkspace();
  const { colors } = useTheme();
  const health = useResource<{ ai: string }>('/health/ready');
  const [pick, setPick] = useState(false);
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const students = usePaged<Student>(pick ? '/students-page?q=' + encodeURIComponent(query) : null);
  return (
    <Page>
      <Badge text="MÓDULO OPCIONAL PARA A ESCOLA" />
      <ScreenTitle
        title="Mais tempo para ensinar."
        subtitle="Inteligência artificial a serviço do olhar de quem acompanha."
      />
      {health.data?.ai === 'not_configured' && (
        <Notice text="O serviço de IA ainda não está ativado neste ambiente. Aulas, atividades e relatórios continuam funcionando. Você pode conhecer os recursos e consultar resultados anteriores identificados." />
      )}
      {profession === 'teacher' && (
        <Card>
          <BookOpen size={26} color={colors.primary} />
          <Copy heading>Uma ideia vira uma aula</Copy>
          <Copy muted>
            Informe o objetivo e o nível pretendido. Receba uma proposta para revisar, editar e
            transformar em atividade.
          </Copy>
          <Action
            secondary
            icon={Sparkles}
            title="Criar aula com IA"
            onPress={() => navigation.navigate('LessonAI')}
          />
        </Card>
      )}
      <Card>
        <Search size={26} color={colors.primary} />
        <Copy heading>Um olhar sobre as evidências</Copy>
        <Copy muted>
          Reúna os registros de um estudante para consultar sugestões e recomendações. O professor
          mantém a decisão pedagógica.
        </Copy>
        <Action
          secondary
          icon={Users}
          title="Escolher estudante para análise"
          onPress={() => setPick(true)}
        />
      </Card>
      <Copy muted size="caption">
        A IA pode errar e não faz diagnóstico. As sugestões precisam de revisão; nenhuma análise
        confirma nível ou publica conteúdo automaticamente.
      </Copy>
      <Sheet
        visible={pick}
        title="De quem vamos acompanhar os registros?"
        close={() => setPick(false)}
      >
        <Field label="Buscar estudante" value={search} onChangeText={setSearch} maxLength={120} />
        {students.items.map((student) => (
          <MenuRow
            key={student.id}
            icon={Users}
            title={student.name}
            onPress={() => {
              update({ studentId: student.id });
              setPick(false);
              navigation.navigate('Analysis', { student });
            }}
          />
        ))}
        {students.loading && <Copy>Buscando estudantes…</Copy>}
        {!!students.error && <Notice error text={students.error} />}
        {!students.loading && !students.items.length && (
          <Copy>Nenhum estudante com vínculo ativo corresponde à busca.</Copy>
        )}
        {students.next != null && (
          <Action
            secondary
            title="Carregar mais"
            onPress={() => void students.more()}
            disabled={students.loading}
          />
        )}
      </Sheet>
    </Page>
  );
}
