import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
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

  const balanceGeneral = calcularBalance(movimientos);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TU PANORAMA</Text>
        <Text style={styles.headerTitle}>Resumen financiero</Text>
        <Text style={styles.headerSubtitle}>
          Tus saldos organizados por metodo de pago.
        </Text>
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
              movimientos.filter((movimiento) => movimiento.metodo === metodo)
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
    paddingBottom: 30,
    paddingTop: 52,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  eyebrow: {
    color: '#DCD8FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    color: '#DCD8FF',
    fontSize: 14,
    marginTop: 8,
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
