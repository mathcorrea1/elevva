import { useState } from 'react';
import { View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Field } from '@/shared/ui';
import { IconAction } from '@/shared/ui/IconAction';
export function PasswordField({
  value,
  onChangeText,
  registering = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  registering?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Field
        label={registering ? 'Senha (mínimo 10 caracteres)' : 'Senha'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoComplete={registering ? 'new-password' : 'current-password'}
        style={{ paddingRight: 62 }}
      />
      <View style={{ position: 'absolute', right: 6, bottom: 3 }}>
        <IconAction
          label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          icon={visible ? EyeOff : Eye}
          onPress={() => setVisible((v) => !v)}
        />
      </View>
    </View>
  );
}
