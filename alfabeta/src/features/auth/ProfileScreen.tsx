import { useState } from 'react';
import { View } from 'react-native';
import { Settings, Pencil, CircleHelp, BookOpen, LogOut, Fingerprint } from 'lucide-react-native';
import { useResource } from '@/shared/data/hooks';
import { useWorkspace } from '@/app/Workspace';
import { Page, Card, Copy, Action } from '@/shared/ui';
import { MenuRow, Eyebrow, Badge } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { Initial } from '@/features/workspace/Dashboards';
import { LoadState } from '@/shared/ui/ResourceState';
import { ProfileCard } from './ProfileCard';
import type { ScreenProps } from '@/app/routes';
export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  const { logout, profession, profileChanged } = useWorkspace();
  const data = useResource<{ id: string; display_name: string; profession: string }>('/me');
  const [edit, setEdit] = useState(false);
  const [help, setHelp] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <Page>
      <Eyebrow>QUE BOM TER VOCÊ POR AQUI</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Seu perfil
      </Copy>
      <LoadState resource={data} />
      <Card>
        <View style={{ alignItems: 'center', gap: 16, paddingVertical: 12 }}>
          <Initial name={data.data?.display_name || 'E'} size={88} />
          <Copy heading>{data.data?.display_name || 'Sua conta'}</Copy>
          <Badge
            text={
              profession === 'teacher'
                ? 'Professor · espaço de ensinar'
                : 'Responsável · espaço de acompanhar'
            }
          />
        </View>
        <Action secondary icon={Pencil} title="Editar meu perfil" onPress={() => setEdit(true)} />
      </Card>
      <MenuRow
        icon={Settings}
        title="Configurações"
        detail="Aparência, acessibilidade, áudio e Libras"
        onPress={() => navigation.navigate('Settings')}
      />
      <MenuRow
        icon={BookOpen}
        title={profession === 'teacher' ? 'Biblioteca e autoria' : 'Biblioteca de orientações'}
        detail="Conteúdos para apoiar as descobertas"
        onPress={() => navigation.navigate('Library')}
      />
      <MenuRow
        icon={CircleHelp}
        title="Ajuda e sobre o Eleva"
        detail="Como acompanhar a jornada"
        onPress={() => setHelp(true)}
      />
      <Card>
        <Fingerprint size={24} />
        <Copy size="caption" muted>
          Identificador para receber convites
        </Copy>
        <Copy>{data.data?.id || 'Carregando…'}</Copy>
        <Copy muted>Compartilhe somente com o adulto que vai conceder seu vínculo.</Copy>
      </Card>
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
        <Copy muted>
          A identificação usa suas iniciais. Envio de foto ainda não está disponível nesta versão.
        </Copy>
      </Sheet>
      <Sheet visible={help} title="Cada estudante, seu ritmo" close={() => setHelp(false)}>
        <Copy>
          Comece cadastrando um estudante ou recebendo um convite. Registre a avaliação inicial,
          realize atividades e acompanhe os registros nos relatórios.
        </Copy>
        <Copy>
          Professores organizam o acompanhamento por escola e turma. Matrícula não concede acesso
          aos dados: cada vínculo precisa ser autorizado.
        </Copy>
        <Copy>
          Use Configurações para ajustar fonte, contraste e leitura. Apoios não exigem diagnóstico.
          Conteúdo sintético serve à demonstração e não classifica alfabetização.
        </Copy>
        <Action
          title="Abrir configurações"
          onPress={() => {
            setHelp(false);
            navigation.navigate('Settings');
          }}
        />
      </Sheet>
      <Sheet visible={confirm} title="Sair do Eleva?" close={() => setConfirm(false)}>
        <Copy>
          Os registros salvos continuarão disponíveis quando você entrar novamente. Alterações ainda
          não enviadas serão descartadas.
        </Copy>
        <Action secondary title="Cancelar" onPress={() => setConfirm(false)} />
        <Action destructive icon={LogOut} title="Sair da conta" onPress={logout} />
      </Sheet>
    </Page>
  );
}
