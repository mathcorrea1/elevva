import { useEffect, useState, type PropsWithChildren } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen } from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { Action, Copy } from '@/shared/ui';
import { Mascot, Badge } from '@/shared/ui/learning';
import { LibrasAction } from '@/features/accessibility/libras-context';

const listeners = new Set<() => void>();
export const replayOnboarding = () => listeners.forEach((show) => show());
const slides = [
  {
    tag: 'UM MUNDO DE DESCOBERTAS',
    title: 'Pequenos passos.\nNovas descobertas.',
    description: 'Aprender a ler abre novos caminhos. Vamos percorrer esse caminho juntos?',
    badge: 'Prazer, eu sou o Lumi!',
  },
  {
    tag: 'CADA ESTUDANTE, UM CAMINHO',
    title: 'Aprender no\npróprio ritmo.',
    description:
      'Atividades e registros ajudam a acompanhar cada descoberta, com apoio de quem está por perto.',
    badge: 'Uma descoberta de cada vez',
  },
  {
    tag: 'EM FAMÍLIA E NA ESCOLA',
    title: 'Juntos, a gente\nvai mais longe.',
    description:
      'Responsáveis e professores acompanham o mesmo estudante quando o vínculo é autorizado. Um espaço para cada papel.',
    badge: 'Cuidar. Ensinar. Acompanhar.',
  },
];
function Onboarding({ done }: { done: () => void }) {
  const [step, setStep] = useState(0);
  const { colors, preferences } = useTheme();
  const slide = slides[step];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, width: '100%', maxWidth: 620, alignSelf: 'center' }}
      >
        <View
          style={{
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: tokens.fontDisplay,
              fontSize: 25 * preferences.font_scale,
              color: colors.onPrimary,
            }}
          >
            eleva
          </Text>
          <LibrasAction />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pular apresentação"
            onPress={done}
            style={{ padding: 14, borderRadius: 24, borderWidth: 1, borderColor: colors.onPrimary }}
          >
            <Text
              style={{
                color: colors.onPrimary,
                fontFamily: tokens.fontMedium,
                fontSize: 12 * preferences.font_scale,
              }}
            >
              Pular
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            minHeight: 260,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: colors.primarySoft,
              padding: 16,
              borderRadius: 120,
              alignItems: 'center',
            }}
          >
            <Mascot
              size={205}
              label="Lumi, uma capivara com mochila e livro, acena para dar boas-vindas."
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Badge text={slide.badge} warm />
          </View>
        </View>
        <View
          style={{
            flexGrow: 1,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 28,
            gap: 18,
          }}
        >
          <View
            style={{ flexDirection: 'row', gap: 6 }}
            accessible
            accessibilityLabel={'Apresentação, etapa ' + (step + 1) + ' de 3'}
          >
            {slides.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 28 : 8,
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: i === step ? colors.primary : colors.divider,
                }}
              />
            ))}
          </View>
          <Text
            style={{
              fontFamily: tokens.fontSemibold,
              color: colors.primary,
              letterSpacing: 1.6,
              fontSize: 12 * preferences.font_scale,
            }}
          >
            {slide.tag}
          </Text>
          <Copy heading headingLevel={1} size="display">
            {slide.title}
          </Copy>
          <Copy muted>{slide.description}</Copy>
          <View style={{ flexGrow: 1, minHeight: 8 }} />
          <Action
            title={step === 2 ? 'Vamos começar' : 'Continuar →'}
            onPress={() => (step === 2 ? done() : setStep(step + 1))}
          />
          <Action quiet title="Já tenho uma conta" onPress={done} />
          <View
            style={{ flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }}
          >
            <BookOpen size={14} color={colors.secondary} accessible={false} />
            <Copy muted size="caption">
              Seu próximo capítulo começa aqui.
            </Copy>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export function OnboardingGate({ children }: PropsWithChildren) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem('eleva.onboarding.v1')
      .then((value) => setVisible(value !== 'done'))
      .catch(() => setVisible(true))
      .finally(() => setChecked(true));
    const show = () => setVisible(true);
    listeners.add(show);
    return () => {
      listeners.delete(show);
    };
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 1, display: checked && !visible ? 'flex' : 'none' }}
        accessibilityElementsHidden={!checked || visible}
      >
        {children}
      </View>
      {checked && visible && (
        <Onboarding
          done={() => {
            setVisible(false);
            void AsyncStorage.setItem('eleva.onboarding.v1', 'done').catch(() => undefined);
          }}
        />
      )}
    </View>
  );
}
