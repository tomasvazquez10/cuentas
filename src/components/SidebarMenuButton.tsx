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
    borderRadius: 10,
    elevation: 4,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 40,
  },
  icon: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 29,
  },
});
