import React, { useState, useCallback } from 'react';
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
import { Button, Input, CustomModal, GastoCompartidoCard, StatCard, ConfirmDialog } from '@components/index';
import { Grupo, GastoCompartido, MiembroGrupo, TipoDivision, TipoMovimiento, SubtipoMovimiento, MetodoMovimiento } from '@models/index';
import { grupoService } from '@services/grupoService';
import { miembroGrupoService } from '@services/miembroGrupoService';
import { gastoCompartidoService } from '@services/gastoCompartidoService';

const SUBTIPOS_GASTO: SubtipoMovimiento[] = ['FIJO', 'BOLUDES', 'DEPTO', 'SALIDAS', 'SUPER'];
const METODOS: MetodoMovimiento[] = ['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO'];

export default function GrupoDetalleScreen({ navigation, route }: any) {
  const { grupoId, grupoNombre } = route.params || {};

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [gastos, setGastos] = useState<GastoCompartido[]>([]);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados del Modal para Nuevo Gasto Compartido
  const [modalVisible, setModalVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [tipoDivision, setTipoDivision] = useState<TipoDivision>('IGUALITARIO');
  const [subtipo, setSubtipo] = useState<SubtipoMovimiento>('SALIDAS');
  const [metodo, setMetodo] = useState<MetodoMovimiento>('EFECTIVO');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Diálogo de confirmación para eliminar gasto
  const [gastoAEliminar, setGastoAEliminar] = useState<string | null>(null);

  const loadData = async () => {
    if (!grupoId) return;
    try {
      setLoading(true);
      const [grupoData, miembrosData, gastosData] = await Promise.all([
        grupoService.obtenerGrupoPorId(grupoId),
        miembroGrupoService.obtenerMiembros(grupoId),
        gastoCompartidoService.obtenerGastosDeGrupo(grupoId),
      ]);
      setGrupo(grupoData);
      setMiembros(miembrosData);
      setGastos(gastosData);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del grupo');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [grupoId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setConcepto('');
    setMonto('');
    setTipoDivision('IGUALITARIO');
    setSubtipo('SALIDAS');
    setMetodo('EFECTIVO');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleCreateGastoCompartido = async () => {
    if (!concepto || !monto) {
      Alert.alert('Error', 'Completa los campos requeridos (Concepto y Monto)');
      return;
    }

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      Alert.alert('Error', 'Indica un monto válido');
      return;
    }

    if (miembros.length === 0) {
      Alert.alert('Error', 'El grupo no tiene miembros para dividir el gasto');
      return;
    }

    try {
      // Lógica de división igualitaria por defecto
      const montoPorPersona = Number((montoNumerico / miembros.length).toFixed(2));
      const participantesPayload = miembros.map((m) => ({
        usuarioId: m.usuario_id,
        montoCorrespondiente: montoPorPersona,
      }));

      // Asumiendo que el usuario actual es quien crea el gasto (puedes obtener el ID de tu AuthContext o servicio de sesión)
      // Nota: Asegúrate de pasar el ID del usuario logueado actual si lo manejas globalmente.
      const userId = miembros[0]?.usuario_id; // Ejemplo temporal, idealmente sacarlo de tu contexto de Auth

      await gastoCompartidoService.crearGastoCompartido({
        movimiento: {
          fecha,
          tipo: 'GASTO' as TipoMovimiento,
          subtipo,
          concepto,
          metodo,
          monto: montoNumerico,
        },
        grupoId,
        tipoDivision,
        userId,
        participantes: participantesPayload,
      });

      cerrarModal();
      await loadData();
      Alert.alert('Éxito', 'Gasto compartido creado y dividido correctamente');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el gasto compartido');
    }
  };

  const handleDeleteGasto = async (id: string) => {
    try {
      await gastoCompartidoService.eliminarGastoCompartido(id);
      setGastos((prev) => prev.filter((g) => g.id !== id));
      Alert.alert('Éxito', 'Gasto compartido eliminado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el gasto');
    }
  };

  const totalGastosGrupo = gastos.reduce((acc, g: any) => acc + (g.movimientos?.monto || 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{grupo?.nombre || grupoNombre || 'Detalle del Grupo'}</Text>
          <Text style={styles.headerSubtitle}>{grupo?.descripcion || 'Gastos compartidos del grupo'}</Text>
        </View>

        <View style={styles.balanceContainer}>
          <StatCard
            label="Total Gastado en el Grupo"
            value={totalGastosGrupo}
            type="egreso"
          />
        </View>

        {/* Sección de Miembros */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MIEMBROS ({miembros.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miembrosScroll}>
            {miembros.map((m: any) => (
              <View key={m.id} style={styles.miembroChip}>
                <Text style={styles.miembroAvatar}>👤</Text>
                <Text style={styles.miembroNombre}>{m.perfiles?.nombre || m.perfiles?.email || 'Miembro'}</Text>
                <Text style={styles.miembroRol}>{m.rol}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Sección de Gastos Compartidos */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>GASTOS COMPARTIDOS</Text>
          {gastos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay gastos compartidos en este grupo</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {gastos.map((gasto) => (
                <GastoCompartidoCard
                  key={gasto.id}
                  gasto={gasto}
                  onPress={() => {
                    // Opcional: Navegar a una pantalla de detalle del gasto si lo deseas
                  }}
                  onDelete={() => setGastoAEliminar(gasto.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón flotante para agregar gasto compartido */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          accessibilityLabel="Nuevo gasto compartido"
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Crear Gasto Compartido */}
      <CustomModal
        visible={modalVisible}
        title="Nuevo Gasto Compartido"
        onClose={cerrarModal}
        footer={
          <View style={styles.modalFooter}>
            <Button title="Cancelar" onPress={cerrarModal} variant="secondary" />
            <Button title="Crear" onPress={handleCreateGastoCompartido} variant="primary" />
          </View>
        }
      >
        <View>
          <Input
            label="Concepto"
            placeholder="Ej. Cena grupal, Compras supermercado"
            value={concepto}
            onChangeText={setConcepto}
          />

          <Input
            label="Monto Total"
            placeholder="0.00"
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
          />

          <Input
            label="Fecha"
            placeholder="YYYY-MM-DD"
            value={fecha}
            onChangeText={setFecha}
          />

          <Text style={styles.label}>Categoría del Gasto</Text>
          <View style={styles.optionsContainer}>
            {SUBTIPOS_GASTO.map((s) => (
              <Button
                key={s}
                title={s}
                onPress={() => setSubtipo(s)}
                variant={subtipo === s ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>

          <Text style={styles.label}>Método de Pago</Text>
          <View style={styles.optionsContainer}>
            {METODOS.map((m) => (
              <Button
                key={m}
                title={m}
                onPress={() => setMetodo(m)}
                variant={metodo === m ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>
        </View>
      </CustomModal>

      {/* Diálogo de Confirmación de Borrado */}
      <ConfirmDialog
        visible={!!gastoAEliminar}
        title="Eliminar gasto compartido?"
        message="Esta acción eliminará el gasto y sus divisiones asociadas."
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setGastoAEliminar(null)}
        onConfirm={() => {
          const id = gastoAEliminar;
          setGastoAEliminar(null);
          if (id) void handleDeleteGasto(id);
        }}
      />
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
    paddingBottom: 20,
    paddingTop: 42,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ffffffcc',
    marginTop: 4,
  },
  balanceContainer: {
    marginTop: 18,
    marginHorizontal: 20,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  miembrosScroll: {
    flexDirection: 'row',
  },
  miembroChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 100,
    elevation: 1,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  miembroAvatar: {
    fontSize: 20,
    marginBottom: 4,
  },
  miembroNombre: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark,
    textAlign: 'center',
  },
  miembroRol: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 18,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
});