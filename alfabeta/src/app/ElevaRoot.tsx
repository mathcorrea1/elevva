import React, { useEffect, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Card, Copy, Action, Field, Notice, Loading } from '@/shared/ui';
import { ThemeProvider, useTheme } from '@/shared/theme/ThemeProvider';
import { betterAuthSession, authRequest } from '@/features/auth/session';
import { repository } from '@/shared/http/repository';
import {
  StudentScreen,
  AssessmentScreen,
  ObservationScreen,
  TrailScreen,
  ExecuteScreen,
  HistoryScreen,
  AnalysisScreen,
  LinksScreen,
} from '@/features/learning/screens';
import type { Routes } from '@/features/learning/screens';
import { LibraryScreen, ClassroomsScreen } from '@/features/teaching/screens';
import { SettingsScreen } from '@/features/accessibility/SettingsScreen';
import { ResetPasswordGate } from '@/features/auth/ResetPasswordGate';
import { PublicEntry } from '@/features/auth/PublicEntry';
import { onSessionExpired } from '@/features/auth/session';
import { GuidanceScreen } from '@/features/guidance/GuidanceScreen';
import { TabNavigation } from './TabNavigation';
import { AccessibleErrorBoundary } from '@/shared/ui/AccessibleErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { OnboardingGate } from '@/features/onboarding/OnboardingGate';
import { withStudentAccess } from '@/features/learning/StudentAccess';
import { tokens } from '@/shared/theme/ThemeProvider';
import { WorkspaceProvider } from './Workspace';
import { DashboardScreen, SchoolsScreen, AIHub } from '@/features/workspace/Dashboards';
import { ManagementScreen as ChildrenScreen } from '@/features/students/ManagementScreen';
import { ProfileScreen } from '@/features/auth/ProfileScreen';
import { CollectiveScreen } from '@/features/reports/CollectiveScreen';
import { HeaderBackButton } from '@react-navigation/elements';
import { TrailsCatalog, StudentCatalog } from '@/features/trails/CatalogScreen';
import { MapScreen } from '@/features/trails/MapScreen';
import { LessonScreen } from '@/features/trails/LessonScreen';
import { AuthorScreen } from '@/features/trails/AuthorScreen';
import { OverviewScreen } from '@/features/reports/OverviewScreen';
import { InvestigationScreen } from '@/features/reports/InvestigationScreen';
import { CareScreen } from '@/features/students/CareScreen';
import { BuilderScreen } from '@/features/lessons/BuilderScreen';
import { LessonLibraryScreen } from '@/features/lessons/LibraryScreen';
import { PlayerScreen } from '@/features/lessons/PlayerScreen';
import { AssignedScreen } from '@/features/lessons/AssignedScreen';

const ProtectedAssessment = withStudentAccess(AssessmentScreen);
const ProtectedObservation = withStudentAccess(ObservationScreen);
const ProtectedExecutor = withStudentAccess(ExecuteScreen);
const ProtectedLessonPlayer = withStudentAccess(PlayerScreen);

const StackNav = createNativeStackNavigator<Routes>();
const Tabs = createBottomTabNavigator();
function LearningNavigator({ initial = 'Home' }: { initial?: keyof Routes }) {
  const { colors, reducedMotion, preferences } = useTheme();
  return (
    <StackNav.Navigator
      initialRouteName={initial}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: tokens.fontSemibold,
          fontSize: 16 * preferences.font_scale,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
        headerLeft:
          Platform.OS === 'web'
            ? (props) =>
                props.canGoBack ? (
                  <HeaderBackButton
                    {...props}
                    onPress={navigation.goBack}
                    accessibilityLabel="Voltar"
                    labelVisible={false}
                  />
                ) : null
            : undefined,
        contentStyle: { backgroundColor: colors.background },
        animation: reducedMotion ? 'none' : 'default',
      })}
    >
      <StackNav.Screen
        name="Children"
        component={ChildrenScreen}
        options={{ title: 'Estudantes' }}
      />
      <StackNav.Screen name="Schools" component={SchoolsScreen} options={{ title: 'Escolas' }} />
      <StackNav.Screen name="Trails" component={TrailsCatalog} options={{ title: 'Trilhas' }} />
      <StackNav.Screen name="Reports" component={OverviewScreen} options={{ title: 'Panorama' }} />
      <StackNav.Screen
        name="TrailMap"
        component={MapScreen}
        options={{ title: 'Mapa da trilha' }}
      />
      <StackNav.Screen name="Lesson" component={LessonScreen} options={{ title: 'Aula' }} />
      <StackNav.Screen
        name="LessonBuilder"
        component={BuilderScreen}
        options={{ title: 'Ateliê de aulas', headerShown: false }}
      />
      <StackNav.Screen
        name="LessonLibrary"
        component={LessonLibraryScreen}
        options={{ title: 'Biblioteca de aulas' }}
      />
      <StackNav.Screen
        name="AssignedLessons"
        component={AssignedScreen}
        options={{ title: 'Aulas para explorar' }}
      />
      <StackNav.Screen
        name="LessonPlayer"
        component={ProtectedLessonPlayer}
        options={{ title: 'Nossa aula', gestureEnabled: false }}
      />
      <StackNav.Screen
        name="TrailAuthor"
        component={AuthorScreen}
        options={{ title: 'Ateliê de trilhas' }}
      />
      <StackNav.Screen
        name="Care"
        component={CareScreen}
        options={{ title: 'Comunicação e apoios' }}
      />
      <StackNav.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <StackNav.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
      <StackNav.Screen name="Library" component={LibraryScreen} options={{ title: 'Biblioteca' }} />
      <StackNav.Screen
        name="ClassroomManagement"
        component={ClassroomsScreen}
        options={{ title: 'Escolas e matrículas' }}
      />
      <StackNav.Screen
        name="Collective"
        component={CollectiveScreen}
        options={{ title: 'Relatório coletivo' }}
      />
      <StackNav.Screen name="AIHub" component={AIHub} options={{ title: 'Apoio com IA' }} />
      <StackNav.Screen name="Home" component={DashboardScreen} options={{ title: 'Eleva' }} />
      <StackNav.Screen
        name="Student"
        component={StudentScreen}
        options={{ title: 'Acompanhamento' }}
      />
      <StackNav.Screen
        name="Assessment"
        component={ProtectedAssessment}
        options={{ title: 'Avaliação' }}
      />
      <StackNav.Screen
        name="Observation"
        component={ProtectedObservation}
        options={{ title: 'Observação' }}
      />
      <StackNav.Screen
        name="Trail"
        component={StudentCatalog}
        options={{ title: 'Trilhas do estudante' }}
      />
      <StackNav.Screen
        name="LegacyTrail"
        component={TrailScreen}
        options={{ title: 'Atividades anteriores' }}
      />
      <StackNav.Screen
        name="Execute"
        component={ProtectedExecutor}
        options={{ title: 'Atividade' }}
      />
      <StackNav.Screen name="History" component={HistoryScreen} options={{ title: 'Histórico' }} />
      <StackNav.Screen
        name="Report"
        component={InvestigationScreen}
        options={{ title: 'Relatório individual' }}
      />
      <StackNav.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ title: 'Análise assistida' }}
      />
      <StackNav.Screen name="Links" component={LinksScreen} options={{ title: 'Vínculos' }} />
      <StackNav.Screen
        name="Guidance"
        component={GuidanceScreen}
        options={{ title: 'Orientações' }}
      />
    </StackNav.Navigator>
  );
}
function Root() {
  const { colors, dark, scope, preferences } = useTheme();
  const dimensions = useWindowDimensions();
  const sidebar =
    Platform.OS === 'web' &&
    dimensions.width >= 1000 &&
    preferences.font_scale * dimensions.fontScale <= 1.25;
  const [account, setAccount] = useState<string | null>(null);
  const [profession, setProfession] = useState<'guardian' | 'teacher'>('guardian');
  const [booting, setBooting] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web' && !account) document.title = 'Eleva';
  }, [account]);
  useEffect(
    () =>
      onSessionExpired(() => {
        setAccount(null);
        setExecuting(false);
        scope(null);
        setError('Sua sessão expirou. Entre novamente.');
      }),
    [],
  );
  async function load() {
    const me = await repository.get<{
      id: string;
      preferences: object;
      profession: 'guardian' | 'teacher';
    }>('/me');
    setProfession(me.profession);
    scope(me.id, me.preferences);
    setAccount(me.id);
  }
  useEffect(() => {
    void betterAuthSession
      .restore()
      .then(async (value) => {
        if (value) await load();
      })
      .catch(() => {
        /* Sign-in remains usable when identity is offline. */
      })
      .finally(() => setBooting(false));
  }, []);
  async function login() {
    setBusy(true);
    setError('');
    try {
      if (mode === 'reset') {
        await authRequest('/request-password-reset', {
          email,
          redirectTo: Platform.OS === 'web' ? window.location.origin : 'alfabeta://',
        });
        setError('Se houver conta e envio de e-mail configurado, você receberá o link.');
      } else {
        if (mode === 'register') await betterAuthSession.signUp(name, email, password);
        else await betterAuthSession.signIn(email, password);
        await load();
        setPassword('');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setAccount(null);
    setExecuting(false);
    scope(null);
    setPassword('');
    try {
      await betterAuthSession.logout();
    } catch {
      setError(
        'Sessão local encerrada. O servidor de identidade não confirmou a saída; reconecte para revogar a sessão.',
      );
    } finally {
      setBusy(false);
    }
  }
  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      primary: colors.primary,
      border: colors.border,
      notification: colors.primary,
    },
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {booting ? (
        <Loading />
      ) : !account ? (
        <PublicEntry>
          <Card>
            <Copy heading>
              {mode === 'register'
                ? 'Criar conta'
                : mode === 'reset'
                  ? 'Recuperar acesso'
                  : 'Que bom ter você aqui'}
            </Copy>
            <Copy muted>Entre com sua conta de responsável ou professor.</Copy>
            {mode === 'register' && (
              <Field label="Seu nome" value={name} onChangeText={setName} maxLength={100} />
            )}
            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {mode !== 'reset' && (
              <Field
                label={mode === 'register' ? 'Senha (mínimo 10 caracteres)' : 'Senha'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            )}
            <Action
              title={
                busy
                  ? 'Aguarde…'
                  : mode === 'register'
                    ? 'Criar minha conta'
                    : mode === 'reset'
                      ? 'Solicitar recuperação'
                      : 'Entrar'
              }
              disabled={
                busy ||
                !email.trim() ||
                (mode !== 'reset' && !password) ||
                (mode === 'register' && (!name.trim() || password.length < 10))
              }
              onPress={() => void login()}
            />
            <Action
              secondary
              quiet
              title={mode === 'login' ? 'Criar uma conta' : 'Voltar para entrar'}
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            />
            {mode === 'login' && (
              <Action
                secondary
                quiet
                title="Esqueci minha senha"
                onPress={() => setMode('reset')}
              />
            )}
          </Card>
          {!!error && <Notice text={error} error />}
        </PublicEntry>
      ) : (
        <WorkspaceProvider
          key={account}
          account={account}
          profession={profession}
          logout={() => void logout()}
          profileChanged={load}
        >
          <NavigationContainer
            theme={navTheme}
            onStateChange={(state) => {
              let active: any = state;
              let name = '';
              while (active?.routes) {
                const route = active.routes[active.index || 0];
                name = route.name;
                active = route.state;
              }
              setExecuting(name === 'Execute' || name === 'LessonPlayer');
            }}
          >
            <Tabs.Navigator
              tabBar={(props) => <TabNavigation {...props} />}
              sceneContainerStyle={{ marginLeft: sidebar && !executing ? 240 : 0 }}
              screenOptions={{ headerShown: false }}
            >
              <Tabs.Screen name="Inicio" options={{ title: 'Início' }}>
                {() => <LearningNavigator initial="Home" />}
              </Tabs.Screen>
              {profession === 'teacher' ? (
                <Tabs.Screen name="Escolas">
                  {() => <LearningNavigator initial="Schools" />}
                </Tabs.Screen>
              ) : (
                <Tabs.Screen name="Estudantes">
                  {() => <LearningNavigator initial="Children" />}
                </Tabs.Screen>
              )}
              <Tabs.Screen name="Trilhas">
                {() => <LearningNavigator initial="Trails" />}
              </Tabs.Screen>
              <Tabs.Screen name="Relatórios">
                {() => <LearningNavigator initial="Reports" />}
              </Tabs.Screen>
              <Tabs.Screen name="Perfil">
                {() => <LearningNavigator initial="Profile" />}
              </Tabs.Screen>
            </Tabs.Navigator>
          </NavigationContainer>
        </WorkspaceProvider>
      )}
    </View>
  );
}
export function ElevaRoot() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AccessibleErrorBoundary>
          <ResetPasswordGate>
            {fontsLoaded || fontError ? (
              <OnboardingGate>
                <Root />
              </OnboardingGate>
            ) : (
              <Loading />
            )}
          </ResetPasswordGate>
        </AccessibleErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
