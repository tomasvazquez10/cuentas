import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Pressable, StyleSheet, View, Text } from 'react-native';
import { authService } from '@services/authService';
import { colors } from '@utils/colors';

import AuthScreen from '@screens/AuthScreen';
import HomeScreen from '@screens/HomeScreen';
import MovimientosScreen from '@screens/MovimientosScreen';
import GastosScreen from '@screens/GastosScreen';
import CalendarioScreen from '@screens/CalendarioScreen';
import PerfilScreen from '@screens/PerfilScreen';
import TarjetasScreen from '@screens/TarjetasScreen';
import GruposNavigator from '@navigators/GruposNavigator';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SIDEBAR_WIDTH = 236;
const COLLAPSED_SIDEBAR_WIDTH = 72;

const sidebarItems = [
  { name: 'Home', label: 'Inicio', icon: '🏠' },
  { name: 'Movimientos', label: 'Movimientos', icon: '💸' },
  { name: 'Gastos', label: 'Gastos', icon: '$' },
  { name: 'Calendario', label: 'Pagos', icon: '📅' },
  { name: 'Tarjetas', label: 'Tarjetas', icon: '💳' },
  { name: 'Grupos', label: 'Grupos', icon: '👥' },
  { name: 'Perfil', label: 'Perfil', icon: '👤' },
] as const;

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => undefined,
});

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggle: () => setCollapsed((current) => !current) }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarTabBar({ state, navigation }: BottomTabBarProps) {
  const { collapsed, toggle } = useContext(SidebarContext);

  return (
    <View style={[styles.sidebar, { width: collapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH }]}>
      <Pressable
        accessibilityLabel={collapsed ? 'Expandir navegación' : 'Ocultar navegación'}
        accessibilityRole="button"
        onPress={toggle}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleIcon}>{collapsed ? '›' : '‹'}</Text>
        {!collapsed && <Text style={styles.toggleLabel}>Ocultar menú</Text>}
      </Pressable>

      <View style={styles.menu}>
        {sidebarItems.map((item, index) => {
          const focused = state.index === index;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              onPress={() => navigation.navigate(item.name)}
              style={[styles.menuItem, focused && styles.menuItemActive]}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              {!collapsed && (
                <Text style={[styles.menuLabel, focused && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SidebarScreen({ children }: { children: React.ReactNode }) {
  const { collapsed } = useContext(SidebarContext);

  return (
    <View style={[styles.screen, { marginLeft: collapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH }]}>
      {children}
    </View>
  );
}

function withSidebarSpace(Component: React.ComponentType<any>) {
  return function SidebarScreenWrapper(props: any) {
    return (
      <SidebarScreen>
        <Component {...props} />
      </SidebarScreen>
    );
  };
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function AppTabs() {
  return (
    <SidebarProvider>
      <Tab.Navigator
        tabBar={(props) => <SidebarTabBar {...props} />}
        screenOptions={{ headerShown: false, tabBarStyle: styles.tabBarContainer }}
      >
      <Tab.Screen
        name="Home"
        component={withSidebarSpace(HomeScreen)}
        options={{
          title: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Movimientos"
        component={withSidebarSpace(MovimientosScreen)}
        options={{
          title: 'Movimientos',
        }}
      />
      <Tab.Screen
        name="Gastos"
        component={withSidebarSpace(GastosScreen)}
        options={{
          title: 'Gastos',
        }}
      />
      <Tab.Screen
        name="Calendario"
        component={withSidebarSpace(CalendarioScreen)}
        options={{
          title: 'Pagos',
        }}
      />
      <Tab.Screen
        name="Tarjetas"
        component={withSidebarSpace(TarjetasScreen)}
        options={{
          title: 'Tarjetas',
        }}
      />
      <Tab.Screen
        name="Grupos"
        component={withSidebarSpace(GruposNavigator)}
        options={{
          title: 'Grupos',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={withSidebarSpace(PerfilScreen)}
        options={{
          title: 'Perfil',
        }}
      />
      </Tab.Navigator>
    </SidebarProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  tabBarContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: SIDEBAR_WIDTH,
  },
  sidebar: {
    backgroundColor: '#FFFFFF',
    bottom: 0,
    elevation: 12,
    left: 0,
    paddingHorizontal: 12,
    paddingTop: 48,
    position: 'absolute',
    shadowColor: colors.dark,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    top: 0,
    zIndex: 10,
  },
  toggleButton: {
    alignItems: 'center',
    borderBottomColor: colors.gray[100],
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  toggleIcon: { color: colors.primary, fontSize: 28 },
  toggleLabel: { color: colors.gray[600], fontSize: 13, fontWeight: '700' },
  menu: { gap: 8, paddingTop: 24 },
  menuItem: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  menuItemActive: { backgroundColor: '#EEECFF' },
  menuIcon: { fontSize: 22, width: 24 },
  menuLabel: { color: colors.gray[600], fontSize: 14, fontWeight: '600' },
  menuLabelActive: { color: colors.primary, fontWeight: '800' },
});

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  authService
    .getCurrentUser()
    .then((user) => {
      setSession(user);
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
      } = authService.onAuthStateChanged((user) => {
      setSession(user);
      });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
