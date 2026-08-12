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
import { colors, getMetodoColor } from '@utils/colors';
import { movimientoService } from '@services/movimientoService';
import { Button, Input, CustomModal, MovimientoCard, StatCard, ConfirmDialog } from '@components/index';
import { Movimiento, TipoMovimiento, SubtipoMovimiento, MetodoMovimiento } from '@models/index';

const SUBTIPOS_POR_TIPO: Record<TipoMovimiento, SubtipoMovimiento[]> = {
  ENTRADA: ['SUELDO', 'BONO', 'OTRO'],
  GASTO: ['FIJO', 'BOLUDES', 'DEPTO', 'SALIDAS', 'SUPER'],
  AHORRO: ['DOLAR'],
  INVERSION: ['CEDEARS'],
};

const METODOS: MetodoMovimiento[] = ['VISA', 'AMEX', 'EFECTIVO', 'MERCADOPAGO'];
type FiltroMetodo = MetodoMovimiento;

export default function MovimientosScreen({ navigation, route }: any) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimiento>('GASTO');
  const [subtipo, setSubtipo] = useState<SubtipoMovimiento>('SUPER');
  const [metodo, setMetodo] = useState<MetodoMovimiento>('EFECTIVO');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cuotaActual, setCuotaActual] = useState('');
  const [totalCuotas, setTotalCuotas] = useState('');
  const [compraId, setCompraId] = useState<string | undefined>();
  const [cuotasPendientes, setCuotasPendientes] = useState<{
    datosMovimiento: any;
    cuota: number;
    total: number;
  } | null>(null);
  const [cuotasDialog, setCuotasDialog] = useState<{
    datosMovimiento: any;
    cuota: number;
    total: number;
  } | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [filtroMetodo, setFiltroMetodo] = useState<FiltroMetodo>('VISA');

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await movimientoService.listar();
      setMovimientos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMovimientos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovimientos();
    setRefreshing(false);
  };

  const resetForm = () => {
    setTipo('GASTO');
    setSubtipo('FIJO');
    setMetodo('VISA');
    setConcepto('');
    setMonto('');
    setNota('');
    setFecha(new Date().toISOString().split('T')[0]);
    setCuotaActual('');
    setTotalCuotas('');
    setCompraId(undefined);
    setCuotasPendientes(null);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMovimientoSeleccionado(null);
    setConfirmandoBorrado(false);
    setCuotasPendientes(null);
    resetForm();
  };

  useEffect(() => {
    const prefill = route?.params?.prefillMovimiento;
    if (!prefill) return;

    setMovimientoSeleccionado(null);
    setTipo(prefill.tipo as TipoMovimiento);
    setSubtipo(prefill.subtipo as SubtipoMovimiento);
    setMetodo(prefill.metodo as MetodoMovimiento);
    setConcepto(prefill.concepto);
    setMonto(prefill.monto);
    setNota('');
    setFecha(prefill.fecha);
    setCuotaActual('');
    setTotalCuotas('');
    setCompraId(undefined);
    setModalVisible(true);
    navigation.setParams({ prefillMovimiento: undefined });
  }, [navigation, route?.params?.prefillMovimiento]);

  const abrirEdicion = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setTipo(movimiento.tipo as TipoMovimiento);
    setSubtipo(movimiento.subtipo as SubtipoMovimiento);
    setMetodo(movimiento.metodo as MetodoMovimiento);
    setConcepto(movimiento.concepto);
    setMonto(String(movimiento.monto));
    setNota(movimiento.nota ?? '');
    setFecha(movimiento.fecha.slice(0, 10));
    setCuotaActual(movimiento.cuota_actual ? String(movimiento.cuota_actual) : '');
    setTotalCuotas(movimiento.total_cuotas ? String(movimiento.total_cuotas) : '');
    setCompraId(movimiento.compra_id);
    setConfirmandoBorrado(false);
    setModalVisible(true);
  };

  const handleTipoChange = (nuevoTipo: TipoMovimiento) => {
    setTipo(nuevoTipo);
    setSubtipo(SUBTIPOS_POR_TIPO[nuevoTipo][0]);
  };

  const cambiarMes = (desplazamiento: number) => {
    setMesSeleccionado((mes) =>
      new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1)
    );
  };

  const claveMesSeleccionado = `${mesSeleccionado.getFullYear()}-${String(
    mesSeleccionado.getMonth() + 1
  ).padStart(2, '0')}`;
  const movimientosDelMes = movimientos.filter((movimiento) =>
    movimiento.fecha.slice(0, 7) === claveMesSeleccionado
  );
  const movimientosFiltrados = movimientosDelMes.filter(
    (movimiento) => movimiento.metodo === filtroMetodo
  );
  const balanceFiltrado = movimientosFiltrados.reduce(
    (balance, movimiento) =>
      balance + (movimiento.tipo === 'ENTRADA' ? movimiento.monto : -movimiento.monto),
    0
  );
  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  const crearCuotasSiguientes = async (
    datosBase: any,
    cuotaInicial: number,
    total: number
  ) => {
    try {
      const [anio, mes, dia] = datosBase.fecha.split('-').map(Number);
      const cuotas = await Promise.all(
        Array.from({ length: total - cuotaInicial }, (_, indice) => {
          const fechaCuota = new Date(anio, mes - 1 + indice + 1, 1);
          const ultimoDia = new Date(
            fechaCuota.getFullYear(),
            fechaCuota.getMonth() + 1,
            0
          ).getDate();
          const fecha = `${fechaCuota.getFullYear()}-${String(fechaCuota.getMonth() + 1).padStart(2, '0')}-${String(Math.min(dia, ultimoDia)).padStart(2, '0')}`;
          return movimientoService.crear({
            ...datosBase,
            fecha,
            cuota_actual: cuotaInicial + indice + 1,
          });
        })
      );
      setMovimientos((movimientosActuales) => [...movimientosActuales, ...cuotas]);
      Alert.alert('Exito', 'Se crearon las cuotas restantes');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudieron crear las cuotas restantes');
    }
  };

  const guardarCuotaInicial = async (crearSiguientes: boolean) => {
    if (!cuotasPendientes) return;

    const { datosMovimiento, cuota, total } = cuotasPendientes;
    try {
      const nuevoMovimiento = await movimientoService.crear(datosMovimiento);
      setMovimientos((movimientosActuales) => [nuevoMovimiento, ...movimientosActuales]);
      cerrarModal();
      if (crearSiguientes) {
        await crearCuotasSiguientes(datosMovimiento, cuota, total);
      } else {
        Alert.alert('Exito', 'Se creo solo la cuota actual');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el movimiento');
    }
  };

  const guardarCuotaDesdeDialog = async (
    crearSiguientes: boolean,
    pendiente = cuotasDialog
  ) => {
    if (!pendiente) return;
    const { datosMovimiento, cuota, total } = pendiente;
    try {
      const nuevoMovimiento = await movimientoService.crear(datosMovimiento);
      setMovimientos((movimientosActuales) => [nuevoMovimiento, ...movimientosActuales]);
      cerrarModal();
      if (crearSiguientes) {
        await crearCuotasSiguientes(datosMovimiento, cuota, total);
      } else {
        Alert.alert('Exito', 'Se creo solo la cuota actual');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el movimiento');
    }
  };

  const handleCreateMovimiento = async () => {
    if (!concepto || !monto) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    const cuota = cuotaActual ? parseInt(cuotaActual, 10) : 0;
    const total = totalCuotas ? parseInt(totalCuotas, 10) : 0;
    if ((cuota && !total) || (!cuota && total) || cuota < 1 || total < cuota) {
      Alert.alert('Error', 'Indica una cuota valida, por ejemplo 1 de 6');
      return;
    }
    const nuevaCompraId = total
      ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (caracter) => {
          const aleatorio = Math.floor(Math.random() * 16);
          return (caracter === 'x' ? aleatorio : (aleatorio & 0x3) | 0x8).toString(16);
        })
      : undefined;
    const datosMovimiento = {
      fecha, tipo, subtipo, concepto, metodo,
      monto: parseFloat(monto),
      nota: nota || undefined,
      cuota_actual: total ? cuota : undefined,
      total_cuotas: total || undefined,
      compra_id: nuevaCompraId,
    };

    if (total > cuota) {
      setCuotasDialog({ datosMovimiento, cuota, total });
      return;
    }

    try {
      const nuevoMovimiento = await movimientoService.crear(datosMovimiento);
      setMovimientos([nuevoMovimiento, ...movimientos]);
      if (total > cuota) {
        resetForm();
        setModalVisible(false);
        Alert.alert(
          'Crear cuotas siguientes?',
          `Se pueden crear las ${total - cuota} cuotas restantes en los proximos meses.`,
          [
            { text: 'No, solo esta cuota' },
            {
              text: 'Crear cuotas',
              onPress: () => void crearCuotasSiguientes(datosMovimiento, cuota, total),
            },
          ]
        );
        return;
      }
      resetForm();
      setModalVisible(false);
      Alert.alert('Éxito', 'Movimiento creado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el movimiento');
    }
  };

  const handleUpdateMovimiento = async () => {
    if (!movimientoSeleccionado || !concepto || !monto) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    const cuota = cuotaActual ? parseInt(cuotaActual, 10) : 0;
    const total = totalCuotas ? parseInt(totalCuotas, 10) : 0;
    if ((cuota && !total) || (!cuota && total) || cuota < 1 || total < cuota) {
      Alert.alert('Error', 'Indica una cuota valida, por ejemplo 1 de 6');
      return;
    }

    try {
      const movimientoActualizado = await movimientoService.actualizar(
        movimientoSeleccionado.id,
        {
          fecha,
          tipo,
          subtipo,
          concepto,
          metodo,
          monto: parseFloat(monto),
          nota: nota || undefined,
          cuota_actual: total ? cuota : undefined,
          total_cuotas: total || undefined,
          compra_id: total ? compraId : undefined,
        }
      );
      setMovimientos(
        movimientos.map((movimiento) =>
          movimiento.id === movimientoActualizado.id ? movimientoActualizado : movimiento
        )
      );
      cerrarModal();
      Alert.alert('Exito', 'Movimiento actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el movimiento');
    }
  };

  const handleDeleteMovimiento = async (id: string) => {
    Alert.alert('Eliminar', '¿Estás seguro de que deseas eliminar este movimiento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await movimientoService.eliminar(id);
            setMovimientos(movimientos.filter((m) => m.id !== id));
            if (movimientoSeleccionado?.id === id) {
              cerrarModal();
            }
            Alert.alert('Éxito', 'Movimiento eliminado');
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el movimiento');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const eliminarDesdeEdicion = async () => {
    if (!movimientoSeleccionado) return;

    const id = movimientoSeleccionado.id;
    try {
      await movimientoService.eliminar(id);
      setMovimientos((movimientosActuales) =>
        movimientosActuales.filter((movimiento) => movimiento.id !== id)
      );
      cerrarModal();
      Alert.alert('Exito', 'Movimiento eliminado');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo eliminar el movimiento');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movimientos</Text>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity
            accessibilityLabel="Mes anterior"
            onPress={() => cambiarMes(-1)}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.monthLabel}>MES SELECCIONADO</Text>
            <Text style={styles.monthTitle}>{tituloMes}</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Mes siguiente"
            onPress={() => cambiarMes(1)}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>METODO DE PAGO</Text>
          <View style={styles.filterOptions}>
            {METODOS.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                onPress={() => setFiltroMetodo(opcion)}
                style={[
                  styles.filterOption,
                  filtroMetodo === opcion && styles.filterOptionSelected,
                  filtroMetodo === opcion && {
                    backgroundColor: getMetodoColor(opcion),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filtroMetodo === opcion && styles.filterOptionTextSelected,
                    filtroMetodo === opcion && opcion === 'MERCADOPAGO' && styles.filterOptionTextDark,
                  ]}
                >
                  {opcion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <StatCard
            label={`Balance ${filtroMetodo}`}
            value={balanceFiltrado}
            type="neutral"
          />
        </View>

        {movimientosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay movimientos para este filtro</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {movimientosFiltrados.map((mov) => (
              <MovimientoCard
                key={mov.id}
                movimiento={mov}
                onPress={() => abrirEdicion(mov)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          accessibilityLabel="Nuevo movimiento"
          onPress={() => {
            setMovimientoSeleccionado(null);
            resetForm();
            setModalVisible(true);
          }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalVisible}
        title={movimientoSeleccionado ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        onClose={cerrarModal}
        footer={
          <View style={styles.modalFooter}>
            <Button
              title="Cancelar"
              onPress={cerrarModal}
              variant="secondary"
            />
            <Button
              title={movimientoSeleccionado ? 'Guardar' : 'Crear'}
              onPress={movimientoSeleccionado ? handleUpdateMovimiento : handleCreateMovimiento}
              variant="primary"
            />
          </View>
        }
      >
        <View>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeButtons}>
            <Button
              title="Entrada"
              onPress={() => handleTipoChange('ENTRADA')}
              variant={tipo === 'ENTRADA' ? 'success' : 'secondary'}
              size="small"
            />
            <Button
              title="Gasto"
              onPress={() => handleTipoChange('GASTO')}
              variant={tipo === 'GASTO' ? 'danger' : 'secondary'}
              size="small"
            />
            <Button
              title="Ahorro"
              onPress={() => handleTipoChange('AHORRO')}
              variant={tipo === 'AHORRO' ? 'danger' : 'secondary'}
              size="small"
            />
            <Button
              title="Inversión"
              onPress={() => handleTipoChange('INVERSION')}
              variant={tipo === 'INVERSION' ? 'danger' : 'secondary'}
              size="small"
            />
          </View>

          <Input
            label="Concepto"
            placeholder="Descripción del movimiento"
            value={concepto}
            onChangeText={setConcepto}
          />

          <Input
            label="Monto"
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

          <Text style={styles.label}>Cuotas (opcional)</Text>
          <View style={styles.installmentsContainer}>
            <View style={styles.installmentInput}>
              <Input
                label="Cuota actual"
                placeholder="Ej. 1"
                value={cuotaActual}
                onChangeText={setCuotaActual}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.installmentSeparator}>de</Text>
            <View style={styles.installmentInput}>
              <Input
                label="Total cuotas"
                placeholder="Ej. 6"
                value={totalCuotas}
                onChangeText={setTotalCuotas}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {cuotasPendientes && (
            <View style={styles.installmentWarning}>
              <Text style={styles.installmentWarningTitle}>Crear cuotas siguientes?</Text>
              <Text style={styles.installmentWarningText}>
                Se generaran las {cuotasPendientes.total - cuotasPendientes.cuota} cuotas restantes en los proximos meses.
              </Text>
              <View style={styles.installmentActions}>
                <TouchableOpacity
                  onPress={() => void guardarCuotaInicial(false)}
                  style={styles.installmentSecondaryButton}
                >
                  <Text style={styles.installmentSecondaryText}>Solo esta cuota</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void guardarCuotaInicial(true)}
                  style={styles.installmentPrimaryButton}
                >
                  <Text style={styles.installmentPrimaryText}>Crear todas</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.optionsContainer}>
            {SUBTIPOS_POR_TIPO[tipo].map((s) => (
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
                color={metodo === m ? getMetodoColor(m) : undefined}
                size="small"
              />
            ))}
          </View>

          <Input
            label="Nota (opcional)"
            placeholder="Agregar una nota"
            value={nota}
            onChangeText={setNota}
            multiline
            numberOfLines={3}
          />

          {movimientoSeleccionado && (
            <View style={styles.deleteSection}>
              {confirmandoBorrado ? (
                <View style={styles.deleteWarning}>
                  <Text style={styles.deleteWarningTitle}>Eliminar movimiento?</Text>
                  <Text style={styles.deleteWarningText}>
                    Esta accion no se puede deshacer.
                  </Text>
                  <View style={styles.deleteActions}>
                    <TouchableOpacity
                      onPress={() => setConfirmandoBorrado(false)}
                      style={styles.deleteCancelButton}
                    >
                      <Text style={styles.deleteCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void eliminarDesdeEdicion()}
                      style={styles.deleteConfirmButton}
                    >
                      <Text style={styles.deleteConfirmText}>Si, eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setDeleteDialogVisible(true)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Borrar movimiento</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </CustomModal>
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Eliminar movimiento?"
        message="Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={() => {
          setDeleteDialogVisible(false);
          void eliminarDesdeEdicion();
        }}
      />
      <ConfirmDialog
        visible={!!cuotasDialog}
        title="Crear cuotas siguientes?"
        message={cuotasDialog ? `Se pueden crear las ${cuotasDialog.total - cuotasDialog.cuota} cuotas restantes en los proximos meses.` : ''}
        cancelLabel="Solo esta cuota"
        confirmLabel="Crear todas"
        onCancel={() => {
          const pendiente = cuotasDialog;
          setCuotasDialog(null);
          void guardarCuotaDesdeDialog(false, pendiente);
        }}
        onConfirm={() => {
          const pendiente = cuotasDialog;
          setCuotasDialog(null);
          void guardarCuotaDesdeDialog(true, pendiente);
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
    paddingBottom: 14,
    paddingTop: 42,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  filterLabel: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    color: colors.gray[600],
    fontSize: 12,
    fontWeight: '700',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  filterOptionTextDark: {
    color: colors.dark,
  },
  balanceContainer: {
    marginTop: 18,
    marginHorizontal: 20,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 31,
  },
  monthLabel: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  monthTitle: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  fabContainer: { position: 'absolute', right: 20, bottom: 20 },
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
  fabText: { color: '#fff', fontSize: 32, fontWeight: '400', lineHeight: 36 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  installmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installmentInput: {
    flex: 1,
  },
  installmentSeparator: {
    color: colors.gray[500],
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  installmentWarning: {
    backgroundColor: '#EEEDFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  installmentWarningTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  installmentWarningText: {
    color: colors.gray[600],
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  installmentActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  installmentSecondaryButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 11,
  },
  installmentSecondaryText: {
    color: colors.gray[600],
    fontSize: 12,
    fontWeight: '700',
  },
  installmentPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 11,
  },
  installmentPrimaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  deleteSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 13,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  deleteWarning: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 16,
  },
  deleteWarningTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
  deleteWarningText: {
    color: colors.gray[600],
    fontSize: 13,
    marginTop: 5,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  deleteCancelButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 11,
  },
  deleteCancelText: {
    color: colors.gray[600],
    fontSize: 13,
    fontWeight: '700',
  },
  deleteConfirmButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 11,
  },
  deleteConfirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});


