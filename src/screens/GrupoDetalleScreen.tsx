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
import {
  Button,
  Input,
  CustomModal,
  GastoCompartidoCard,
  StatCard,
  ConfirmDialog,
  DatePickerField,
  DropdownField,
  DropdownOption,
} from '@components/index';
import { Grupo, GastoCompartido, MiembroGrupo, TipoDivision, TipoMovimiento, SubtipoMovimiento, MetodoMovimiento } from '@models/index';
import { grupoService } from '@services/grupoService';
import { miembroGrupoService } from '@services/miembroGrupoService';
import { gastoCompartidoService } from '@services/gastoCompartidoService';
import { authService } from '@services/authService';

const SUBTIPOS_POR_TIPO: Record<TipoMovimiento, SubtipoMovimiento[]> = {
  ENTRADA: ['SUELDO', 'BONO', 'OTRO'],
  GASTO: ['FIJO', 'BOLUDES', 'DEPTO', 'SALIDAS', 'SUPER'],
  AHORRO: ['DOLAR'],
  INVERSION: ['CEDEARS'],
};
const TIPOS_MOVIMIENTO: TipoMovimiento[] = ['ENTRADA', 'GASTO', 'AHORRO', 'INVERSION'];
const METODOS: MetodoMovimiento[] = ['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO'];

export default function GrupoDetalleScreen({ navigation, route }: any) {
  const { grupoId, grupoNombre } = route.params || {};

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [gastos, setGastos] = useState<GastoCompartido[]>([]);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [miembrosExpanded, setMiembrosExpanded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  // Estados del Modal para Nuevo Gasto Compartido
  const [modalVisible, setModalVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('GASTO');
  const [tipoDivision, setTipoDivision] = useState<TipoDivision>('IGUALITARIO');
  const [subtipo, setSubtipo] = useState<SubtipoMovimiento>('SALIDAS');
  const [metodo, setMetodo] = useState<MetodoMovimiento>('EFECTIVO');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [pagadoPorUsuarioId, setPagadoPorUsuarioId] = useState('');
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([]);

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

  const getMiembroNombre = (miembro: MiembroGrupo) =>
    miembro.perfiles?.nombre || miembro.perfiles?.email || 'Miembro';

  const getMiembroInicial = (miembro: MiembroGrupo) =>
    getMiembroNombre(miembro).trim().charAt(0).toUpperCase() || 'M';

  const toOptionLabel = (value: string) =>
    value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const tipoOptions: DropdownOption<TipoMovimiento>[] = TIPOS_MOVIMIENTO.map((value) => ({
    label: toOptionLabel(value),
    value,
  }));

  const subtipoOptions: DropdownOption<SubtipoMovimiento>[] = SUBTIPOS_POR_TIPO[
    tipoMovimiento
  ].map((value) => ({
    label: toOptionLabel(value),
    value,
  }));

  const metodoOptions: DropdownOption<MetodoMovimiento>[] = METODOS.map((value) => ({
    label: toOptionLabel(value),
    value,
  }));

  const handleTipoMovimientoChange = (nuevoTipo: TipoMovimiento) => {
    setTipoMovimiento(nuevoTipo);
    setSubtipo(SUBTIPOS_POR_TIPO[nuevoTipo][0]);
  };

  const getDefaultPayerId = (userId = currentUserId) => {
    const currentMember = miembros.find((m) => m.usuario_id === userId);
    return currentMember?.usuario_id || miembros[0]?.usuario_id || userId || '';
  };

  const resetForm = (userId = currentUserId) => {
    setConcepto('');
    setMonto('');
    setTipoMovimiento('GASTO');
    setTipoDivision('IGUALITARIO');
    setSubtipo('SALIDAS');
    setMetodo('EFECTIVO');
    setFecha(new Date().toISOString().split('T')[0]);
    setPagadoPorUsuarioId(getDefaultPayerId(userId));
    setParticipantesSeleccionados(miembros.map((m) => m.usuario_id));
  };

  const abrirModalNuevoGasto = async () => {
    const authUser = await authService.getCurrentUser();
    const userId = authUser?.id || '';
    setCurrentUserId(userId);
    resetForm(userId);
    setModalVisible(true);
  };

  const toggleParticipante = (usuarioId: string) => {
    setParticipantesSeleccionados((prev) => {
      if (prev.includes(usuarioId)) {
        return prev.filter((id) => id !== usuarioId);
      }

      return [...prev, usuarioId];
    });
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

    if (!pagadoPorUsuarioId) {
      Alert.alert('Error', 'Selecciona quien pago el gasto');
      return;
    }

    if (participantesSeleccionados.length === 0) {
      Alert.alert('Error', 'Selecciona a quien le corresponde el gasto');
      return;
    }

    try {
      // Lógica de división igualitaria por defecto
      const montoPorPersona = Number((montoNumerico / participantesSeleccionados.length).toFixed(2));
      const participantesPayload = participantesSeleccionados.map((usuarioId) => ({
        usuarioId,
        montoCorrespondiente: montoPorPersona,
      }));

      const diferenciaRedondeo = Number(
        (montoNumerico - montoPorPersona * participantesPayload.length).toFixed(2)
      );
      if (participantesPayload.length > 0 && diferenciaRedondeo !== 0) {
        participantesPayload[0].montoCorrespondiente = Number(
          (participantesPayload[0].montoCorrespondiente + diferenciaRedondeo).toFixed(2)
        );
      }
      await gastoCompartidoService.crearGastoCompartido({
        movimiento: {
          fecha,
          tipo: tipoMovimiento,
          subtipo,
          concepto,
          metodo,
          monto: montoNumerico,
        },
        grupoId,
        tipoDivision,
        pagadoPorUsuarioId,
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
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              accessibilityLabel="Volver"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {grupo?.nombre || grupoNombre || 'Grupo'}
            </Text>
          </View>
          <Text style={styles.headerSubtitle}>{grupo?.descripcion || 'Gastos compartidos del grupo'}</Text>
        </View>

        <View style={styles.balanceContainer}>
          <StatCard
            label="Total Gastado en el Grupo"
            value={totalGastosGrupo}
            type="egreso"
          />
        </View>
        {/* Seccion de Miembros */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMiembrosExpanded((prev) => !prev)}
            style={styles.membersSummary}
          >
            <View>
              <Text style={styles.sectionTitleCompact}>MIEMBROS</Text>
              <Text style={styles.membersHint}>
                {miembrosExpanded ? 'Ocultar integrantes' : 'Ver integrantes'}
              </Text>
            </View>
            <View style={styles.membersCountContainer}>
              <Text style={styles.membersCount}>{miembros.length}</Text>
            </View>
          </TouchableOpacity>
          {miembrosExpanded && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miembrosScroll}>
              {miembros.map((m) => (
                <View key={m.id} style={styles.miembroChip}>
                  <Text style={styles.miembroAvatar}>{getMiembroInicial(m)}</Text>
                  <Text style={styles.miembroNombre}>{getMiembroNombre(m)}</Text>
                  <Text style={styles.miembroRol}>{m.rol}</Text>
                </View>
              ))}
            </ScrollView>
          )}
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
          onPress={abrirModalNuevoGasto}
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

          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />

          <View style={styles.formGroup}>
            <Text style={styles.formGroupTitle}>Detalle del gasto</Text>
            <DropdownField
              label="Tipo"
              value={tipoMovimiento}
              options={tipoOptions}
              onChange={(value) => handleTipoMovimientoChange(value as TipoMovimiento)}
            />
            <DropdownField
              label="Categoria"
              value={subtipo}
              options={subtipoOptions}
              onChange={(value) => setSubtipo(value as SubtipoMovimiento)}
            />
            <DropdownField
              label="Metodo de pago"
              value={metodo}
              options={metodoOptions}
              onChange={(value) => setMetodo(value as MetodoMovimiento)}
            />
          </View>

          <Text style={styles.label}>Quien pago</Text>
          <View style={styles.selectionList}>
            {miembros.map((m) => {
              const selected = pagadoPorUsuarioId === m.usuario_id;
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.85}
                  onPress={() => setPagadoPorUsuarioId(m.usuario_id)}
                  style={[styles.memberOption, selected && styles.memberOptionSelected]}
                >
                  <View style={[styles.memberOptionMark, selected && styles.memberOptionMarkSelected]}>
                    {selected && <Text style={styles.memberOptionMarkText}>OK</Text>}
                  </View>
                  <View style={styles.memberOptionContent}>
                    <Text style={styles.memberOptionName}>{getMiembroNombre(m)}</Text>
                    <Text style={styles.memberOptionMeta}>{m.usuario_id === currentUserId ? 'Usuario actual' : m.rol}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>A quien le corresponde</Text>
          <View style={styles.selectionList}>
            {miembros.map((m) => {
              const selected = participantesSeleccionados.includes(m.usuario_id);
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.85}
                  onPress={() => toggleParticipante(m.usuario_id)}
                  style={[styles.memberOption, selected && styles.memberOptionSelected]}
                >
                  <View style={[styles.memberOptionMark, selected && styles.memberOptionMarkSelected]}>
                    {selected && <Text style={styles.memberOptionMarkText}>OK</Text>}
                  </View>
                  <View style={styles.memberOptionContent}>
                    <Text style={styles.memberOptionName}>{getMiembroNombre(m)}</Text>
                    <Text style={styles.memberOptionMeta}>
                      {selected ? 'Incluido en partes iguales' : 'No incluido'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: 8,
    width: 32,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
  },
  headerTitle: {
    flex: 1,
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
  sectionTitleCompact: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  membersSummary: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
  },
  membersHint: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '700',
  },
  membersCountContainer: {
    alignItems: 'center',
    backgroundColor: '#EEEDFF',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    minWidth: 46,
    paddingHorizontal: 10,
  },
  membersCount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
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
  formGroup: {
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  formGroupTitle: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  selectionList: {
    gap: 8,
    marginBottom: 16,
  },
  memberOption: {
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  memberOptionSelected: {
    backgroundColor: '#EEEDFF',
    borderColor: colors.primary,
  },
  memberOptionMark: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: colors.gray[300],
    borderRadius: 10,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    marginRight: 10,
    width: 34,
  },
  memberOptionMarkSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  memberOptionMarkText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  memberOptionContent: {
    flex: 1,
  },
  memberOptionName: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '700',
  },
  memberOptionMeta: {
    color: colors.gray[500],
    fontSize: 12,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
});
