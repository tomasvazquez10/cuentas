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

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export default function GastosScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

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

        <View style={styles.monthSelector}>
          <TouchableOpacity
            accessibilityLabel="Mes anterior"
            onPress={() => cambiarMes(-1)}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>{'<'}</Text>
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
            <Text style={styles.monthButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

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
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
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
  totalContainer: {
    marginTop: 18,
    marginHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
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
