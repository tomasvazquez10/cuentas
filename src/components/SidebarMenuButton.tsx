import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSidebar } from '@context/SidebarContext';
import { colors } from '@utils/colors';

export function SidebarMenuButton() {
  const { collapsed, toggle } = useSidebar();

  return (
    <Pressable
      accessibilityLabel={collapsed ? 'Mostrar navegación' : 'Ocultar navegación'}
      accessibilityRole="button"
      onPress={toggle}
      style={styles.button}
    >
      <Text style={styles.icon}>{collapsed ? '☰' : '‹'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 4,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 32,
  },
  icon: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
});
