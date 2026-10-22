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
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, getMetodoColor } from '@utils/colors';
import { SidebarMenuButton, StatCard } from '@components/index';
import { Movimiento, MetodoMovimiento } from '@models/index';
import { useMovimientosQuery } from '@queries/useServerQueries';
import type { HomeScreenProps } from '@navigation/types';

const METODOS: MetodoMovimiento[] = ['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO'];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const movimientosQuery = useMovimientosQuery();
  const movimientos = movimientosQuery.data ?? [];
  const [refreshing, setRefreshing] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  useFocusEffect(
    useCallback(() => {
      void movimientosQuery.refetch();
    }, [movimientosQuery.refetch])
  );

  useEffect(() => {
    if (movimientosQuery.isError) {
      Alert.alert('Error', 'No se pudieron cargar los balances');
    }
  }, [movimientosQuery.error]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await movimientosQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const calcularBalance = (items: Movimiento[]) =>
    items.reduce(
      (balance, movimiento) =>
        balance + (movimiento.tipo === 'ENTRADA' ? movimiento.monto : -movimiento.monto),
      0
    );

  const cambiarMes = (desplazamiento: number) => {
    setMesSeleccionado((mes) => new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1));
  };

  const claveMes = `${mesSeleccionado.getFullYear()}-${String(
    mesSeleccionado.getMonth() + 1
  ).padStart(2, '0')}`;
  const movimientosDelMes = movimientos.filter(
    (movimiento) => movimiento.fecha.slice(0, 7) === claveMes
  );
  const balanceGeneral = calcularBalance(movimientosDelMes);
  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SidebarMenuButton />
            <Text style={styles.headerTitle}>Resumen financiero</Text>
          </View>
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

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Balance general</Text>
          <StatCard label="Saldo disponible" value={balanceGeneral} type="neutral" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por metodo de pago</Text>
          {METODOS.map((metodo) => (
            <StatCard
              key={metodo}
              label={metodo}
              value={calcularBalance(
                movimientosDelMes.filter((movimiento) => movimiento.metodo === metodo)
              )}
              type="neutral"
              color={getMetodoColor(metodo)}
              onPress={() => navigation.navigate('Movimientos', { filtroMetodo: metodo })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 12,
  },
});
