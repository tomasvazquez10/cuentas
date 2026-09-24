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
  const periodSelector = vistaSeleccionada === 'mes' ? (
    <View style={styles.periodSelector}>
      <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.periodButton}>
        <Text style={styles.periodButtonText}>{'<'}</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.periodLabel}>MES SELECCIONADO</Text>
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
            <View style={styles.yearTable}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableHeaderCell, styles.monthColumn]}>Mes</Text>
                {TARJETAS.map((tarjeta) => (
                  <Text
                    key={tarjeta}
                    style={[
                      styles.tableHeaderCell,
                      styles.amountColumn,
                      { color: getMetodoColor(tarjeta) },
                    ]}
                  >
                    {tarjeta}
                  </Text>
                ))}
              </View>

              {totalesPorMes.map((item, index) => (
                <View
                  key={item.mes}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}
                >
                  <Text numberOfLines={1} style={[styles.tableMonthCell, styles.monthColumn]}>
                    {item.mes}
                  </Text>
                  {item.totales.map((total) => (
                    <Text
                      key={total.tarjeta}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                      numberOfLines={1}
                      style={[
                        styles.tableAmountCell,
                        styles.amountColumn,
                        { color: getMetodoColor(total.tarjeta) },
                      ]}
                    >
                      {formatMoney(total.total)}
                    </Text>
                  ))}
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
  yearTable: {
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1,
    overflow: 'hidden',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: colors.gray[100],
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  tableRowAlternate: { backgroundColor: colors.gray[50] },
  tableHeaderRow: { backgroundColor: '#EEECFF' },
  tableHeaderCell: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  monthColumn: {
    flex: 1.15,
    minWidth: 0,
  },
  amountColumn: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  tableMonthCell: {
    color: colors.gray[700],
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  tableAmountCell: {
    color: colors.dark,
    fontSize: 13,
    fontWeight: '800',
  },
});
