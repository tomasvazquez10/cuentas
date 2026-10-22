import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '@screens/AuthScreen';
import type { AuthStackParamList } from './types';
import { stackScreenOptions } from './theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Iniciar sesión' }} />
    </Stack.Navigator>
  );
}
