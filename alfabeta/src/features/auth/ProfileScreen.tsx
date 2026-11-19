import { useState } from 'react';
import { View, Share, Platform } from 'react-native';
import {
  Settings,
  Pencil,
  CircleHelp,
  BookOpen,
  LogOut,
  Fingerprint,
  School,
  Sparkles,
} from 'lucide-react-native';
import { useResource } from '@/shared/data/hooks';
import { useWorkspace } from '@/app/Workspace';
import { Page, Card, Copy, Action, Notice } from '@/shared/ui';
import { MenuRow, Badge } from '@/shared/ui/learning';
import { ScreenTitle, ShortcutGrid } from '@/shared/ui/presentation';
import { Sheet } from '@/shared/ui/Sheet';
import { Initial } from '@/features/workspace/Dashboards';
import { LoadState } from '@/shared/ui/ResourceState';
import { ProfileCard } from './ProfileCard';
import type { ScreenProps } from '@/app/routes';
export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  const { logout, profession, profileChanged } = useWorkspace();
  const data = useResource<{ id: string; display_name: string; profession: string }>('/me');
  const schools = useResource<{ can_manage: boolean }[]>(
    profession === 'teacher' ? '/schools' : null,
  );
  const [edit, setEdit] = useState(false);
  const [help, setHelp] = useState(false);
  const [invites, setInvites] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  async function shareIdentifier() {
    if (!data.data?.id) return;
    setShareStatus('');
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(data.data.id);
        setShareStatus('Identificador copiado.');
      } else {
        await Share.share({ message: data.data.id, title: 'Meu identificador no Eleva' });
      }
    } catch {
      setShareStatus('Não foi possível compartilhar. O identificador continua disponível acima.');
    }
  }
  return (
    <Page>
      <ScreenTitle title="Seu perfil" subtitle="Sua conta e o seu jeito de aprender juntos." />
      <LoadState resource={data} />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Initial name={data.data?.display_name || 'E'} size={64} />
          <View style={{ flex: 1, gap: 8 }}>
            <Copy heading>{data.data?.display_name || 'Sua conta'}</Copy>
            <Badge
              text={
                profession === 'teacher'
                  ? schools.data?.some((s) => s.can_manage)
                    ? 'Professor · gestão escolar'
                    : 'Professor'
                  : 'Responsável'
              }
            />
          </View>
        </View>
        <Action
          secondary
          icon={Pencil}
          title="Editar perfil e contexto"
          onPress={() => setEdit(true)}
        />
      </Card>
      <ShortcutGrid
        items={[
          {
            icon: Settings,
            title: 'Configurações',
            detail: 'Aparência, leitura e acessibilidade',
            onPress: () => navigation.navigate('Settings'),
          },
          {
            icon: Fingerprint,
            title: 'Convites',
            detail: 'Seu identificador para vínculos',
            onPress: () => setInvites(true),
          },
        ]}
      />
      {profession === 'teacher' && (
        <>
          <MenuRow
            icon={School}
            title="Escolas e turmas"
            detail="Contextos, equipe e matrículas"
            onPress={() => navigation.navigate('Schools')}
          />
          <MenuRow
            icon={BookOpen}
            title="Minha biblioteca de aulas"
            detail="Autoria e conteúdo compartilhado"
            onPress={() => navigation.navigate('LessonLibrary')}
          />
        </>
      )}
      <MenuRow
        icon={BookOpen}
        title="Orientações pedagógicas"
        detail="Conteúdos para apoiar a aprendizagem"
        onPress={() => navigation.navigate('Library')}
      />
      <MenuRow
        icon={Sparkles}
        title="Recursos de IA"
        detail="Módulo opcional para a escola"
        onPress={() => navigation.navigate('AIHub')}
      />
      <MenuRow
        icon={CircleHelp}
        title="Ajuda e sobre o Eleva"
        detail="Como aproveitar os próximos passos"
        onPress={() => setHelp(true)}
      />
      <Action
        secondary
        destructive
        icon={LogOut}
        title="Sair da conta"
        onPress={() => setConfirm(true)}
      />
      <Sheet visible={edit} title="Editar perfil" close={() => setEdit(false)}>
        <ProfileCard
          changed={async () => {
            await profileChanged();
            await data.reload();
            setEdit(false);
          }}
        />
      </Sheet>
      <Sheet visible={invites} title="Seu identificador" close={() => setInvites(false)}>
        <Copy>
          Compartilhe com o adulto que vai enviar seu convite. Receber um convite não dá acesso até
          você aceitá-lo.
        </Copy>
        <Card>
          <Copy>{data.data?.id || 'Carregando…'}</Copy>
        </Card>
        <Action
          secondary
          title={Platform.OS === 'web' ? 'Copiar identificador' : 'Compartilhar identificador'}
          disabled={!data.data?.id}
          onPress={() => void shareIdentifier()}
        />
        {!!shareStatus && <Notice text={shareStatus} />}
        <Action
          title="Aceitar um convite"
          onPress={() => {
            setInvites(false);
            navigation.navigate('Children');
          }}
        />
      </Sheet>
      <Sheet visible={help} title="Cada estudante, seu ritmo" close={() => setHelp(false)}>
        <Copy>
          Em Estudantes, adicione um cadastro ou aceite um convite. Na jornada, registre o ponto de
          partida, abra aulas e acompanhe os resultados.
        </Copy>
        <Copy>
          Professores criam aulas e organizam escolas e turmas. Cada estudante precisa de vínculo
          autorizado; compartilhar uma aula não compartilha dados pessoais.
        </Copy>
        <Copy>
          Configurações reúne aparência, tamanho do texto, leitura e apoio em Libras. Adaptações não
          exigem diagnóstico.
        </Copy>
        <Action
          secondary
          title="Abrir configurações"
          onPress={() => {
            setHelp(false);
            navigation.navigate('Settings');
          }}
        />
      </Sheet>
      <Sheet visible={confirm} title="Sair do Eleva?" close={() => setConfirm(false)}>
        <Copy>
          Seus registros salvos continuam disponíveis ao entrar novamente. Confira se há alterações
          pendentes antes de sair.
        </Copy>
        <Action secondary title="Continuar no Eleva" onPress={() => setConfirm(false)} />
        <Action destructive icon={LogOut} title="Sair da conta" onPress={logout} />
      </Sheet>
    </Page>
  );
}
