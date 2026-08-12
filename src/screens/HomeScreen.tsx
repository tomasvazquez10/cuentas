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
import { colors, getMetodoColor } from '@utils/colors';
import { movimientoService } from '@services/movimientoService';
import { StatCard } from '@components/index';
import { Movimiento, MetodoMovimiento } from '@models/index';

const METODOS: MetodoMovimiento[] = ['VISA', 'AMEX', 'EFECTIVO', 'MERCADOPAGO'];

export default function HomeScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const loadData = async () => {
    try {
      setMovimientos(await movimientoService.listar());
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los balances');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calcularBalance = (items: Movimiento[]) =>
    items.reduce(
      (balance, movimiento) =>
        balance + (movimiento.tipo === 'ENTRADA' ? movimiento.monto : -movimiento.monto),
      0
    );

  const cambiarMes = (desplazamiento: number) => {
    setMesSeleccionado((mes) =>
      new Date(mes.getFullYear(), mes.getMonth() + desplazamiento, 1)
    );
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen financiero</Text>
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
          />
        ))}
      </View>
    </ScrollView>
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
