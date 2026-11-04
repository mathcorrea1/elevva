import { useState } from 'react';
import { View, Pressable, FlatList, Platform } from 'react-native';
import { Plus, MoreHorizontal, ChevronRight } from 'lucide-react-native';
import { Copy, Action, Card, Field, Notice } from '@/shared/ui';
import { Eyebrow } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { IconAction } from '@/shared/ui/IconAction';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useCommand } from '@/shared/data/hooks';
import { usePaged, useDebounced } from '@/shared/data/paged';
import { SaveState } from '@/shared/ui/ResourceState';
import { useWorkspace } from '@/app/Workspace';
import { validOptionalDate } from '@/shared/dates';
import { Initial } from '@/features/workspace/Dashboards';
import { StudentProfile } from './StudentProfile';
import { CharacteristicsForm, emptyCharacteristics } from './Characteristics';
import type { Characteristics } from './Characteristics';
import type { Student } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
export function StudentRow({
  student,
  open,
  menu,
}: {
  student: Student;
  open: () => void;
  menu: () => void;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.surface,
        alignItems: 'center',
        gap: 4,
        paddingRight: 8,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Abrir jornada de ' + student.name}
        accessibilityHint="Acompanhamento, aulas e relatórios"
        onPress={open}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => ({
          flex: 1,
          padding: 14,
          minHeight: 86,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          borderWidth: 2,
          borderRadius: 18,
          borderColor: focused ? colors.focus : 'transparent',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Initial name={student.name} size={44} />
        <View style={{ flex: 1 }}>
          <Copy>{student.name}</Copy>
          <Copy muted size="caption">
            {student.next_step === 'assessment'
              ? 'Avaliação inicial pendente'
              : 'Acompanhamento disponível'}
          </Copy>
        </View>
        <ChevronRight
          size={18}
          color={colors.secondary}
          accessible={Platform.OS === 'web' ? undefined : false}
          aria-hidden
        />
      </Pressable>
      <IconAction label={'Mais ações para ' + student.name} icon={MoreHorizontal} onPress={menu} />
    </View>
  );
}
export function ManagementScreen({ navigation }: ScreenProps<'Children'>) {
  const { colors } = useTheme();
  const { profession, update, value: context } = useWorkspace();
  const save = useCommand();
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const data = usePaged<Student>(
    '/students-page?q=' +
      encodeURIComponent(query) +
      (profession === 'teacher' && context.classroomId
        ? '&classroom_id=' + encodeURIComponent(context.classroomId)
        : ''),
  );
  const [adding, setAdding] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristics>(emptyCharacteristics);
  const [selected, setSelected] = useState<Student | null>(null);
  const [editing, setEditing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [token, setToken] = useState('');
  function open(s: Student) {
    update({ studentId: s.id });
    navigation.navigate('Student', { student: s });
  }
  function go(destination: 'Care' | 'Links') {
    if (selected) {
      const student = selected;
      setSelected(null);
      navigation.navigate(destination, { student });
    }
  }
  const valid = name.trim().length >= 2 && validOptionalDate(birth);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ width: '100%', maxWidth: 1040, alignSelf: 'center', padding: 20, gap: 14 }}>
        <Eyebrow>QUEM VOCÊ ACOMPANHA</Eyebrow>
        {profession === 'teacher' && !!context.classroomId && (
          <Action
            secondary
            quiet
            title="Mostrar estudantes de todos os meus vínculos"
            onPress={() => update({ classroomId: '', studentId: '' })}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Copy heading headingLevel={1} size="display">
            Estudantes
          </Copy>
          <Action
            icon={Plus}
            title="Adicionar"
            accessibilityLabel="Adicionar estudante"
            onPress={() => {
              setStep(0);
              setAdding(true);
            }}
          />
        </View>
        <Field
          label="Buscar estudante pelo nome"
          value={search}
          onChangeText={setSearch}
          maxLength={120}
        />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Copy muted size="caption">
            {data.total} estudantes · {data.items.length} exibidos
          </Copy>
          <Action secondary quiet title="Recebi um convite" onPress={() => setAccepting(true)} />
        </View>
      </View>
      <FlatList
        data={data.items}
        keyExtractor={(s) => s.id}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={5}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 0,
          gap: 10,
          width: '100%',
          maxWidth: 1040,
          alignSelf: 'center',
        }}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            open={() => open(item)}
            menu={() => {
              setSelected(item);
              setEditing(false);
            }}
          />
        )}
        ListEmptyComponent={
          data.loading ? (
            <Skeleton />
          ) : (
            <Card>
              <Copy heading>{search ? 'Nenhum resultado' : 'Sua primeira jornada'}</Copy>
              <Copy muted>
                {search
                  ? 'Experimente outro nome.'
                  : 'Adicione um estudante ou aceite um convite para começar.'}
              </Copy>
            </Card>
          )
        }
        ListFooterComponent={
          <View style={{ gap: 12, paddingVertical: 12 }}>
            {!!data.error && (
              <>
                <Notice error text={data.error} />
                <Action secondary title="Buscar novamente" onPress={() => void data.reload()} />
              </>
            )}
            {data.loading && !!data.items.length && <Skeleton />}
            {data.next !== null && (
              <Action
                secondary
                title="Carregar mais estudantes"
                disabled={data.loading}
                onPress={() => void data.more()}
              />
            )}
          </View>
        }
      />
      <Sheet
        visible={adding}
        title={step ? 'Apoios e informações opcionais' : 'Adicionar estudante'}
        close={() => setAdding(false)}
        footer={
          <Action
            title={save.busy ? 'Salvando estudante…' : 'Salvar estudante'}
            disabled={!valid || save.busy}
            onPress={() =>
              void save.run<Student>(
                '/students/register',
                {
                  name,
                  birth_date: birth || null,
                  supports: [],
                  characteristics,
                  classroom_id: profession === 'teacher' ? context.classroomId || null : null,
                },
                async () => {
                  setAdding(false);
                  setName('');
                  setBirth('');
                  setCharacteristics(emptyCharacteristics);
                  await data.reload();
                },
              )
            }
          />
        }
      >
        {profession === 'teacher' && !!context.classroomId && (
          <Copy muted>
            O estudante será cadastrado e matriculado na turma selecionada. Sua conta será gestora
            deste cadastro.
          </Copy>
        )}
        {step ? (
          <>
            <CharacteristicsForm value={characteristics} onChange={setCharacteristics} />
            <Action secondary title="Voltar aos dados básicos" onPress={() => setStep(0)} />
          </>
        ) : (
          <>
            <Copy muted>
              Comece pelos dados básicos. Adaptações são acessíveis sem informar diagnóstico.
            </Copy>
            <Field label="Nome do estudante" value={name} onChangeText={setName} maxLength={60} />
            <Field
              label="Nascimento (opcional, AAAA-MM-DD)"
              value={birth}
              onChangeText={setBirth}
              maxLength={10}
            />
            {birth && !validOptionalDate(birth) ? (
              <Notice error text="Informe uma data válida, por exemplo 2018-05-20." />
            ) : null}
            <Action
              secondary
              title="Informar necessidades e apoios (opcional)"
              onPress={() => setStep(1)}
            />
          </>
        )}
        <SaveState command={save} />
      </Sheet>
      <Sheet
        visible={!!selected}
        title={selected?.name || 'Estudante'}
        close={() => setSelected(null)}
      >
        {selected && (
          <>
            {editing ? (
              <StudentProfile
                student={selected}
                changed={async () => {
                  setSelected(null);
                  await data.reload();
                }}
              />
            ) : (
              <>
                <Action
                  title="Abrir acompanhamento"
                  onPress={() => {
                    const s = selected;
                    setSelected(null);
                    open(s);
                  }}
                />
                {profession === 'teacher' && (
                  <Action
                    secondary
                    title="Atribuir aula"
                    onPress={() => {
                      const id = selected.id;
                      setSelected(null);
                      navigation.navigate('LessonLibrary', { studentId: id });
                    }}
                  />
                )}
                {selected.role === 'owner' && (
                  <>
                    <Action secondary title="Editar cadastro" onPress={() => setEditing(true)} />
                    <Action
                      secondary
                      title="Necessidades, comunicação e apoios"
                      onPress={() => go('Care')}
                    />
                    <Action
                      secondary
                      title="Gerenciar vínculos e permissões"
                      onPress={() => go('Links')}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </Sheet>
      <Sheet
        visible={accepting}
        title="Aceitar convite de acompanhamento"
        close={() => setAccepting(false)}
      >
        <Field
          label="Código do convite"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
        />
        <Action
          title="Aceitar vínculo"
          disabled={!token || save.busy}
          onPress={() =>
            void save.run('/invitations/accept', { token }, async () => {
              setAccepting(false);
              setToken('');
              await data.reload();
            })
          }
        />
        <SaveState command={save} />
      </Sheet>
    </View>
  );
}
