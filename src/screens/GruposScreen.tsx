import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@utils/colors';
import { Button, Input, CustomModal, SidebarMenuButton } from '@components/index';
import { grupoService } from '@services/grupoService';
import { formatMoney } from '@utils/formatting';
import { useGruposConBalanceQuery } from '@queries/useServerQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@queries/queryKeys';
import { useAuth } from '@context/AuthContext';
import { crearGrupoSchema } from '@schemas/groupSchemas';
import type { GruposScreenProps } from '@navigation/types';

export default function GruposScreen({ navigation }: GruposScreenProps) {
  const gruposQuery = useGruposConBalanceQuery();
  const gruposConBalances = gruposQuery.data ?? [];
  const grupos = gruposConBalances.map(({ grupo }) => grupo);
  const balancesGrupos = gruposConBalances.reduce<Record<string, number>>(
    (balances, { grupo, balance }) => {
      balances[grupo.id] = balance;
      return balances;
    },
    {}
  );
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Modal para Crear Grupo
  const [modalGrupoVisible, setModalGrupoVisible] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [descripcionGrupo, setDescripcionGrupo] = useState('');

  const crearGrupoMutation = useMutation({
    mutationFn: ({ nombre, descripcion }: { nombre: string; descripcion: string }) =>
      grupoService.crearGrupo(nombre, descripcion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.grupos(userId) }),
  });

  useFocusEffect(
    useCallback(() => {
      void gruposQuery.refetch();
    }, [gruposQuery.refetch])
  );

  useEffect(() => {
    if (gruposQuery.isError) {
      const error = gruposQuery.error;
      Alert.alert('Error', error?.message || 'No se pudieron cargar los grupos');
    }
  }, [gruposQuery.error]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await gruposQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateGrupo = async () => {
    const validation = crearGrupoSchema.safeParse({
      nombre: nombreGrupo,
      descripcion: descripcionGrupo,
    });
    if (!validation.success) {
      Alert.alert('Error', validation.error.issues[0]?.message || 'Revisa los datos del grupo');
      return;
    }

    try {
      const nuevoGrupo = await crearGrupoMutation.mutateAsync({
        nombre: validation.data.nombre,
        descripcion: validation.data.descripcion ?? '',
      });
      setModalGrupoVisible(false);
      setNombreGrupo('');
      setDescripcionGrupo('');
      Alert.alert('Éxito', 'Grupo creado correctamente');

      // Opcional: Navegar directamente al detalle del grupo recién creado
      navigation.navigate('GrupoDetalleScreen', {
        grupoId: nuevoGrupo.id,
        grupoNombre: nuevoGrupo.nombre,
      });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el grupo');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SidebarMenuButton />
            <Text style={styles.headerTitle}>Mis Grupos</Text>
          </View>
          <Text style={styles.headerSubtitle}>Tus círculos de gastos compartidos</Text>
        </View>

        <View style={styles.listContainer}>
          {gruposQuery.isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Cargando grupos...</Text>
            </View>
          ) : grupos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No perteneces a ningún grupo todavía.</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setModalGrupoVisible(true)}
              >
                <Text style={styles.emptyButtonText}>Crear mi primer grupo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            grupos.map((grupo) => {
              const totalGastos = balancesGrupos[grupo.id] || 0;
              return (
                <TouchableOpacity
                  key={grupo.id}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate('GrupoDetalleScreen', {
                      grupoId: grupo.id,
                      grupoNombre: grupo.nombre,
                    })
                  }
                >
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>👥</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{grupo.nombre}</Text>
                    <Text style={styles.cardDescription} numberOfLines={1}>
                      {grupo.descripcion || 'Sin descripción'}
                    </Text>
                  </View>
                  <View style={styles.cardAmountContainer}>
                    <Text style={styles.cardAmountLabel}>Gastos</Text>
                    <Text style={styles.cardAmount}>{formatMoney(totalGastos)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Botón flotante para crear grupo */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          accessibilityLabel="Crear nuevo grupo"
          onPress={() => setModalGrupoVisible(true)}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL: Crear Grupo */}
      <CustomModal
        visible={modalGrupoVisible}
        title="Crear Nuevo Grupo"
        onClose={() => setModalGrupoVisible(false)}
        footer={
          <View style={styles.modalFooter}>
            <Button
              title="Cancelar"
              onPress={() => setModalGrupoVisible(false)}
              variant="secondary"
            />
            <Button title="Crear" onPress={handleCreateGrupo} variant="primary" />
          </View>
        }
      >
        <View>
          <Input
            label="Nombre del Grupo"
            placeholder="Ej. Viaje a la costa, Amigos depto"
            value={nombreGrupo}
            onChangeText={setNombreGrupo}
          />
          <Input
            label="Descripción (Opcional)"
            placeholder="Detalles del grupo"
            value={descripcionGrupo}
            onChangeText={setDescripcionGrupo}
            multiline
            numberOfLines={2}
          />
        </View>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ffffffcc',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.gray[500],
  },
  cardAmountContainer: {
    alignItems: 'flex-end',
  },
  cardAmountLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger || '#FF3B30',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    elevation: 1,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: colors.dark,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 36,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
});
