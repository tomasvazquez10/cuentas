import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '@utils/colors';
import GruposScreen from '@screens/GruposScreen';
import GrupoDetalleScreen from '@screens/GrupoDetalleScreen';

const Stack = createStackNavigator();

export default function GruposNavigator() {  // 👈 Añadimos 'default' aquí
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GruposMain" component={GruposScreen} />
      <Stack.Screen 
        name="GrupoDetalleScreen" 
        component={GrupoDetalleScreen} 
        options={{
          headerShown: true,
          title: 'Detalle del Grupo',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}