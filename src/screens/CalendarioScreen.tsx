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
import { Button, Input, CustomModal, PagoCard, StatCard, ConfirmDialog } from '@components/index';
import { CalendarioPago } from '@models/index';

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SERVICE_SUGGESTIONS = ['Edenor', 'Naturgy', 'Internet', 'VISA', 'AMEX', 'MPAGO'];

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const parseLocalDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid =
    parsedDate.getFullYear() === Number(year) &&
    parsedDate.getMonth() === Number(month) - 1 &&
    parsedDate.getDate() === Number(day);

  return isValid ? parsedDate : null;
};

const getPagoDateKey = (value: string) => {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (dateOnly) return value;

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value.slice(0, 10) : toDateKey(parsedDate);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const parseMonto = (value: string) => {
  const trimmed = value.trim();
  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');
  let normalized = trimmed;

  if (hasComma && hasDot) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = trimmed.replace(',', '.');
  } else if (hasDot && !/^\d+\.\d{1,2}$/.test(trimmed)) {
    normalized = trimmed.replace(/\./g, '');
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : NaN;
};

export default function CalendarioScreen({ navigation }: any) {
  const [pagos, setPagos] = useState<CalendarioPago[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicio, setServicio] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(toDateKey(new Date()));
  const [savingPago, setSavingPago] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [mesFormularioPago, setMesFormularioPago] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [formErrors, setFormErrors] = useState({
    servicio: '',
    monto: '',
    fecha: '',
  });
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [pagoPendienteMovimiento, setPagoPendienteMovimiento] = useState<CalendarioPago | null>(null);
  const [pagoDialog, setPagoDialog] = useState<CalendarioPago | null>(null);

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
    setFecha(toDateKey(new Date()));
    setDatePickerVisible(false);
    setMesFormularioPago(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setFormErrors({ servicio: '', monto: '', fecha: '' });
    setSavingPago(false);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleCreatePago = async () => {
    const servicioLimpio = servicio.trim();
    const montoNumerico = parseMonto(monto);
    const fechaValida = parseLocalDate(fecha);
    const nextErrors = {
      servicio: servicioLimpio ? '' : 'Ingresa el nombre del servicio',
      monto:
        Number.isFinite(montoNumerico) && montoNumerico > 0
          ? ''
          : 'Ingresa un monto mayor a cero',
      fecha: fechaValida ? '' : 'Usa una fecha valida con formato YYYY-MM-DD',
    };

    setFormErrors(nextErrors);

    if (nextErrors.servicio || nextErrors.monto || nextErrors.fecha) {
      return;
    }

    if (savingPago) return;

    try {
      setSavingPago(true);
      const nuevoPago = await calendarioPagoService.crear({
        fecha: toDateKey(fechaValida),
        servicio: servicioLimpio,
        monto: montoNumerico,
        pago: false,
      });
      setPagos((pagosActuales) =>
        [...pagosActuales, nuevoPago].sort(
          (a, b) => getPagoDateKey(a.fecha).localeCompare(getPagoDateKey(b.fecha))
        )
      );
      cerrarModal();
      Alert.alert('Exito', 'Pago agregado al calendario');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el pago');
    } finally {
      setSavingPago(false);
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
    setPagoDialog(pago);
  };

  const handleDeletePago = (pago: CalendarioPago) => {
    Alert.alert(
      'Eliminar pago',
      `¿Estás seguro de que deseas eliminar el pago de "${pago.servicio}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await calendarioPagoService.eliminar(pago.id);
              setPagos((pagosActuales) => pagosActuales.filter((p) => p.id !== pago.id));
              Alert.alert('Éxito', 'Pago eliminado correctamente');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'No se pudo eliminar el pago');
            }
          },
        },
      ]
    );
  };

  const abrirModalNuevoPago = () => {
    const fechaInicial =
      diasSeleccionados.length === 1 ? parseLocalDate(diasSeleccionados[0]) ?? new Date() : new Date();

    if (diasSeleccionados.length === 1) {
      setFecha(diasSeleccionados[0]);
    } else {
      setFecha(toDateKey(new Date()));
    }
    setMesFormularioPago(new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), 1));
    setFormErrors({ servicio: '', monto: '', fecha: '' });
    setModalVisible(true);
  };

  const abrirMovimientoDesdePago = (pago: CalendarioPago) => {
    navigation.navigate('Movimientos', {
      prefillMovimiento: {
        concepto: pago.servicio,
        fecha: toDateKey(new Date()),
        tipo: 'GASTO',
        subtipo: 'FIJO',
        metodo: 'EFECTIVO',
        monto: String(pago.monto),
      },
    });
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
  const claveHoy = toDateKey(hoy);
  const claveManana = toDateKey(addDays(hoy, 1));
  const claveProximoLunes = hoy.getDay() === 5 ? toDateKey(addDays(hoy, 3)) : '';
  const pagosDelMes = pagos.filter((pago) => getPagoDateKey(pago.fecha).slice(0, 7) === claveMes);
  const pagosMostrados = diasSeleccionados.length
    ? pagosDelMes.filter((pago) => diasSeleccionados.includes(getPagoDateKey(pago.fecha)))
    : pagosDelMes;
  const pagosVencidos = pagos.filter((pago) => !pago.pago && getPagoDateKey(pago.fecha) <= claveHoy);
  const totalPagosVencidos = pagosVencidos.reduce((total, pago) => total + pago.monto, 0);
  const pagosManana = pagos.filter((pago) => !pago.pago && getPagoDateKey(pago.fecha) === claveManana);
  const totalPagosManana = pagosManana.reduce((total, pago) => total + pago.monto, 0);
  const pagosProximoLunes = claveProximoLunes
    ? pagos.filter((pago) => !pago.pago && getPagoDateKey(pago.fecha) === claveProximoLunes)
    : [];
  const totalPagosProximoLunes = pagosProximoLunes.reduce((total, pago) => total + pago.monto, 0);
  const mensajeProximoPago =
    pagosManana.length > 0
      ? `Manana tenes ${pagosManana.length} pago${pagosManana.length === 1 ? '' : 's'} por ${formatMoney(totalPagosManana)}`
      : pagosProximoLunes.length > 0
        ? `El lunes tenes ${pagosProximoLunes.length} pago${pagosProximoLunes.length === 1 ? '' : 's'} por ${formatMoney(totalPagosProximoLunes)}`
        : 'Sin pagos vencidos';
  const totalPagado = pagosDelMes
    .filter((pago) => pago.pago)
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

  const seleccionarFechaPago = (date: Date) => {
    setFecha(toDateKey(date));
    setMesFormularioPago(new Date(date.getFullYear(), date.getMonth(), 1));
    setDatePickerVisible(false);
    setFormErrors((errors) => ({ ...errors, fecha: '' }));
  };

  const cambiarMesFormularioPago = (desplazamiento: number) => {
    setMesFormularioPago((mes) => new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1));
  };

  const fechaPreview = parseLocalDate(fecha);
  const montoPreview = parseMonto(monto);
  const claveMesFormularioPago = `${mesFormularioPago.getFullYear()}-${String(
    mesFormularioPago.getMonth() + 1
  ).padStart(2, '0')}`;
  const tituloMesFormularioPago = mesFormularioPago.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
  const primerDiaSemanaFormulario = (new Date(
    mesFormularioPago.getFullYear(),
    mesFormularioPago.getMonth(),
    1
  ).getDay() + 6) % 7;
  const diasMesFormulario = new Date(
    mesFormularioPago.getFullYear(),
    mesFormularioPago.getMonth() + 1,
    0
  ).getDate();
  const celdasCalendarioFormulario = Array.from(
    { length: primerDiaSemanaFormulario + diasMesFormulario },
    (_, indice) => indice - primerDiaSemanaFormulario + 1
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendario de pagos</Text>
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
          {totalPagosVencidos > 0 ? (
            <View style={styles.overdueMessage}>
              <Text style={styles.overdueTitle}>Tenes pagos vencidos</Text>
              <Text style={styles.overdueAmount}>{formatMoney(totalPagosVencidos)}</Text>
            </View>
          ) : (
            <View style={styles.alDiaContainer}>
              <Text style={styles.alDiaText}>Estás al día</Text>
              <Text style={styles.alDiaSubtext}>{mensajeProximoPago}</Text>
            </View>
          )}
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
              const pagosDelDia = pagosDelMes.filter((pago) => getPagoDateKey(pago.fecha) === fechaDia);
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
                  onPress={() => {
                    if (pagoPendienteMovimiento) abrirMovimientoDesdePago(pagoPendienteMovimiento);
                  }}
                  style={styles.movementPromptPrimary}
                >
                  <Text style={styles.movementPromptPrimaryText}>Si, cargar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <ConfirmDialog
            visible={!!pagoDialog}
            title="Registrar como movimiento?"
            message={pagoDialog ? `${pagoDialog.servicio} se marco como pagado. Queres cargarlo como gasto?` : ''}
            cancelLabel="No, gracias"
            confirmLabel="Si, cargar"
            onCancel={() => setPagoDialog(null)}
            onConfirm={() => {
              if (!pagoDialog) return;
              const pago = pagoDialog;
              setPagoDialog(null);
              abrirMovimientoDesdePago(pago);
            }}
          />
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
                onDelete={() => handleDeletePago(pago)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          accessibilityLabel="Nuevo pago"
          onPress={abrirModalNuevoPago}
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
            <Button
              title="Agregar"
              onPress={handleCreatePago}
              variant="success"
              disabled={savingPago}
              loading={savingPago}
            />
          </View>
        }
      >
        <View>
          <Text style={styles.formHint}>
            Carga el vencimiento una vez y despues marcalo como pagado desde el calendario.
          </Text>
          <Input
            label="Servicio"
            placeholder="Ej: Internet, alquiler, tarjeta"
            value={servicio}
            onChangeText={(value) => {
              setServicio(value);
              if (formErrors.servicio) setFormErrors((errors) => ({ ...errors, servicio: '' }));
            }}
            error={formErrors.servicio}
          />
          <View style={styles.suggestionRow}>
            {SERVICE_SUGGESTIONS.map((suggestion) => {
              const isSelected = servicio.trim().toUpperCase() === suggestion.toUpperCase();

              return (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => {
                    setServicio(suggestion);
                    setFormErrors((errors) => ({ ...errors, servicio: '' }));
                  }}
                  style={[styles.suggestionChip, isSelected && styles.suggestionChipSelected]}
                >
                  <Text style={[styles.suggestionText, isSelected && styles.suggestionTextSelected]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Input
            label="Monto"
            placeholder="Ej: 12500,50"
            value={monto}
            onChangeText={(value) => {
              setMonto(value);
              if (formErrors.monto) setFormErrors((errors) => ({ ...errors, monto: '' }));
            }}
            keyboardType="decimal-pad"
            error={formErrors.monto}
          />
          <Text style={styles.label}>Fecha de pago</Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisible((visible) => !visible)}
            style={[styles.dateField, formErrors.fecha && styles.dateFieldError]}
          >
            <Text style={styles.dateFieldText}>
              {fechaPreview
                ? fechaPreview.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Seleccionar fecha'}
            </Text>
            <Text style={styles.dateFieldAction}>{datePickerVisible ? 'Cerrar' : 'Cambiar'}</Text>
          </TouchableOpacity>
          {datePickerVisible && (
            <View style={styles.formCalendar}>
              <View style={styles.formCalendarHeader}>
                <TouchableOpacity
                  onPress={() => cambiarMesFormularioPago(-1)}
                  style={styles.formCalendarButton}
                >
                  <Text style={styles.formCalendarButtonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.formCalendarTitle}>{tituloMesFormularioPago}</Text>
                <TouchableOpacity
                  onPress={() => cambiarMesFormularioPago(1)}
                  style={styles.formCalendarButton}
                >
                  <Text style={styles.formCalendarButtonText}>{'>'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formWeekHeader}>
                {WEEK_DAYS.map((dia) => (
                  <Text key={dia} style={styles.formWeekDay}>
                    {dia}
                  </Text>
                ))}
              </View>
              <View style={styles.formCalendarGrid}>
                {celdasCalendarioFormulario.map((dia, indice) => {
                  if (dia <= 0) {
                    return <View key={`form-empty-${indice}`} style={styles.formDayCell} />;
                  }

                  const fechaDia = `${claveMesFormularioPago}-${String(dia).padStart(2, '0')}`;
                  const isSelected = fechaDia === fecha;
                  const isToday = fechaDia === claveHoy;

                  return (
                    <TouchableOpacity
                      key={fechaDia}
                      onPress={() => seleccionarFechaPago(parseLocalDate(fechaDia) ?? new Date())}
                      style={[
                        styles.formDayCell,
                        styles.formDayCellTouchable,
                        isToday && styles.formDayCellToday,
                        isSelected && styles.formDayCellSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formDayNumber,
                          isToday && styles.formDayNumberToday,
                          isSelected && styles.formDayNumberSelected,
                        ]}
                      >
                        {dia}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                onPress={() => seleccionarFechaPago(new Date())}
                style={styles.todayButton}
              >
                <Text style={styles.todayButtonText}>Hoy</Text>
              </TouchableOpacity>
            </View>
          )}
          {formErrors.fecha ? <Text style={styles.formCalendarErrorText}>{formErrors.fecha}</Text> : null}
          <View style={styles.paymentPreview}>
            <Text style={styles.previewLabel}>Resumen</Text>
            <Text style={styles.previewTitle}>{servicio.trim() || 'Nuevo pago'}</Text>
            <Text style={styles.previewText}>
              {Number.isFinite(montoPreview) && montoPreview > 0
                ? formatMoney(montoPreview)
                : '$ 0,00'}
              {fechaPreview
                ? ` - vence el ${fechaPreview.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}`
                : ' - fecha pendiente'}
            </Text>
          </View>
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
    paddingBottom: 14,
    paddingTop: 42,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20,
    marginTop: 12, padding: 10, backgroundColor: '#fff', borderRadius: 16, elevation: 2,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9,
  },
  monthButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  monthButtonText: { color: colors.primary, fontSize: 24, fontWeight: '500', lineHeight: 28 },
  monthLabel: { color: colors.gray[500], fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  monthTitle: { color: colors.dark, fontSize: 15, fontWeight: '800', marginTop: 2, textAlign: 'center', textTransform: 'capitalize' },
  statsContainer: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCol: { flex: 1 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 20, marginTop: 0, padding: 16, elevation: 2, shadowColor: colors.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9 },
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
  alDiaContainer: { backgroundColor: '#E8F5E9', borderRadius: 18, padding: 18 },
  alDiaText: { color: colors.success, fontSize: 16, fontWeight: '800' },
  alDiaSubtext: { color: colors.gray[600], fontSize: 13, marginTop: 6 },
  overdueMessage: { backgroundColor: '#FDECEF', borderRadius: 18, marginBottom: 12, padding: 18 },
  overdueTitle: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  overdueAmount: { color: colors.danger, fontSize: 24, fontWeight: '900', marginTop: 6 },
  formHint: { color: colors.gray[600], fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { color: colors.dark, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -6, marginBottom: 16 },
  suggestionChip: { backgroundColor: colors.gray[100], borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  suggestionChipSelected: { backgroundColor: '#EEEDFF' },
  suggestionText: { color: colors.gray[700], fontSize: 12, fontWeight: '700' },
  suggestionTextSelected: { color: colors.primary },
  dateField: { alignItems: 'center', backgroundColor: colors.gray[50], borderColor: colors.gray[200], borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, minHeight: 48, paddingHorizontal: 14 },
  dateFieldError: { borderColor: colors.danger },
  dateFieldText: { color: colors.dark, flex: 1, fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  dateFieldAction: { color: colors.primary, fontSize: 12, fontWeight: '800', marginLeft: 10 },
  formCalendar: { alignSelf: 'flex-start', backgroundColor: colors.gray[50], borderColor: colors.gray[200], borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 10, width: 292 },
  formCalendarHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  formCalendarButton: { alignItems: 'center', backgroundColor: colors.gray[100], borderRadius: 9, height: 28, justifyContent: 'center', width: 28 },
  formCalendarButtonText: { color: colors.primary, fontSize: 16, fontWeight: '800', lineHeight: 20 },
  formCalendarTitle: { color: colors.dark, fontSize: 14, fontWeight: '800', textTransform: 'capitalize' },
  formWeekHeader: { flexDirection: 'row', marginBottom: 4 },
  formWeekDay: { color: colors.gray[500], fontSize: 10, fontWeight: '800', textAlign: 'center', width: '14.2857%' },
  formCalendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  formDayCell: { alignItems: 'center', borderRadius: 8, height: 32, justifyContent: 'center', width: '14.2857%' },
  formDayCellTouchable: { backgroundColor: 'transparent' },
  formDayCellToday: { borderColor: colors.primary, borderWidth: 1.2 },
  formDayCellSelected: { backgroundColor: colors.primary },
  formDayNumber: { color: colors.dark, fontSize: 12, fontWeight: '700' },
  formDayNumberToday: { color: colors.primary, fontWeight: '800' },
  formDayNumberSelected: { color: '#fff' },
  todayButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#EEEDFF', borderRadius: 10, marginTop: 8, paddingHorizontal: 10, paddingVertical: 7 },
  todayButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  formCalendarErrorText: { color: colors.danger, fontSize: 12, marginTop: -6, marginBottom: 14 },
  paymentPreview: { backgroundColor: colors.gray[50], borderColor: colors.gray[200], borderRadius: 16, borderWidth: 1, padding: 14 },
  previewLabel: { color: colors.gray[500], fontSize: 11, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase' },
  previewTitle: { color: colors.dark, fontSize: 16, fontWeight: '800' },
  previewText: { color: colors.gray[600], fontSize: 13, lineHeight: 18, marginTop: 4 },
});




