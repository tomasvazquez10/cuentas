import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@utils/colors';
import { Button, Card, ConfirmDialog, SidebarMenuButton } from '@components/index';
import { usePerfilQuery } from '@queries/useServerQueries';
import { useAuth } from '@context/AuthContext';

export default function PerfilScreen() {
  const { signOut } = useAuth();
  const perfilQuery = usePerfilQuery();
  const perfil = perfilQuery.data ?? null;
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void perfilQuery.refetch();
    }, [perfilQuery.refetch])
  );

  useEffect(() => {
    if (perfilQuery.isError) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    }
  }, [perfilQuery.error]);

  const cerrarSesionConfirmada = async () => {
    try {
      await signOut();
    } catch (error: any) {
      setConfirmandoLogout(false);
      Alert.alert('Error', error?.message || 'No se pudo cerrar la sesion');
    }
  };

  if (perfilQuery.isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SidebarMenuButton />
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>
      </View>

      {perfil && (
        <>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {perfil.nombre?.charAt(0).toUpperCase() || perfil.email.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.nombre}>{perfil.nombre || 'Usuario'}</Text>
            <Text style={styles.email}>{perfil.email}</Text>
          </View>

          <View style={styles.contentContainer}>
            <Card title="Información Personal">
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>{perfil.nombre || 'No especificado'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{perfil.email}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Miembro desde</Text>
                <Text style={styles.value}>
                  {new Date(perfil.created_at).toLocaleDateString('es-AR')}
                </Text>
              </View>
            </Card>

            <Card title="Acerca de la Aplicación">
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Cuentas v0.1.0</Text>
                <Text style={styles.aboutText}>
                  Gestiona tus gastos diarios y calendario de pagos de forma fácil y segura.
                </Text>
                <View style={styles.aboutItems}>
                  <Text style={styles.aboutItem}>✓ Registra gastos e ingresos</Text>
                  <Text style={styles.aboutItem}>✓ Categoriza tus movimientos</Text>
                  <Text style={styles.aboutItem}>✓ Administra pagos pendientes</Text>
                  <Text style={styles.aboutItem}>✓ Visualiza tu balance financiero</Text>
                </View>
              </View>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                title="Cerrar Sesión"
                onPress={() => setLogoutDialogVisible(true)}
                variant="danger"
                fullWidth
                size="large"
              />
              {confirmandoLogout && (
                <View style={styles.logoutWarning}>
                  <Text style={styles.logoutWarningTitle}>Cerrar sesion?</Text>
                  <Text style={styles.logoutWarningText}>
                    Tendras que volver a ingresar para usar la app.
                  </Text>
                  <View style={styles.logoutActions}>
                    <Button
                      title="Cancelar"
                      onPress={() => setConfirmandoLogout(false)}
                      variant="secondary"
                    />
                    <Button
                      title="Cerrar sesion"
                      onPress={() => void cerrarSesionConfirmada()}
                      variant="danger"
                    />
                  </View>
                </View>
              )}
              <ConfirmDialog
                visible={logoutDialogVisible}
                title="Cerrar sesion?"
                message="Tendras que volver a ingresar para usar la app."
                confirmLabel="Cerrar sesion"
                destructive
                onCancel={() => setLogoutDialogVisible(false)}
                onConfirm={() => {
                  setLogoutDialogVisible(false);
                  void cerrarSesionConfirmada();
                }}
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  nombre: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.gray[600],
  },
  contentContainer: {
    paddingVertical: 16,
  },
  infoRow: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  aboutSection: {
    paddingVertical: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 22,
    marginBottom: 12,
  },
  aboutItems: {
    marginTop: 12,
  },
  aboutItem: {
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutWarning: { backgroundColor: '#FFF1F2', borderRadius: 18, marginTop: 12, padding: 16 },
  logoutWarningTitle: { color: colors.danger, fontSize: 16, fontWeight: '800' },
  logoutWarningText: { color: colors.gray[600], fontSize: 13, lineHeight: 19, marginTop: 5 },
  logoutActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
});
