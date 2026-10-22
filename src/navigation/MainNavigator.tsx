import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GastosScreen from '@screens/GastosScreen';
import TarjetasScreen from '@screens/TarjetasScreen';
import GruposNavigator from '@navigators/GruposNavigator';
import TabNavigator from './TabNavigator';
import type { MainStackParamList } from './types';
import { stackScreenOptions } from './theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Resumen" component={GastosScreen} options={{ title: 'Resumen' }} />
      <Stack.Screen name="Tarjetas" component={TarjetasScreen} options={{ title: 'Tarjetas' }} />
      <Stack.Screen name="Grupos" component={GruposNavigator} options={{ title: 'Grupos' }} />
    </Stack.Navigator>
  );
}
