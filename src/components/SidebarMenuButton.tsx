import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppRootParamList, TabParamList } from '@navigation/types';
import { colors } from '@utils/colors';

type TabDestination = keyof TabParamList;
type SecondaryDestination = 'Resumen' | 'Tarjetas' | 'Grupos';
type MenuDestination =
  | { type: 'tab'; name: TabDestination }
  | { type: 'secondary'; name: SecondaryDestination };

const menuItems: {
  name: string;
  icon: string;
  destination: MenuDestination;
}[] = [
  { name: 'Inicio', icon: '🏠', destination: { type: 'tab', name: 'Inicio' } },
  {
    name: 'Movimientos',
    icon: '💸',
    destination: { type: 'tab', name: 'Movimientos' },
  },
  { name: 'Pagos', icon: '📅', destination: { type: 'tab', name: 'Pagos' } },
  { name: 'Perfil', icon: '👤', destination: { type: 'tab', name: 'Perfil' } },
  { name: 'Resumen', icon: '$', destination: { type: 'secondary', name: 'Resumen' } },
  { name: 'Tarjetas', icon: '💳', destination: { type: 'secondary', name: 'Tarjetas' } },
  { name: 'Grupos', icon: '👥', destination: { type: 'secondary', name: 'Grupos' } },
];

export function SidebarMenuButton() {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<AppRootParamList>>();

  const navigateTo = (destination: MenuDestination) => {
    setVisible(false);

    if (destination.type === 'tab') {
      navigation.navigate('Tabs', { screen: destination.name });
      return;
    }

    if (destination.name === 'Grupos') {
      navigation.navigate('Grupos', { screen: 'GruposMain' });
      return;
    }

    navigation.navigate(destination.name);
  };

  return (
    <>
      <Pressable
        accessibilityLabel="Mostrar navegación"
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={styles.button}
      >
        <Text style={styles.icon}>☰</Text>
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        transparent
        visible={visible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Cerrar navegación"
            onPress={() => setVisible(false)}
            style={styles.backdrop}
          />
          <View style={[styles.sidebar, { paddingTop: insets.top + 24 }]}>
            {menuItems.map((item) => (
              <Pressable
                key={item.name}
                accessibilityRole="button"
                onPress={() => navigateTo(item.destination)}
                style={styles.menuItem}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
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
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(29, 27, 56, 0.35)',
  },
  sidebar: {
    backgroundColor: '#FFFFFF',
    elevation: 12,
    paddingHorizontal: 12,
    width: 236,
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  menuIcon: {
    fontSize: 22,
    width: 24,
  },
  menuLabel: {
    color: colors.gray[600],
    fontSize: 14,
    fontWeight: '600',
  },
});
