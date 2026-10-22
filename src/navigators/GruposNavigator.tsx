import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GruposScreen from '@screens/GruposScreen';
import GrupoDetalleScreen from '@screens/GrupoDetalleScreen';
import type { GruposStackParamList } from '@navigation/types';
import { stackScreenOptions } from '@navigation/theme';

const Stack = createNativeStackNavigator<GruposStackParamList>();

export default function GruposNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="GruposMain" component={GruposScreen} />
      <Stack.Screen
        name="GrupoDetalleScreen"
        component={GrupoDetalleScreen}
        options={{ title: 'Detalle del grupo' }}
      />
    </Stack.Navigator>
  );
}
