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
import { calendarioPagoService } from '@services/calendarioPagoService';
import { formatMoney } from '@utils/formatting';
import { Button, Input, CustomModal, PagoCard, StatCard } from '@components/index';
import { CalendarioPago } from '@models/index';

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CalendarioScreen({ navigation }: any) {
  const [pagos, setPagos] = useState<CalendarioPago[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicio, setServicio] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [pagoPendienteMovimiento, setPagoPendienteMovimiento] = useState<CalendarioPago | null>(null);

  const loadPagos = async () => {
    try {
      setPagos(await calendarioPagoService.listar());
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pagos');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPagos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPagos();
    setRefreshing(false);
  };

  const resetForm = () => {
    setServicio('');
    setMonto('');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleCreatePago = async () => {
    if (!servicio || !monto) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    try {
      const nuevoPago = await calendarioPagoService.crear({
        fecha,
        servicio,
        monto: parseFloat(monto),
        pago: false,
      });
      setPagos((pagosActuales) =>
        [...pagosActuales, nuevoPago].sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        )
      );
      cerrarModal();
      Alert.alert('Exito', 'Pago agregado al calendario');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el pago');
    }
  };

  const actualizarEstadoPago = async (pagoId: string, completed: boolean) => {
    try {
      const pagoActualizado = await calendarioPagoService.actualizar(pagoId, {
        pago: completed,
      });
      setPagos((pagosActuales) =>
        pagosActuales.map((pago) => (pago.id === pagoId ? pagoActualizado : pago))
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo actualizar el pago');
    }
  };

  const handleTogglePago = (pago: CalendarioPago, completed: boolean) => {
    if (!completed) {
      void actualizarEstadoPago(pago.id, false);
      return;
    }

    void actualizarEstadoPago(pago.id, true);
    setPagoPendienteMovimiento(pago);
  };

  const abrirMovimientoDesdePago = () => {
    if (!pagoPendienteMovimiento) return;
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    navigation.navigate('Movimientos', {
      prefillMovimiento: {
        concepto: pagoPendienteMovimiento.servicio,
        fecha: fechaHoy,
        tipo: 'GASTO',
        subtipo: 'FIJO',
        metodo: 'EFECTIVO',
        monto: String(pagoPendienteMovimiento.monto),
      },
    });
    setPagoPendienteMovimiento(null);
  };

  const cambiarMes = (desplazamiento: number) => {
    setDiasSeleccionados([]);
    setMesSeleccionado((mes) =>
      new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1)
    );
  };

  const claveMes = `${mesSeleccionado.getFullYear()}-${String(
    mesSeleccionado.getMonth() + 1
  ).padStart(2, '0')}`;
  const hoy = new Date();
  const claveHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate()
  ).padStart(2, '0')}`;
  const pagosDelMes = pagos.filter((pago) => pago.fecha.slice(0, 7) === claveMes);
  const pagosMostrados = diasSeleccionados.length
    ? pagosDelMes.filter((pago) => diasSeleccionados.includes(pago.fecha.slice(0, 10)))
    : pagosDelMes;
  const totalPendiente = pagosDelMes
    .filter((pago) => !pago.pago)
    .reduce((total, pago) => total + pago.monto, 0);
  const totalPendienteSeleccionado = pagosMostrados
    .filter((pago) => !pago.pago)
    .reduce((total, pago) => total + pago.monto, 0);
  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
  const primerDiaSemana = (new Date(
    mesSeleccionado.getFullYear(),
    mesSeleccionado.getMonth(),
    1
  ).getDay() + 6) % 7;
  const diasDelMes = new Date(
    mesSeleccionado.getFullYear(),
    mesSeleccionado.getMonth() + 1,
    0
  ).getDate();
  const celdasCalendario = Array.from(
    { length: primerDiaSemana + diasDelMes },
    (_, indice) => indice - primerDiaSemana + 1
  );

  const toggleDiaSeleccionado = (fechaDia: string) => {
    setDiasSeleccionados((dias) =>
      dias.includes(fechaDia)
        ? dias.filter((dia) => dia !== fechaDia)
        : [...dias, fechaDia]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerKicker}>PLANIFICACION</Text>
          <Text style={styles.headerTitle}>Calendario de pagos</Text>
          <Text style={styles.headerSubtitle}>Controla tus vencimientos del mes.</Text>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.monthLabel}>MES SELECCIONADO</Text>
            <Text style={styles.monthTitle}>{tituloMes}</Text>
          </View>
          <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <StatCard label="Total pendiente" value={totalPendiente} type="egreso" />
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.pendingDot]} />
              <Text style={styles.legendText}>Pendiente</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.paidDot]} />
              <Text style={styles.legendText}>Pagado</Text>
            </View>
          </View>
          <View style={styles.weekHeader}>
            {WEEK_DAYS.map((dia) => (
              <Text key={dia} style={styles.weekDay}>{dia}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {celdasCalendario.map((dia, indice) => {
              if (dia <= 0) return <View key={`empty-${indice}`} style={styles.dayCell} />;
              const fechaDia = `${claveMes}-${String(dia).padStart(2, '0')}`;
              const pagosDelDia = pagosDelMes.filter((pago) => pago.fecha.slice(0, 10) === fechaDia);
              const esSeleccionado = diasSeleccionados.includes(fechaDia);
              const esHoy = fechaDia === claveHoy;
              const contenidoDia = (
                <>
                  <Text style={[
                    styles.dayNumber,
                    esSeleccionado && styles.dayNumberSelected,
                    esHoy && styles.dayNumberToday,
                  ]}>{dia}</Text>
                  <View style={styles.dotsContainer}>
                    {pagosDelDia.some((pago) => !pago.pago) && (
                      <View style={[styles.dot, styles.pendingDot]} />
                    )}
                    {pagosDelDia.some((pago) => pago.pago) && (
                      <View style={[styles.dot, styles.paidDot]} />
                    )}
                  </View>
                </>
              );
              return (
                pagosDelDia.length ? (
                  <TouchableOpacity
                    key={fechaDia}
                    onPress={() => toggleDiaSeleccionado(fechaDia)}
                    style={[
                      styles.dayCell,
                      styles.dayCellTouchable,
                      esHoy && styles.dayCellToday,
                      esSeleccionado && styles.dayCellSelected,
                    ]}
                  >
                    {contenidoDia}
                  </TouchableOpacity>
                ) : (
                  <View key={fechaDia} style={[styles.dayCell, esHoy && styles.dayCellToday]}>{contenidoDia}</View>
                )
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          {pagoPendienteMovimiento && (
            <View style={styles.movementPrompt}>
              <Text style={styles.movementPromptTitle}>Registrar como movimiento?</Text>
              <Text style={styles.movementPromptText}>
                {pagoPendienteMovimiento.servicio} se marco como pagado. Queres cargarlo como gasto?
              </Text>
              <View style={styles.movementPromptActions}>
                <TouchableOpacity
                  onPress={() => setPagoPendienteMovimiento(null)}
                  style={styles.movementPromptSecondary}
                >
                  <Text style={styles.movementPromptSecondaryText}>No, gracias</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={abrirMovimientoDesdePago}
                  style={styles.movementPromptPrimary}
                >
                  <Text style={styles.movementPromptPrimaryText}>Si, cargar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {diasSeleccionados.length
                ? `Pagos seleccionados (${pagosMostrados.length})`
                : `Pagos del mes (${pagosMostrados.length})`}
            </Text>
            {diasSeleccionados.length > 0 && (
              <Text style={styles.selectedTotal}>
                Pendiente: {formatMoney(totalPendienteSeleccionado)}
              </Text>
            )}
          </View>
          {diasSeleccionados.length > 0 && (
            <TouchableOpacity onPress={() => setDiasSeleccionados([])}>
              <Text style={styles.clearSelection}>Limpiar seleccion</Text>
            </TouchableOpacity>
          )}
          {pagosMostrados.length === 0 ? (
            <Text style={styles.emptyText}>
              {diasSeleccionados.length
                ? 'No hay pagos para los dias seleccionados'
                : 'No hay pagos agendados en este mes'}
            </Text>
          ) : (
            pagosMostrados.map((pago) => (
              <PagoCard
                key={pago.id}
                pago={pago}
                onToggle={(completed) => handleTogglePago(pago, completed)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          accessibilityLabel="Nuevo pago"
          onPress={() => setModalVisible(true)}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalVisible}
        title="Nuevo Pago"
        onClose={cerrarModal}
        footer={
          <View style={styles.modalFooter}>
            <Button title="Cancelar" onPress={cerrarModal} variant="secondary" />
            <Button title="Agregar" onPress={handleCreatePago} variant="success" />
          </View>
        }
      >
        <View>
          <Input label="Servicio" placeholder="Nombre del servicio" value={servicio} onChangeText={setServicio} />
          <Input label="Monto" placeholder="0.00" value={monto} onChangeText={setMonto} keyboardType="decimal-pad" />
          <Input label="Fecha de Pago" placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </View>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 52,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerKicker: { color: '#DCD8FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff' },
  headerSubtitle: { color: '#DCD8FF', fontSize: 14, marginTop: 8 },
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20,
    marginTop: 18, padding: 14, backgroundColor: '#fff', borderRadius: 18, elevation: 2,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9,
  },
  monthButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  monthButtonText: { color: colors.primary, fontSize: 28, fontWeight: '500', lineHeight: 31 },
  monthLabel: { color: colors.gray[500], fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  monthTitle: { color: colors.dark, fontSize: 17, fontWeight: '800', marginTop: 3, textAlign: 'center', textTransform: 'capitalize' },
  statsContainer: { paddingHorizontal: 20, paddingTop: 18 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 20, marginTop: 4, padding: 16, elevation: 2, shadowColor: colors.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9 },
  legend: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { color: colors.gray[600], fontSize: 12, fontWeight: '600' },
  weekHeader: { flexDirection: 'row', marginBottom: 6 },
  weekDay: { width: '14.2857%', color: colors.gray[500], fontSize: 11, fontWeight: '800', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', minHeight: 54, alignItems: 'center', paddingTop: 7, borderRadius: 10 },
  dayCellTouchable: { justifyContent: 'flex-start' },
  dayCellToday: { borderWidth: 1.5, borderColor: colors.primary },
  dayCellSelected: { backgroundColor: '#EEEDFF' },
  dayNumber: { color: colors.dark, fontSize: 14, fontWeight: '700' },
  dayNumberToday: { color: colors.primary, fontWeight: '800' },
  dayNumberSelected: { color: colors.primary },
  dotsContainer: { flexDirection: 'row', gap: 3, minHeight: 8, marginTop: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pendingDot: { backgroundColor: colors.danger },
  paidDot: { backgroundColor: colors.success },
  section: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.dark },
  selectedTotal: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  movementPrompt: { backgroundColor: '#EEEDFF', borderRadius: 16, marginBottom: 18, padding: 16 },
  movementPromptTitle: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  movementPromptText: { color: colors.gray[600], fontSize: 13, lineHeight: 19, marginTop: 5 },
  movementPromptActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  movementPromptSecondary: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, flex: 1, paddingVertical: 11 },
  movementPromptSecondaryText: { color: colors.gray[600], fontSize: 12, fontWeight: '700' },
  movementPromptPrimary: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, flex: 1, paddingVertical: 11 },
  movementPromptPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  clearSelection: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: -6, marginBottom: 12 },
  emptyText: { color: colors.gray[500], fontSize: 14, paddingVertical: 18, textAlign: 'center' },
  fabContainer: { position: 'absolute', right: 20, bottom: 20 },
  fab: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success, elevation: 8, shadowColor: colors.dark, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '400', lineHeight: 36 },
  modalFooter: { flexDirection: 'row', gap: 8 },
});
