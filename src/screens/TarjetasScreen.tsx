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
import { StatCard } from '@components/index';
import { tarjetaService } from '@services/tarjetaService';
import { movimientoService } from '@services/movimientoService';
import { colors, getMetodoColor } from '@utils/colors';
import { formatDate } from '@utils/formatting';
import { DatoTarjeta, Movimiento } from '@models/index';

const TARJETAS = ['VISA', 'AMEX', 'MERCADOPAGO'] as const;

export default function TarjetasScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [datosTarjeta, setDatosTarjeta] = useState<DatoTarjeta[]>([]);
  const [refreshing, setRefreshing] = useState(false);
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
      loadData();
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

  const claveMes = `${mesSeleccionado.getFullYear()}-${String(
    mesSeleccionado.getMonth() + 1
  ).padStart(2, '0')}`;
  const movimientosDelMes = movimientos.filter(
    (movimiento) =>
      movimiento.fecha.slice(0, 7) === claveMes &&
      TARJETAS.includes(movimiento.metodo as (typeof TARJETAS)[number])
  );
  const calcularBalance = (items: Movimiento[]) =>
    items.reduce(
      (total, movimiento) =>
        total + (movimiento.tipo === 'ENTRADA' ? movimiento.monto : -movimiento.monto),
      0
    );
  const balanceTotal = calcularBalance(movimientosDelMes);
  const tituloMes = mesSeleccionado.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>RESUMEN DE TARJETAS</Text>
        <Text style={styles.title}>Tarjetas</Text>
        <Text style={styles.subtitle}>Saldos, cierres y vencimientos.</Text>
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
        <Text style={styles.sectionTitle}>Balance total</Text>
        <StatCard label="Todas las tarjetas" value={balanceTotal} type="neutral" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Por tarjeta</Text>
        {TARJETAS.map((tarjeta) => (
          <StatCard
            key={tarjeta}
            label={tarjeta}
            value={calcularBalance(movimientosDelMes.filter((movimiento) => movimiento.metodo === tarjeta))}
            type="neutral"
            color={getMetodoColor(tarjeta)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cierre y vencimiento</Text>
        {TARJETAS.map((tarjeta) => {
          const dato = datosTarjeta.find((item) => item.tarjeta === tarjeta);
          return (
            <View key={tarjeta} style={[styles.dateCard, { borderLeftColor: getMetodoColor(tarjeta) }]}>
              <Text style={styles.cardName}>{tarjeta}</Text>
              {dato ? (
                <View style={styles.dateRow}>
                  <View>
                    <Text style={styles.dateLabel}>CIERRE</Text>
                    <Text style={styles.dateValue}>{formatDate(dato.fecha_cierre)}</Text>
                  </View>
                  <View>
                    <Text style={styles.dateLabel}>VENCIMIENTO</Text>
                    <Text style={styles.dateValue}>{formatDate(dato.fecha_vencimiento)}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noDates}>Sin fechas cargadas para este mes</Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  kicker: { color: '#DCD8FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#DCD8FF', fontSize: 14, marginTop: 8 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 18, padding: 14, backgroundColor: '#fff', borderRadius: 18, elevation: 2, shadowColor: colors.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9 },
  monthButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  monthButtonText: { color: colors.primary, fontSize: 28, fontWeight: '500', lineHeight: 31 },
  monthLabel: { color: colors.gray[500], fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  monthTitle: { color: colors.dark, fontSize: 17, fontWeight: '800', marginTop: 3, textAlign: 'center', textTransform: 'capitalize' },
  statsContainer: { paddingHorizontal: 20, paddingTop: 20 },
  section: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  sectionTitle: { color: colors.dark, fontSize: 19, fontWeight: '800', marginBottom: 12 },
  dateCard: { backgroundColor: '#fff', borderLeftWidth: 4, borderRadius: 18, marginBottom: 10, padding: 16, elevation: 2, shadowColor: colors.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9 },
  cardName: { color: colors.dark, fontSize: 16, fontWeight: '800', marginBottom: 14 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateLabel: { color: colors.gray[500], fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  dateValue: { color: colors.dark, fontSize: 14, fontWeight: '700', marginTop: 4 },
  noDates: { color: colors.gray[500], fontSize: 13 },
});
