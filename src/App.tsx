import React, { useContext, useEffect, useState } from 'react';
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
import { SidebarContext } from '@context/SidebarContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SIDEBAR_WIDTH = 236;

const sidebarItems = [
  { name: 'Home', label: 'Inicio', icon: '🏠' },
  { name: 'Movimientos', label: 'Movimientos', icon: '💸' },
  { name: 'Gastos', label: 'Gastos', icon: '$' },
  { name: 'Calendario', label: 'Pagos', icon: '📅' },
  { name: 'Tarjetas', label: 'Tarjetas', icon: '💳' },
  { name: 'Grupos', label: 'Grupos', icon: '👥' },
  { name: 'Perfil', label: 'Perfil', icon: '👤' },
] as const;

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggle: () => setCollapsed((current) => !current),
        close: () => setCollapsed(true),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarTabBar({ state, navigation }: BottomTabBarProps) {
  const { collapsed, close } = useContext(SidebarContext);

  if (collapsed) {
    return null;
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.menu}>
        {sidebarItems.map((item, index) => {
          const focused = state.index === index;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                navigation.navigate(item.name);
                close();
              }}
              style={[styles.menuItem, focused && styles.menuItemActive]}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, focused && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SidebarScreen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
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
    width: SIDEBAR_WIDTH,
    zIndex: 10,
  },
  menu: { gap: 8, paddingTop: 48 },
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
