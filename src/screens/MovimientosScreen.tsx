import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, getMetodoColor } from '@utils/colors';
import { formatMoney } from '@utils/formatting';
import { movimientoService } from '@services/movimientoService';
import {
  Button,
  Input,
  CustomModal,
  MovimientoCard,
  StatCard,
  ConfirmDialog,
  DatePickerField,
  DropdownField,
  DropdownOption,
  SidebarMenuButton,
} from '@components/index';
import { Movimiento, TipoMovimiento, SubtipoMovimiento, MetodoMovimiento } from '@models/index';

const SUBTIPOS_POR_TIPO: Record<TipoMovimiento, SubtipoMovimiento[]> = {
  ENTRADA: ['SUELDO', 'BONO', 'OTRO'],
  GASTO: ['FIJO', 'BOLUDES', 'DEPTO', 'SALIDAS', 'SUPER', 'VIAJES','SC'],
  AHORRO: ['DOLAR'],
  INVERSION: ['CEDEARS'],
};

const METODOS: MetodoMovimiento[] = ['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO'];
const METODOS_TARJETA: MetodoMovimiento[] = ['VISA', 'AMEX', 'MERCADOPAGO'];
const TIPOS_MOVIMIENTO: TipoMovimiento[] = ['ENTRADA', 'GASTO', 'AHORRO', 'INVERSION'];
const CUOTAS_OPTIONS: DropdownOption<string>[] = [
  { label: 'Sin cuotas', value: '' },
  ...Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1);
    return { label: value, value };
  }),
];
type MovimientoModalMode = 'create' | 'detail' | 'edit';

const getCuotasData = (cuotaActual: string, totalCuotas: string) => {
  const cuotaText = cuotaActual.trim();
  const totalText = totalCuotas.trim();
  const hasCuotas = !!cuotaText || !!totalText;

  if (!hasCuotas) {
    return { hasCuotas: false, cuota: 0, total: 0, isValid: true };
  }

  const cuota = Number(cuotaText);
  const total = Number(totalText);
  const isValid =
    Number.isInteger(cuota) &&
    Number.isInteger(total) &&
    cuota >= 1 &&
    total >= cuota;

  return { hasCuotas, cuota, total, isValid };
};

export default function MovimientosScreen({ navigation, route }: any) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [movimientoModalMode, setMovimientoModalMode] = useState<MovimientoModalMode>('create');
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
  const [filtrosMetodo, setFiltrosMetodo] = useState<MetodoMovimiento[]>(METODOS);
  const [filtrosTipo, setFiltrosTipo] = useState<TipoMovimiento[]>(TIPOS_MOVIMIENTO);
  const [filtrosSubtipoGasto, setFiltrosSubtipoGasto] = useState<SubtipoMovimiento[]>(
    SUBTIPOS_POR_TIPO.GASTO
  );
  const [busqueda, setBusqueda] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);

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
    setMetodo('EFECTIVO');
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
    setMovimientoModalMode('create');
    setMovimientoSeleccionado(null);
    setConfirmandoBorrado(false);
    setCuotasPendientes(null);
    resetForm();
  };

  useEffect(() => {
    const metodoSeleccionado = route?.params?.filtroMetodo as MetodoMovimiento | undefined;
    if (metodoSeleccionado && METODOS.includes(metodoSeleccionado)) {
      setFiltrosMetodo([metodoSeleccionado]);
      navigation.setParams({ filtroMetodo: undefined });
    }
  }, [navigation, route?.params?.filtroMetodo]);

  useEffect(() => {
    const prefill = route?.params?.prefillMovimiento;
    if (!prefill) return;

    setMovimientoSeleccionado(null);
    setMovimientoModalMode('create');
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

  const cargarMovimientoEnFormulario = (movimiento: Movimiento) => {
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
  };

  const abrirDetalle = (movimiento: Movimiento) => {
    cargarMovimientoEnFormulario(movimiento);
    setMovimientoModalMode('detail');
    setModalVisible(true);
  };

  const activarEdicionMovimiento = () => {
    setMovimientoModalMode('edit');
    setConfirmandoBorrado(false);
  };

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

  const subtipoOptions: DropdownOption<SubtipoMovimiento>[] = SUBTIPOS_POR_TIPO[tipo].map(
    (value) => ({
      label: toOptionLabel(value),
      value,
    })
  );

  const metodoOptions: DropdownOption<MetodoMovimiento>[] = METODOS.map((value) => ({
    label: toOptionLabel(value),
    value,
  }));

  const handleTipoChange = (nuevoTipo: TipoMovimiento) => {
    setTipo(nuevoTipo);
    setSubtipo(SUBTIPOS_POR_TIPO[nuevoTipo][0]);
  };

  const handleCuotaActualChange = (value: string) => {
    setCuotaActual(value);
    if (value && (!totalCuotas || Number(totalCuotas) < Number(value))) {
      setTotalCuotas(value);
    }
  };

  const handleTotalCuotasChange = (value: string) => {
    setTotalCuotas(value);
    if (!value) {
      setCuotaActual('');
      return;
    }

    if (!cuotaActual || Number(cuotaActual) > Number(value)) {
      setCuotaActual('1');
    }
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
  const movimientosFiltrados = movimientosDelMes.filter((movimiento) => {
    const coincideMetodo = filtrosMetodo.includes(movimiento.metodo as MetodoMovimiento);
    const coincideTipo = filtrosTipo.includes(movimiento.tipo as TipoMovimiento);
    const coincideSubtipo =
      movimiento.tipo !== 'GASTO' ||
      filtrosSubtipoGasto.includes(movimiento.subtipo as SubtipoMovimiento);

    const textoBusqueda = busqueda.trim().toLowerCase();
    const coincideBusqueda = !textoBusqueda || [
      movimiento.concepto,
      movimiento.nota,
      movimiento.subtipo,
      movimiento.metodo,
    ].some((valor) => String(valor ?? '').toLowerCase().includes(textoBusqueda));

    return coincideMetodo && coincideTipo && coincideSubtipo && coincideBusqueda;
  });
  const balanceFiltrado = movimientosFiltrados.reduce(
    (balance, movimiento) =>
      balance + (movimiento.tipo === 'ENTRADA' ? movimiento.monto : -movimiento.monto),
    0
  );
  const filtroEsTarjeta = filtrosMetodo.length > 0 && filtrosMetodo.every((metodo) => METODOS_TARJETA.includes(metodo));
  const balanceMostrado = filtroEsTarjeta ? Math.abs(balanceFiltrado) : balanceFiltrado;
  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
  const alternarMetodo = (metodoSeleccionado: MetodoMovimiento) => {
    setFiltrosMetodo((actuales) =>
      actuales.includes(metodoSeleccionado)
        ? actuales.filter((metodo) => metodo !== metodoSeleccionado)
        : [...actuales, metodoSeleccionado]
    );
  };
  const alternarTipo = (tipoSeleccionado: TipoMovimiento) => {
    setFiltrosTipo((actuales) =>
      actuales.includes(tipoSeleccionado)
        ? actuales.filter((tipo) => tipo !== tipoSeleccionado)
        : [...actuales, tipoSeleccionado]
    );
  };
  const alternarSubtipoGasto = (subtipoSeleccionado: SubtipoMovimiento) => {
    setFiltrosSubtipoGasto((actuales) =>
      actuales.includes(subtipoSeleccionado)
        ? actuales.filter((subtipo) => subtipo !== subtipoSeleccionado)
        : [...actuales, subtipoSeleccionado]
    );
  };
  const filtrosActivos = filtrosMetodo.length + filtrosTipo.length;
  const filtrosCuenta = [
    filtrosMetodo.length < METODOS.length,
    filtrosTipo.length < TIPOS_MOVIMIENTO.length,
    filtrosTipo.includes('GASTO') && filtrosSubtipoGasto.length < SUBTIPOS_POR_TIPO.GASTO.length,
    busqueda.trim().length > 0,
  ].filter(Boolean).length;
  const balanceLabel = filtrosCuenta === 0 ? 'Balance del mes' : 'Balance filtrado';
  const totalEntradas = movimientosFiltrados
    .filter((movimiento) => movimiento.tipo === 'ENTRADA')
    .reduce((total, movimiento) => total + movimiento.monto, 0);
  const totalGastosFiltrados = movimientosFiltrados
    .filter((movimiento) => movimiento.tipo !== 'ENTRADA')
    .reduce((total, movimiento) => total + movimiento.monto, 0);
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltrosMetodo(METODOS);
    setFiltrosTipo(TIPOS_MOVIMIENTO);
    setFiltrosSubtipoGasto(SUBTIPOS_POR_TIPO.GASTO);
  };

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

    const { hasCuotas, cuota, total, isValid } = getCuotasData(cuotaActual, totalCuotas);
    if (!isValid) {
      Alert.alert('Error', 'Indica una cuota valida, por ejemplo 1 de 6');
      return;
    }
    const nuevaCompraId = hasCuotas
      ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (caracter) => {
          const aleatorio = Math.floor(Math.random() * 16);
          return (caracter === 'x' ? aleatorio : (aleatorio & 0x3) | 0x8).toString(16);
        })
      : undefined;
    const datosMovimiento = {
      fecha, tipo, subtipo, concepto, metodo,
      monto: parseFloat(monto),
      nota: nota || undefined,
      cuota_actual: hasCuotas ? cuota : undefined,
      total_cuotas: hasCuotas ? total : undefined,
      compra_id: nuevaCompraId,
    };

    if (hasCuotas && total > cuota) {
      setCuotasDialog({ datosMovimiento, cuota, total });
      return;
    }

    try {
      const nuevoMovimiento = await movimientoService.crear(datosMovimiento);
      setMovimientos([nuevoMovimiento, ...movimientos]);
      if (hasCuotas && total > cuota) {
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

    const { hasCuotas, cuota, total, isValid } = getCuotasData(cuotaActual, totalCuotas);
    if (!isValid) {
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
          cuota_actual: hasCuotas ? cuota : undefined,
          total_cuotas: hasCuotas ? total : undefined,
          compra_id: hasCuotas ? compraId : undefined,
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

  const isMovimientoReadOnly = movimientoModalMode === 'detail';
  const isMovimientoEditMode = movimientoModalMode === 'edit';
  const movimientoModalTitle =
    movimientoModalMode === 'create'
      ? 'Nuevo Movimiento'
      : isMovimientoReadOnly
        ? 'Detalle del Movimiento'
        : 'Editar Movimiento';

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SidebarMenuButton />
            <Text style={styles.headerTitle}>Movimientos</Text>
          </View>
        </View>

        <View style={styles.filtersPanel}>
          <View style={styles.monthSelector}>
            <TouchableOpacity accessibilityLabel="Mes anterior" onPress={() => cambiarMes(-1)} style={styles.monthButton}>
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.monthTitle}>{tituloMes}</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Mes siguiente" onPress={() => cambiarMes(1)} style={styles.monthButton}>
              <Text style={styles.monthButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="Buscar movimientos"
                onChangeText={setBusqueda}
                placeholder="Buscar movimiento"
                placeholderTextColor={colors.gray[400]}
                style={styles.searchInput}
                value={busqueda}
              />
            </View>
            <TouchableOpacity onPress={() => setFiltrosVisibles(true)} style={styles.filtersButton}>
              <Text style={styles.filtersButtonText}>Filtros{filtrosCuenta > 0 ? ` (${filtrosCuenta})` : ''}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilters}>
            {METODOS.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                onPress={() => alternarMetodo(opcion)}
                style={[styles.quickFilter, filtrosMetodo.includes(opcion) && styles.quickFilterSelected]}
              >
                <Text style={[styles.quickFilterText, filtrosMetodo.includes(opcion) && styles.quickFilterTextSelected]}>{opcion}</Text>
              </TouchableOpacity>
            ))}
            {filtrosCuenta > 0 && (
              <TouchableOpacity onPress={limpiarFiltros} style={styles.clearQuickFilter}>
                <Text style={styles.clearQuickFilterText}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.balanceContainer}>
          <StatCard
            label={balanceLabel}
            value={balanceMostrado}
            type={filtroEsTarjeta ? 'egreso' : 'neutral'}
            color={filtrosMetodo.length === 1 && filtroEsTarjeta ? getMetodoColor(filtrosMetodo[0]) : undefined}
          />
          {filtrosCuenta > 0 && (
            <View style={styles.balanceDetails}>
              <Text style={styles.balanceDetailPositive}>Entradas {formatMoney(totalEntradas)}</Text>
              <Text style={styles.balanceDetailNegative}>Gastos {formatMoney(totalGastosFiltrados)}</Text>
            </View>
          )}
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
                onPress={() => abrirDetalle(mov)}
                hideSign={filtroEsTarjeta}
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
            setMovimientoModalMode('create');
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
        title={movimientoModalTitle}
        onClose={cerrarModal}
        footer={
          <View style={styles.modalFooter}>
            {isMovimientoReadOnly ? (
              <>
                <Button title="Cerrar" onPress={cerrarModal} variant="secondary" />
                <Button title="Editar" onPress={activarEdicionMovimiento} variant="primary" />
              </>
            ) : (
              <>
                <Button title="Cancelar" onPress={cerrarModal} variant="secondary" />
                <Button
                  title={isMovimientoEditMode ? 'Guardar' : 'Crear'}
                  onPress={isMovimientoEditMode ? handleUpdateMovimiento : handleCreateMovimiento}
                  variant="primary"
                />
              </>
            )}
          </View>
        }
      >
        <View>
          <Input
            label="Concepto"
            placeholder="Descripcion del movimiento"
            value={concepto}
            onChangeText={setConcepto}
            editable={!isMovimientoReadOnly}
          />

          <Input
            label="Monto"
            placeholder="0.00"
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
            editable={!isMovimientoReadOnly}
          />

          <DatePickerField
            label="Fecha"
            value={fecha}
            onChange={setFecha}
            disabled={isMovimientoReadOnly}
          />

          <View style={styles.formGroup}>
            <Text style={styles.formGroupTitle}>Detalle del movimiento</Text>
            <DropdownField
              label="Tipo"
              value={tipo}
              options={tipoOptions}
              onChange={handleTipoChange}
              disabled={isMovimientoReadOnly}
            />
            <DropdownField
              label="Categoria"
              value={subtipo}
              options={subtipoOptions}
              onChange={(value) => setSubtipo(value as SubtipoMovimiento)}
              disabled={isMovimientoReadOnly}
            />
            <DropdownField
              label="Metodo de pago"
              value={metodo}
              options={metodoOptions}
              onChange={(value) => setMetodo(value as MetodoMovimiento)}
              disabled={isMovimientoReadOnly}
            />
          </View>

          <Text style={styles.label}>Cuotas (opcional)</Text>
          <View style={styles.installmentsContainer}>
            <View style={styles.installmentInput}>
              <DropdownField
                label="Cuota actual"
                value={cuotaActual}
                options={CUOTAS_OPTIONS}
                onChange={handleCuotaActualChange}
                disabled={isMovimientoReadOnly}
              />
            </View>
            <Text style={styles.installmentSeparator}>de</Text>
            <View style={styles.installmentInput}>
              <DropdownField
                label="Total cuotas"
                value={totalCuotas}
                options={CUOTAS_OPTIONS}
                onChange={handleTotalCuotasChange}
                disabled={isMovimientoReadOnly}
              />
            </View>
          </View>

          {cuotasPendientes && !isMovimientoReadOnly && (
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

          <Input
            label="Nota (opcional)"
            placeholder="Agregar una nota"
            value={nota}
            onChangeText={setNota}
            multiline
            numberOfLines={3}
            editable={!isMovimientoReadOnly}
          />

          {movimientoSeleccionado && !isMovimientoReadOnly && (
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
      <CustomModal
        visible={filtrosVisibles}
        title="Filtrar movimientos"
        onClose={() => setFiltrosVisibles(false)}
        footer={
          <View style={styles.filterSheetFooter}>
            <TouchableOpacity onPress={limpiarFiltros} style={styles.sheetClearButton}>
              <Text style={styles.sheetClearText}>Limpiar todo</Text>
            </TouchableOpacity>
            <Button title="Aplicar filtros" onPress={() => setFiltrosVisibles(false)} variant="primary" />
          </View>
        }
      >
        <Text style={styles.sheetSectionTitle}>Métodos de pago</Text>
        <View style={styles.sheetOptions}>
          {METODOS.map((opcion) => (
            <TouchableOpacity
              key={opcion}
              onPress={() => alternarMetodo(opcion)}
              style={[styles.sheetOption, filtrosMetodo.includes(opcion) && { backgroundColor: getMetodoColor(opcion) }]}
            >
              <Text style={[styles.sheetOptionText, filtrosMetodo.includes(opcion) && styles.sheetOptionTextSelected]}>{opcion}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sheetSectionTitle}>Tipo de movimiento</Text>
        <View style={styles.sheetOptions}>
          {TIPOS_MOVIMIENTO.map((opcion) => (
            <TouchableOpacity
              key={opcion}
              onPress={() => alternarTipo(opcion)}
              style={[styles.sheetOption, filtrosTipo.includes(opcion) && styles.sheetOptionSelected]}
            >
              <Text style={[styles.sheetOptionText, filtrosTipo.includes(opcion) && styles.sheetOptionTextSelected]}>{opcion}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {filtrosTipo.includes('GASTO') && (
          <>
            <Text style={styles.sheetSectionTitle}>Tipo de gasto</Text>
            <View style={styles.sheetOptions}>
              {SUBTIPOS_POR_TIPO.GASTO.map((opcion) => (
                <TouchableOpacity
                  key={opcion}
                  onPress={() => alternarSubtipoGasto(opcion)}
                  style={[styles.sheetOption, filtrosSubtipoGasto.includes(opcion) && styles.sheetOptionSelected]}
                >
                  <Text style={[styles.sheetOptionText, filtrosSubtipoGasto.includes(opcion) && styles.sheetOptionTextSelected]}>{opcion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filtersPanel: {
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    marginHorizontal: 20,
    marginTop: 6,
    padding: 6,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  searchRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 6 },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 38,
    paddingHorizontal: 10,
  },
  searchIcon: { color: colors.gray[500], fontSize: 22, marginRight: 6 },
  searchInput: { color: colors.dark, flex: 1, fontSize: 13, paddingVertical: 0 },
  filtersButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  filtersButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  quickFilters: { gap: 6, paddingBottom: 2, paddingTop: 8 },
  quickFilter: { backgroundColor: colors.gray[100], borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  quickFilterSelected: { backgroundColor: colors.primary },
  quickFilterText: { color: colors.gray[600], fontSize: 10, fontWeight: '700' },
  quickFilterTextSelected: { color: '#fff' },
  clearQuickFilter: { borderColor: colors.danger, borderRadius: 8, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 },
  clearQuickFilterText: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 0,
    marginTop: 0,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  filtersContainer: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  filterLabel: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 6,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  filterOption: {
    backgroundColor: colors.gray[100],
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    color: colors.gray[600],
    fontSize: 11,
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
  balanceDetails: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4, marginTop: -4 },
  balanceDetailPositive: { color: colors.success, fontSize: 11, fontWeight: '700' },
  balanceDetailNegative: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  filterSheetFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sheetClearButton: { paddingVertical: 12 },
  sheetClearText: { color: colors.danger, fontSize: 13, fontWeight: '800' },
  sheetSectionTitle: { color: colors.dark, fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 8 },
  sheetOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetOption: { backgroundColor: colors.gray[100], borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 },
  sheetOptionSelected: { backgroundColor: colors.primary },
  sheetOptionText: { color: colors.gray[600], fontSize: 11, fontWeight: '700' },
  sheetOptionTextSelected: { color: '#fff' },
  monthButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 25,
  },
  monthLabel: {
    color: colors.gray[500],
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  monthTitle: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
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


