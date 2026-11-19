import { createContext, useContext, useEffect, useId } from 'react';
import { NavigationContext } from '@react-navigation/native';
import { Hand } from 'lucide-react-native';
import { IconAction } from '@/shared/ui/IconAction';
export type Fragment = { owner: string; text: string };
export const LibrasContext = createContext({
  open: () => {},
  register: (_value: Fragment) => {},
  clear: (_owner: string) => {},
});
export function LibrasAction() {
  const { open } = useContext(LibrasContext);
  return <IconAction icon={Hand} label="Abrir apoio em Libras" onPress={open} />;
}
/** Registers explicit content only, never snapshots, names, answers, reports or DOM extraction. */
export function useLibrasContent(text: string) {
  const owner = useId();
  const navigation = useContext(NavigationContext);
  const { register, clear } = useContext(LibrasContext);
  useEffect(() => {
    function apply() {
      if (text.trim()) register({ owner, text: text.slice(0, 1800) });
    }
    if (!navigation || navigation.isFocused()) apply();
    const focus = navigation?.addListener('focus', apply);
    const blur = navigation?.addListener('blur', () => clear(owner));
    return () => {
      focus?.();
      blur?.();
      clear(owner);
    };
  }, [text, owner, navigation, register, clear]);
}
