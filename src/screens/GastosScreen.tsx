import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Movimiento, SubtipoMovimiento } from '@models/index';
import { movimientoService } from '@services/movimientoService';
import { colors } from '@utils/colors';
import { formatMoney } from '@utils/formatting';
import { SidebarMenuButton, StatCard } from '@components/index';

const SUBTIPOS_GASTO: SubtipoMovimiento[] = [
  'FIJO',
  'BOLUDES',
  'DEPTO',
  'SALIDAS',
  'SUPER',
  'VIAJES',
];

const SUBTIPO_COLORS: Record<string, string> = {
  FIJO: '#4F46E5',
  BOLUDES: '#EC4899',
  DEPTO: '#0F766E',
  SALIDAS: '#F97316',
  SUPER: '#16A34A',
  VIAJES: '#0284C7',
};
type VistaGastos = 'mes' | 'anio';
type SubtipoAnual = SubtipoMovimiento | 'TOTAL';

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export default function GastosScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [vistaSeleccionada, setVistaSeleccionada] = useState<VistaGastos>('mes');
  const [subtipoAnualSeleccionado, setSubtipoAnualSeleccionado] =
    useState<SubtipoAnual>('FIJO');

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await movimientoService.listar();
      setMovimientos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadMovimientos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovimientos();
    setRefreshing(false);
  };

  const cambiarMes = (desplazamiento: number) => {
    setMesSeleccionado((mes) =>
      new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1)
    );
  };

  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  const totalesPorSubtipo = useMemo(() => {
    const claveMesSeleccionado = getMonthKey(mesSeleccionado);
    const totales = SUBTIPOS_GASTO.reduce<Record<string, number>>((acc, subtipo) => {
      acc[subtipo] = 0;
      return acc;
    }, {});

    movimientos.forEach((movimiento) => {
      if (
        movimiento.tipo === 'GASTO' &&
        movimiento.fecha.slice(0, 7) === claveMesSeleccionado &&
        SUBTIPOS_GASTO.includes(movimiento.subtipo as SubtipoMovimiento)
      ) {
        totales[movimiento.subtipo] += Number(movimiento.monto);
      }
    });

    return SUBTIPOS_GASTO.map((subtipo, index) => ({
      subtipo,
      total: totales[subtipo],
      color: SUBTIPO_COLORS[subtipo],
      index,
    })).sort((a, b) => b.total - a.total || a.index - b.index);
  }, [mesSeleccionado, movimientos]);

  const totalGastos = totalesPorSubtipo.reduce((sum, item) => sum + item.total, 0);
  const anioSeleccionado = mesSeleccionado.getFullYear();
  const totalesAnualesPorSubtipo = Array.from({ length: 12 }, (_, index) => {
    const claveMes = `${anioSeleccionado}-${String(index + 1).padStart(2, '0')}`;
    const total = movimientos
      .filter(
        (movimiento) =>
          movimiento.tipo === 'GASTO' &&
          (subtipoAnualSeleccionado === 'TOTAL' ||
            movimiento.subtipo === subtipoAnualSeleccionado) &&
          movimiento.fecha.slice(0, 7) === claveMes
      )
      .reduce((sum, movimiento) => sum + Number(movimiento.monto), 0);

    return {
      mes: new Date(anioSeleccionado, index, 1).toLocaleDateString('es-AR', { month: 'long' }),
      total,
    };
  });
  const maximoTotalAnual = Math.max(...totalesAnualesPorSubtipo.map((item) => item.total), 1);
  const colorSubtipoAnual =
    subtipoAnualSeleccionado === 'TOTAL'
      ? colors.danger
      : SUBTIPO_COLORS[subtipoAnualSeleccionado];
  const totalesAnualesPorTipo = SUBTIPOS_GASTO.map((subtipo) => ({
    subtipo,
    total: movimientos
      .filter(
        (movimiento) =>
          movimiento.tipo === 'GASTO' &&
          movimiento.subtipo === subtipo &&
          movimiento.fecha.slice(0, 4) === String(anioSeleccionado)
      )
      .reduce((sum, movimiento) => sum + Number(movimiento.monto), 0),
    color: SUBTIPO_COLORS[subtipo],
  }));
  const totalAnualGastos = totalesAnualesPorTipo.reduce((sum, item) => sum + item.total, 0);

  const cambiarAnio = (desplazamiento: number) => {
    setMesSeleccionado((mes) => new Date(mes.getFullYear() + desplazamiento, mes.getMonth(), 1));
  };

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
            <Text style={styles.headerTitle}>Gastos</Text>
          </View>
        </View>

        <View style={styles.periodControls}>
          <View style={styles.viewSelector}>
            {(['mes', 'anio'] as const).map((vista) => (
              <TouchableOpacity
                key={vista}
                onPress={() => setVistaSeleccionada(vista)}
                style={[styles.viewOption, vistaSeleccionada === vista && styles.viewOptionSelected]}
              >
                <Text style={[styles.viewOptionText, vistaSeleccionada === vista && styles.viewOptionTextSelected]}>
                  {vista === 'mes' ? 'Mes' : 'Totales año'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              accessibilityLabel={vistaSeleccionada === 'mes' ? 'Mes anterior' : 'Año anterior'}
              onPress={() => (vistaSeleccionada === 'mes' ? cambiarMes(-1) : cambiarAnio(-1))}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>{'<'}</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.monthLabel}>
                {vistaSeleccionada === 'mes' ? 'MES SELECCIONADO' : 'AÑO SELECCIONADO'}
              </Text>
              <Text style={styles.monthTitle}>
                {vistaSeleccionada === 'mes' ? tituloMes : anioSeleccionado}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityLabel={vistaSeleccionada === 'mes' ? 'Mes siguiente' : 'Año siguiente'}
              onPress={() => (vistaSeleccionada === 'mes' ? cambiarMes(1) : cambiarAnio(1))}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
          {vistaSeleccionada === 'anio' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subtipoSelector}
            >
              {(['TOTAL', ...SUBTIPOS_GASTO] as const).map((subtipo) => {
                const selected = subtipo === subtipoAnualSeleccionado;
                const color = subtipo === 'TOTAL' ? colors.danger : SUBTIPO_COLORS[subtipo];
                return (
                  <TouchableOpacity
                    key={subtipo}
                    onPress={() => setSubtipoAnualSeleccionado(subtipo)}
                    style={[styles.subtipoOption, selected && { backgroundColor: color, borderColor: color }]}
                  >
                    <Text style={[styles.subtipoOptionText, selected && styles.subtipoOptionTextSelected]}>
                      {subtipo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {vistaSeleccionada === 'mes' ? <>
        <View style={styles.totalContainer}>
          <StatCard
            label="Total gastos"
            value={totalGastos}
            type="egreso"
            color={colors.danger}
          />
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionLabel}>GASTOS POR SUBTIPO</Text>

          {totalesPorSubtipo.map((item) => {
            const porcentaje = totalGastos > 0 ? (item.total / totalGastos) * 100 : 0;

            return (
              <View key={item.subtipo} style={styles.expenseRow}>
                <View style={[styles.expenseAccent, { backgroundColor: item.color }]} />
                <View style={styles.expenseContent}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseTitle}>{item.subtipo}</Text>
                    <Text style={styles.expenseAmount}>{formatMoney(item.total)}</Text>
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
                  <Text style={styles.expensePercent}>{porcentaje.toFixed(1)}% del total</Text>
                </View>
              </View>
            );
          })}

          {!loading && totalGastos === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay gastos cargados para este mes</Text>
            </View>
          )}
        </View>
        </> : (
          <View style={styles.annualSection}>
            {subtipoAnualSeleccionado === 'TOTAL' ? (
              <View style={styles.annualChartCard}>
                <View style={styles.annualChartHeader}>
                  <View>
                    <Text style={styles.annualChartTitle}>TOTAL</Text>
                    <Text style={styles.annualChartSubtitle}>Distribución anual</Text>
                  </View>
                  <Text style={[styles.annualChartTotal, { color: colors.danger }]}> 
                    {formatMoney(totalAnualGastos)}
                  </Text>
                </View>
                <View style={styles.pieChartContent}>
                  <Svg width={230} height={230} viewBox="0 0 230 230">
                    <Circle cx="115" cy="115" r="78" fill="transparent" stroke={colors.gray[100]} strokeWidth="38" />
                    {totalesAnualesPorTipo.reduce<{ offset: number; elements: React.ReactNode[] }>(
                      (chart, item) => {
                        if (item.total === 0 || totalAnualGastos === 0) return chart;
                        const percentage = item.total / totalAnualGastos;
                        chart.elements.push(
                          <Circle
                            key={item.subtipo}
                            cx="115"
                            cy="115"
                            r="78"
                            fill="transparent"
                            stroke={item.color}
                            strokeDasharray={`${percentage * 490.1} 490.1`}
                            strokeDashoffset={-chart.offset}
                            strokeWidth="38"
                            rotation="-90"
                            origin="115, 115"
                          />
                        );
                        chart.offset += percentage * 490.1;
                        return chart;
                      },
                      { offset: 0, elements: [] }
                    ).elements}
                  </Svg>
                  <View style={styles.pieLegend}>
                    {totalesAnualesPorTipo.map((item) => (
                      <View key={item.subtipo} style={styles.pieLegendRow}>
                        <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.pieLegendLabel}>{item.subtipo}</Text>
                        <Text style={styles.pieLegendValue}>
                          {totalAnualGastos > 0 ? `${((item.total / totalAnualGastos) * 100).toFixed(1)}%` : '0%'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.annualChartCard}>
                  <View style={styles.annualChartHeader}>
                    <View>
                      <Text style={styles.annualChartTitle}>{subtipoAnualSeleccionado}</Text>
                      <Text style={styles.annualChartSubtitle}>Gasto mensual</Text>
                    </View>
                    <Text style={[styles.annualChartTotal, { color: colorSubtipoAnual }]}> 
                      {formatMoney(totalesAnualesPorSubtipo.reduce((sum, item) => sum + item.total, 0))}
                    </Text>
                  </View>
                  <View style={styles.chartArea}>
                    {totalesAnualesPorSubtipo.map((item) => (
                      <View key={item.mes} style={styles.chartColumn}>
                        <View style={styles.chartBarTrack}>
                          <View style={[styles.chartBar, { backgroundColor: colorSubtipoAnual, height: `${Math.max((item.total / maximoTotalAnual) * 100, item.total ? 8 : 2)}%` }]} />
                        </View>
                        <Text style={styles.chartMonth}>{item.mes.slice(0, 3)}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.annualTotalsList}>
                  {totalesAnualesPorSubtipo.map((item, index) => (
                    <View key={item.mes} style={[styles.annualTotalRow, index % 2 === 1 && styles.annualTotalRowAlternate]}>
                      <Text style={styles.annualTotalMonth}>{item.mes}</Text>
                      <Text style={[styles.annualTotalValue, { color: colorSubtipoAnual }]}>{formatMoney(item.total)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
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
    fontWeight: '700',
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
  viewSelector: { flexDirection: 'row', gap: 8 },
  viewOption: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 32,
  },
  viewOptionSelected: { backgroundColor: colors.primary },
  viewOptionText: { color: colors.gray[600], fontSize: 12, fontWeight: '800' },
  viewOptionTextSelected: { color: '#fff' },
  totalContainer: {
    marginTop: 18,
    marginHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  annualSection: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  subtipoSelector: { gap: 8, marginTop: 6, paddingBottom: 2 },
  subtipoOption: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  subtipoOptionText: { color: colors.gray[600], fontSize: 11, fontWeight: '800' },
  subtipoOptionTextSelected: { color: '#fff' },
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
  pieChartContent: {
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  pieLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  pieLegendRow: { alignItems: 'center', flexDirection: 'row', gap: 6, width: '48%' },
  pieLegendDot: { borderRadius: 6, height: 12, width: 12 },
  pieLegendLabel: { color: colors.gray[600], flex: 1, fontSize: 11, fontWeight: '700' },
  pieLegendValue: { color: colors.dark, fontSize: 11, fontWeight: '800' },
  chartArea: { alignItems: 'stretch', flexDirection: 'row', height: 170, justifyContent: 'space-between' },
  chartColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: 0 },
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
  chartMonth: { color: colors.gray[600], fontSize: 9, marginTop: 7, textAlign: 'center', textTransform: 'capitalize' },
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
  sectionLabel: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
  },
  expenseRow: {
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 88,
    overflow: 'hidden',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  expenseAccent: {
    width: 7,
  },
  expenseContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  expenseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  expenseTitle: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '800',
  },
  expenseAmount: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: colors.gray[100],
    borderRadius: 6,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 6,
    height: 8,
  },
  expensePercent: {
    color: colors.gray[500],
    fontSize: 11,
    fontWeight: '700',
    marginTop: 7,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: 15,
  },
});
