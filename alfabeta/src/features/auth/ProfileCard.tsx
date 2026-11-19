import React, { useEffect, useState } from 'react';
import { Card, Copy, Field, Action, Notice } from '@/shared/ui';
import { useResource, useCommand } from '@/features/learning/hooks';
import { Pills } from '@/shared/ui/learning';
export function ProfileCard({ changed }: { changed?: () => Promise<void> }) {
  const result = useResource<{
    id: string;
    display_name: string;
    profession: 'teacher' | 'guardian';
  }>('/me');
  const save = useCommand();
  const [name, setName] = useState('');
  const [profession, setProfession] = useState<'teacher' | 'guardian'>('guardian');
  useEffect(() => {
    if (result.data) {
      setName(result.data.display_name);
      setProfession(result.data.profession);
    }
  }, [result.data]);
  return (
    <Card>
      <Copy heading>Minha conta adulta</Copy>
      <Field label="Seu nome no Eleva" value={name} onChangeText={setName} maxLength={100} />
      <Copy>Contexto de uso:</Copy>
      <Pills
        value={profession}
        options={[
          { value: 'guardian', label: 'Responsável' },
          { value: 'teacher', label: 'Professor' },
        ]}
        onChange={(value) => setProfession(value as 'guardian' | 'teacher')}
      />
      <Copy muted>
        Escolher professor não dá acesso a estudantes. O vínculo precisa ser concedido pelo gestor.
      </Copy>
      <Action
        title="Salvar perfil"
        disabled={save.busy || !name.trim()}
        onPress={() => void save.run('/me', { display_name: name, profession }, changed, 'PATCH')}
      />
      {!!save.message && <Notice text={save.message} />}
      {!!save.error && <Notice error text={save.error} />}
    </Card>
  );
}
