import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@utils/colors';
import { movimientosService } from '@services/movimientos';
import { calendarioService } from '@services/calendario';
import { formatMoney } from '@utils/formatting';
import { Button, StatCard, MovimientoCard, PagoCard } from '@components/index';
import { Movimiento, CalendarioPago } from '@types/index';

export default function HomeScreen({ navigation }: any) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [pagos, setPagos] = useState<CalendarioPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movsData, pagosData] = await Promise.all([
        movimientosService.getMovimientos(),
        calendarioService.getPagosProximos(),
      ]);
      setMovimientos(movsData.slice(0, 5)); // Últimos 5 movimientos
      setPagos(pagosData.slice(0, 3)); // Próximos 3 pagos
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
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

  const calcularTotales = () => {
    const ingresos = movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    const egresos = movimientos
      .filter((m) => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  };

  const { ingresos, egresos, balance } = calcularTotales();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen Financiero</Text>
      </View>

      {/* Tarjetas de estadísticas */}
      <View style={styles.statsContainer}>
        <StatCard label="Ingresos" value={ingresos} type="ingreso" />
        <StatCard label="Egresos" value={egresos} type="egreso" />
        <StatCard label="Balance" value={balance} type="neutral" />
      </View>

      {/* Pagos próximos */}
      {pagos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagos Próximos</Text>
            <Text
              style={styles.seeAll}
              onPress={() => navigation.navigate('Calendario')}
            >
              Ver todos
            </Text>
          </View>
          {pagos.map((pago) => (
            <PagoCard
              key={pago.id}
              pago={pago}
              onPress={() => navigation.navigate('Calendario', { pagoId: pago.id })}
            />
          ))}
        </View>
      )}

      {/* Últimos movimientos */}
      {movimientos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
            <Text
              style={styles.seeAll}
              onPress={() => navigation.navigate('Movimientos')}
            >
              Ver todos
            </Text>
          </View>
          {movimientos.map((mov) => (
            <MovimientoCard
              key={mov.id}
              movimiento={mov}
              onPress={() =>
                navigation.navigate('Movimientos', { movId: mov.id })
              }
            />
          ))}
        </View>
      )}

      {/* Botones de acción rápida */}
      <View style={styles.actionButtons}>
        <Button
          title="+ Nuevo Gasto"
          onPress={() => navigation.navigate('Movimientos')}
          variant="primary"
          fullWidth
        />
        <Button
          title="+ Nuevo Pago"
          onPress={() => navigation.navigate('Calendario')}
          variant="success"
          fullWidth
        />
      </View>

      <View style={styles.spacer} />
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
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  spacer: {
    height: 40,
  },
});
