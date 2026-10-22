import { DefaultTheme, DarkTheme, type Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from '@utils/colors';

const appColors = {
  primary: colors.primary,
  background: colors.light,
  card: '#FFFFFF',
  text: colors.dark,
  border: colors.gray[200],
  notification: colors.danger,
};

const darkAppColors = {
  primary: colors.secondary,
  background: colors.gray[900],
  card: colors.gray[800],
  text: colors.gray[50],
  border: colors.gray[700],
  notification: colors.danger,
};

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, ...appColors },
};

export const darkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, ...darkAppColors },
};

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.dark, fontWeight: '700' },
  contentStyle: { backgroundColor: colors.light },
};
