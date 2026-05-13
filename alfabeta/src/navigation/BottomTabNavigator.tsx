import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActivityDetailScreen } from '@/screens/Activities/ActivityDetailScreen';
import { ActivityListScreen } from '@/screens/Activities/ActivityListScreen';
import { AudioActivityScreen } from '@/screens/Activities/AudioActivityScreen';
import { CreateActivityScreen } from '@/screens/Activities/CreateActivityScreen';
import { AddChildScreen } from '@/screens/Child/AddChildScreen';
import { AssessmentScreen } from '@/screens/Child/AssessmentScreen';
import { ChildDetailScreen } from '@/screens/Child/ChildDetailScreen';
import { ChildListScreen } from '@/screens/Child/ChildListScreen';
import { ChildProgressScreen } from '@/screens/Child/ChildProgressScreen';
import { StudentReportScreen } from '@/screens/Child/StudentReportScreen';
import { TrailDetailScreen } from '@/screens/Child/TrailDetailScreen';
import { TrailListScreen } from '@/screens/Child/TrailListScreen';
import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';
import { CreateGuidanceScreen } from '@/screens/Guidance/CreateGuidanceScreen';
import { GuidanceDetailScreen } from '@/screens/Guidance/GuidanceDetailScreen';
import { GuidanceListScreen } from '@/screens/Guidance/GuidanceListScreen';
import { ProfileScreen } from '@/screens/Profile/ProfileScreen';
import { ReportScreen } from '@/screens/Reports/ReportScreen';
import { theme } from '@/theme';

const Tab = createBottomTabNavigator();
const ChildStack = createNativeStackNavigator();
const ActivitiesStack = createNativeStackNavigator();
const GuidanceStack = createNativeStackNavigator();

const stackOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
};

const ChildStackNavigator = () => (
  <ChildStack.Navigator screenOptions={stackOptions}>
    <ChildStack.Screen name="ChildList" component={ChildListScreen} />
    <ChildStack.Screen name="ChildDetail" component={ChildDetailScreen} />
    <ChildStack.Screen name="AddChild" component={AddChildScreen} />
    <ChildStack.Screen name="ChildProgress" component={ChildProgressScreen} />
    <ChildStack.Screen name="StudentReport" component={StudentReportScreen} />
    <ChildStack.Screen name="Assessment" component={AssessmentScreen} />
    <ChildStack.Screen name="TrailList" component={TrailListScreen} />
    <ChildStack.Screen name="TrailDetail" component={TrailDetailScreen} />
  </ChildStack.Navigator>
);

const ActivitiesStackNavigator = () => (
  <ActivitiesStack.Navigator screenOptions={stackOptions}>
    <ActivitiesStack.Screen name="ActivityList" component={ActivityListScreen} />
    <ActivitiesStack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    <ActivitiesStack.Screen name="AudioActivity" component={AudioActivityScreen} />
    <ActivitiesStack.Screen name="CreateActivity" component={CreateActivityScreen} />
  </ActivitiesStack.Navigator>
);

const GuidanceStackNavigator = () => (
  <GuidanceStack.Navigator screenOptions={stackOptions}>
    <GuidanceStack.Screen name="GuidanceList" component={GuidanceListScreen} />
    <GuidanceStack.Screen name="GuidanceDetail" component={GuidanceDetailScreen} />
    <GuidanceStack.Screen name="CreateGuidance" component={CreateGuidanceScreen} />
  </GuidanceStack.Navigator>
);

interface TabIconProps {
  focused: boolean;
  filled: keyof typeof Ionicons.glyphMap;
  outline: keyof typeof Ionicons.glyphMap;
  color: string;
}

const TabIcon = ({ focused, filled, outline, color }: TabIconProps) => {
  const scale = useSharedValue(1);
  const pillOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 320 });
    pillOpacity.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, pillOpacity, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
  }));

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <Animated.View style={iconStyle}>
        <Ionicons name={focused ? filled : outline} color={color} size={22} />
      </Animated.View>
    </View>
  );
};

const tabMeta: Record<
  string,
  { filled: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap; label: string }
> = {
  Dashboard: { filled: 'home', outline: 'home-outline', label: 'Inicio' },
  Children: { filled: 'people', outline: 'people-outline', label: 'Estudantes' },
  Activities: { filled: 'book', outline: 'book-outline', label: 'Atividades' },
  Reports: { filled: 'bar-chart', outline: 'bar-chart-outline', label: 'Relatorios' },
  Guidance: { filled: 'bulb', outline: 'bulb-outline', label: 'Orientacoes' },
  Profile: { filled: 'person', outline: 'person-outline', label: 'Perfil' },
};

export const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const meta = tabMeta[route.name];
      return {
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarLabel: meta?.label ?? route.name,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, focused }) =>
          meta ? (
            <TabIcon focused={focused} filled={meta.filled} outline={meta.outline} color={color} />
          ) : null,
      };
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Children" component={ChildStackNavigator} />
    <Tab.Screen name="Activities" component={ActivitiesStackNavigator} />
    <Tab.Screen name="Reports" component={ReportScreen} />
    <Tab.Screen name="Guidance" component={GuidanceStackNavigator} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: '#ede9fe',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 82 : 66,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary[700],
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 12 },
    }),
  },
  tabItem: { paddingTop: 2 },
  tabLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    marginTop: 2,
  },
  iconWrap: {
    width: 44,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 17,
    backgroundColor: theme.colors.primary[50],
  },
});
