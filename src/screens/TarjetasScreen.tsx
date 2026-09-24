import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SidebarMenuButton, StatCard } from '@components/index';
import { tarjetaService } from '@services/tarjetaService';
import { movimientoService } from '@services/movimientoService';
import { colors, getMetodoColor } from '@utils/colors';
import { formatDate, formatMoney } from '@utils/formatting';
import { DatoTarjeta, Movimiento } from '@models/index';

const TARJETAS = ['VISA', 'AMEX', 'MERCADOPAGO'] as const;
type Tarjeta = (typeof TARJETAS)[number];
type VistaTarjetas = 'mes' | 'anio';

export default function TarjetasScreen({ navigation }: any) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [datosTarjeta, setDatosTarjeta] = useState<DatoTarjeta[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [vistaSeleccionada, setVistaSeleccionada] = useState<VistaTarjetas>('mes');
  const [tarjetaAnualSeleccionada, setTarjetaAnualSeleccionada] = useState<Tarjeta>('VISA');
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const loadData = async () => {
    try {
      const [movimientosData, tarjetasData] = await Promise.all([
        movimientoService.listar(),
        tarjetaService.listarPorPeriodo(
          mesSeleccionado.getFullYear(),
          mesSeleccionado.getMonth() + 1
        ),
      ]);
      setMovimientos(movimientosData);
      setDatosTarjeta(tarjetasData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos de tarjetas');
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [mesSeleccionado])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const cambiarMes = (desplazamiento: number) => {
    setMesSeleccionado((mes) =>
      new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1)
    );
  };

  const cambiarAnio = (desplazamiento: number) => {
    setMesSeleccionado((mes) =>
      new Date(mes.getFullYear() + desplazamiento, mes.getMonth(), 1)
    );
  };

  const calcularBalance = (items: Movimiento[]) =>
    items.reduce(
      (total, movimiento) =>
        total + (movimiento.tipo === 'ENTRADA' ? movimiento.monto : -movimiento.monto),
      0
    );

  const claveMes = `${mesSeleccionado.getFullYear()}-${String(
    mesSeleccionado.getMonth() + 1
  ).padStart(2, '0')}`;
  const movimientosDelMes = movimientos.filter(
    (movimiento) =>
      movimiento.fecha.slice(0, 7) === claveMes &&
      TARJETAS.includes(movimiento.metodo as Tarjeta)
  );
  const totalesPorTarjeta = TARJETAS.map((tarjeta) => {
    const balance = calcularBalance(
      movimientosDelMes.filter((movimiento) => movimiento.metodo === tarjeta)
    );

    return {
      tarjeta,
      total: Math.abs(balance),
      color: getMetodoColor(tarjeta),
      dato: datosTarjeta.find((item) => item.tarjeta === tarjeta),
    };
  });
  const totalMensualTarjetas = totalesPorTarjeta.reduce((sum, item) => sum + item.total, 0);
  const anioSeleccionado = mesSeleccionado.getFullYear();
  const totalesPorMes = Array.from({ length: 12 }, (_, index) => {
    const fechaMes = new Date(anioSeleccionado, index, 1);
    const claveMesAnual = `${anioSeleccionado}-${String(index + 1).padStart(2, '0')}`;
    const totales = TARJETAS.map((tarjeta) => {
      const movimientosTarjetaMes = movimientos.filter(
        (movimiento) =>
          movimiento.fecha.slice(0, 7) === claveMesAnual &&
          movimiento.metodo === tarjeta
      );

      return {
        tarjeta,
        total: Math.abs(calcularBalance(movimientosTarjetaMes)),
        color: getMetodoColor(tarjeta),
      };
    });

    return {
      mes: fechaMes.toLocaleDateString('es-AR', { month: 'long' }),
      totales,
    };
  });
  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
  const totalesAnualesSeleccionados = totalesPorMes.map((item) => ({
    mes: item.mes,
    total:
      item.totales.find((total) => total.tarjeta === tarjetaAnualSeleccionada)?.total ?? 0,
  }));
  const maximoTotalAnual = Math.max(
    ...totalesAnualesSeleccionados.map((item) => item.total),
    1
  );
  const colorTarjetaAnual = getMetodoColor(tarjetaAnualSeleccionada);
  const periodSelector = vistaSeleccionada === 'mes' ? (
    <View style={styles.periodSelector}>
      <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.periodButton}>
        <Text style={styles.periodButtonText}>{'<'}</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.periodTitle}>{tituloMes}</Text>
      </View>
      <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.periodButton}>
        <Text style={styles.periodButtonText}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.periodSelector}>
      <TouchableOpacity onPress={() => cambiarAnio(-1)} style={styles.periodButton}>
        <Text style={styles.periodButtonText}>{'<'}</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.periodLabel}>AÑO SELECCIONADO</Text>
        <Text style={styles.periodTitle}>{anioSeleccionado}</Text>
      </View>
      <TouchableOpacity onPress={() => cambiarAnio(1)} style={styles.periodButton}>
        <Text style={styles.periodButtonText}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SidebarMenuButton />
          <Text style={styles.title}>Tarjetas</Text>
        </View>
      </View>

      <View style={styles.periodControls}>
        <View style={styles.viewSelector}>
          <TouchableOpacity
            onPress={() => setVistaSeleccionada('mes')}
            style={[styles.viewOption, vistaSeleccionada === 'mes' && styles.viewOptionSelected]}
          >
            <Text style={[styles.viewOptionText, vistaSeleccionada === 'mes' && styles.viewOptionTextSelected]}>
              Mes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVistaSeleccionada('anio')}
            style={[styles.viewOption, vistaSeleccionada === 'anio' && styles.viewOptionSelected]}
          >
            <Text style={[styles.viewOptionText, vistaSeleccionada === 'anio' && styles.viewOptionTextSelected]}>
              Totales año
            </Text>
          </TouchableOpacity>
        </View>
        {periodSelector}
      </View>

      {vistaSeleccionada === 'mes' ? (
        <>
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Balance total</Text>
            <StatCard label="Todas las tarjetas" value={totalMensualTarjetas} type="neutral" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalle por tarjeta</Text>
            {totalesPorTarjeta.map((item) => {
              const porcentaje =
                totalMensualTarjetas > 0 ? (item.total / totalMensualTarjetas) * 100 : 0;

              return (
                <TouchableOpacity
                  key={item.tarjeta}
                  activeOpacity={0.82}
                  onPress={() => navigation.navigate('Movimientos', { filtroMetodo: item.tarjeta })}
                  style={styles.cardRow}
                >
                  <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardName}>{item.tarjeta}</Text>
                      <Text style={styles.balanceValue}>{formatMoney(item.total)}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: item.color,
                            width: `${porcentaje}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.cardPercent}>{porcentaje.toFixed(1)}% del total</Text>
                    {item.dato ? (
                      <View style={styles.dateRow}>
                        <View>
                          <Text style={styles.dateLabel}>CIERRE</Text>
                          <Text style={styles.dateValue}>{formatDate(item.dato.fecha_cierre)}</Text>
                        </View>
                        <View>
                          <Text style={styles.dateLabel}>VENCIMIENTO</Text>
                          <Text style={styles.dateValue}>
                            {formatDate(item.dato.fecha_vencimiento)}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.noDates}>Sin fechas cargadas para este mes</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Totales {anioSeleccionado}</Text>
            <View style={styles.annualCardSelector}>
              {TARJETAS.map((tarjeta) => {
                const seleccionado = tarjeta === tarjetaAnualSeleccionada;
                const color = getMetodoColor(tarjeta);

                return (
                  <TouchableOpacity
                    key={tarjeta}
                    onPress={() => setTarjetaAnualSeleccionada(tarjeta)}
                    style={[
                      styles.annualCardOption,
                      seleccionado && { backgroundColor: color, borderColor: color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.annualCardOptionText,
                        seleccionado && styles.annualCardOptionTextSelected,
                      ]}
                    >
                      {tarjeta}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.annualChartCard}>
              <View style={styles.annualChartHeader}>
                <View>
                  <Text style={styles.annualChartTitle}>{tarjetaAnualSeleccionada}</Text>
                  <Text style={styles.annualChartSubtitle}>Consumo mensual</Text>
                </View>
                <Text style={[styles.annualChartTotal, { color: colorTarjetaAnual }]}> 
                  {formatMoney(totalesAnualesSeleccionados.reduce((sum, item) => sum + item.total, 0))}
                </Text>
              </View>

              <View style={styles.chartArea}>
                {totalesAnualesSeleccionados.map((item) => (
                  <View key={item.mes} style={styles.chartColumn}>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            backgroundColor: colorTarjetaAnual,
                            height: `${Math.max((item.total / maximoTotalAnual) * 100, item.total ? 8 : 2)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartMonth}>{item.mes.slice(0, 3)}</Text>
                  </View>
                ))}
              </View>

            </View>

            <View style={styles.annualTotalsList}>
              {totalesAnualesSeleccionados.map((item, index) => (
                <View
                  key={item.mes}
                  style={[styles.annualTotalRow, index % 2 === 1 && styles.annualTotalRowAlternate]}
                >
                  <Text style={styles.annualTotalMonth}>{item.mes}</Text>
                  <Text style={[styles.annualTotalValue, { color: colorTarjetaAnual }]}>
                    {formatMoney(item.total)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { color: '#fff', fontSize: 19, fontWeight: '800' },
  periodControls: {
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 6,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  viewSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  viewOption: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 8,
  },
  viewOptionSelected: { backgroundColor: colors.primary },
  viewOptionText: { color: colors.gray[600], fontSize: 12, fontWeight: '800' },
  viewOptionTextSelected: { color: '#fff' },
  periodSelector: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    padding: 2,
  },
  periodButton: {
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  periodButtonText: { color: colors.primary, fontSize: 20, fontWeight: '700', lineHeight: 25 },
  periodLabel: {
    color: colors.gray[500],
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  periodTitle: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  statsContainer: { paddingHorizontal: 20, paddingTop: 20 },
  section: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  sectionTitle: { color: colors.dark, fontSize: 19, fontWeight: '800', marginBottom: 12 },
  cardRow: {
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 118,
    overflow: 'hidden',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
  },
  cardAccent: { width: 7 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardName: { color: colors.dark, fontSize: 17, fontWeight: '800' },
  balanceValue: { color: colors.dark, fontSize: 16, fontWeight: '800' },
  progressTrack: {
    backgroundColor: colors.gray[100],
    borderRadius: 6,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { borderRadius: 6, height: 8 },
  cardPercent: { color: colors.gray[500], fontSize: 11, fontWeight: '700', marginTop: 7 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dateLabel: { color: colors.gray[500], fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  dateValue: { color: colors.dark, fontSize: 14, fontWeight: '700', marginTop: 4 },
  noDates: { color: colors.gray[500], fontSize: 13, marginTop: 14 },
  annualCardSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  annualCardOption: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 4,
  },
  annualCardOptionText: {
    color: colors.gray[600],
    fontSize: 11,
    fontWeight: '800',
  },
  annualCardOptionTextSelected: { color: '#fff' },
  annualChartCard: {
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    padding: 14,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  annualChartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  annualChartTitle: { color: colors.dark, fontSize: 19, fontWeight: '800' },
  annualChartSubtitle: { color: colors.gray[500], fontSize: 11, marginTop: 2 },
  annualChartTotal: { fontSize: 16, fontWeight: '800' },
  chartArea: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: 180,
    justifyContent: 'space-between',
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  chartBarTrack: {
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    height: 112,
    justifyContent: 'flex-end',
    marginHorizontal: 2,
    overflow: 'hidden',
    width: '68%',
  },
  chartBar: { borderRadius: 4, minHeight: 2, width: '100%' },
  chartMonth: {
    color: colors.gray[600],
    fontSize: 9,
    marginTop: 7,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  annualTotalsList: {
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  annualTotalRow: {
    alignItems: 'center',
    borderBottomColor: colors.gray[100],
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  annualTotalRowAlternate: { backgroundColor: colors.gray[50] },
  annualTotalMonth: { color: colors.gray[700], fontSize: 14, fontWeight: '700' },
  annualTotalValue: { fontSize: 14, fontWeight: '800' },
});
