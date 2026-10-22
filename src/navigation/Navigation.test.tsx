import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

type MockAuthValue = {
  userId: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
};

const mockAuthContext = React.createContext<MockAuthValue>({
  userId: null,
  isLoading: false,
  isSignedIn: false,
  signIn: async () => undefined,
  signUp: async () => undefined,
  signOut: async () => undefined,
});

jest.mock('expo-linking', () => ({
  createURL: () => 'cuentas://',
}));

jest.mock('@services/authService', () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    onAuthStateChanged: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const safeAreaContext = jest.requireActual<typeof import('react-native-safe-area-context')>(
    'react-native-safe-area-context'
  );
  return {
    ...safeAreaContext,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@screens/AuthScreen', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Auth screen</ReactNative.Text>,
  };
});

jest.mock('@screens/HomeScreen', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Inicio screen</ReactNative.Text>,
  };
});

jest.mock('@screens/MovimientosScreen', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Movimientos screen</ReactNative.Text>,
  };
});

jest.mock('@screens/CalendarioScreen', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Pagos screen</ReactNative.Text>,
  };
});

jest.mock('@screens/PerfilScreen', () => {
  const React = require('react');
  const ReactNative = require('react-native');
  const { useAuth } = require('@context/AuthContext');

  function MockPerfilScreen() {
    const { signOut } = useAuth();

    return (
      <ReactNative.Button
        title="Cerrar sesión"
        onPress={() => {
          void signOut();
        }}
      />
    );
  }

  return {
    __esModule: true,
    default: MockPerfilScreen,
  };
});

jest.mock('@screens/GastosScreen', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Resumen screen</ReactNative.Text>,
  };
});

jest.mock('@screens/TarjetasScreen', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Tarjetas screen</ReactNative.Text>,
  };
});

jest.mock('@navigators/GruposNavigator', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => <ReactNative.Text>Grupos screen</ReactNative.Text>,
  };
});

jest.doMock('@context/AuthContext', () => ({
  useAuth: () => React.useContext(mockAuthContext),
}));

const Navigation = require('./index').default as React.ComponentType;

function AuthTestProvider({
  initialUserId,
  children,
}: {
  initialUserId: string | null;
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState(initialUserId);
  const value: MockAuthValue = {
    userId,
    isLoading: false,
    isSignedIn: !!userId,
    signIn: async () => undefined,
    signUp: async () => undefined,
    signOut: async () => setUserId(null),
  };

  return <mockAuthContext.Provider value={value}>{children}</mockAuthContext.Provider>;
}

function renderNavigation(userId: string | null) {
  return render(
    <AuthTestProvider initialUserId={userId}>
      <Navigation />
    </AuthTestProvider>
  );
}

describe('Navigation', () => {
  it('muestra autenticación cuando no hay sesión', async () => {
    renderNavigation(null);

    expect(await screen.findByText('Auth screen')).toBeTruthy();
  });

  it('muestra las tabs al iniciar con sesión', async () => {
    renderNavigation('test-user');

    expect(await screen.findByText('Inicio screen')).toBeTruthy();
    expect(screen.getByText('Movimientos')).toBeTruthy();
    expect(screen.getByText('Pagos')).toBeTruthy();
    expect(screen.getByText('Perfil')).toBeTruthy();
  });

  it('vuelve al flujo de autenticación al cerrar sesión', async () => {
    renderNavigation('test-user');

    await screen.findByText('Inicio screen');
    fireEvent.press(screen.getByText('Perfil'));
    fireEvent.press(screen.getByText('Cerrar sesión'));

    expect(await screen.findByText('Auth screen')).toBeTruthy();
  });

  it.each([
    ['Inicio', 'Inicio screen'],
    ['Movimientos', 'Movimientos screen'],
    ['Pagos', 'Pagos screen'],
    ['Perfil', 'Cerrar sesión'],
  ])('navega al tab %s', async (tabTitle, screenLabel) => {
    renderNavigation('test-user');

    await screen.findByText('Inicio screen');
    fireEvent.press(screen.getByText(tabTitle));

    expect(await screen.findByText(screenLabel)).toBeTruthy();
  });
});
