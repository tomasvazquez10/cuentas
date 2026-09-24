import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, getMetodoColor } from '@utils/colors';
import { formatMoney, formatDate } from '@utils/formatting';
import { Movimiento } from '@models/index';

interface MovimientoCardProps {
  movimiento: Movimiento;
  onPress?: () => void;
  onDelete?: () => void;
  hideSign?: boolean;
}

export const MovimientoCard: React.FC<MovimientoCardProps> = ({
  movimiento,
  onPress,
  onDelete,
  hideSign = false,
}) => {
  const isIngreso = movimiento.tipo === 'ENTRADA';
  const color = isIngreso ? colors.ingresos : colors.egresos;
  const metodoColor = getMetodoColor(movimiento.metodo);
  const icon = movimiento.tipo === 'ENTRADA'
    ? '↗'
    : movimiento.subtipo === 'SUPER'
      ? '🛒'
      : movimiento.subtipo === 'VIAJES'
        ? '✈'
        : movimiento.subtipo === 'SALIDAS'
          ? '★'
          : movimiento.subtipo === 'DEPTO'
            ? '⌂'
            : '•';
  const sign = isIngreso ? '+' : '-';
  const amountPrefix = hideSign ? '' : `${sign} `;
  const mostrarCuotas =
    !!movimiento.cuota_actual &&
    !!movimiento.total_cuotas &&
    movimiento.total_cuotas > 1;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
    >
      <View style={[styles.icon, { backgroundColor: color + '18' }]}>
        <Text style={[styles.iconText, { color }]}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.concepto}>{movimiento.concepto}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.fecha}>{formatDate(movimiento.fecha)}</Text>
          <View style={[styles.metodoPill, { backgroundColor: metodoColor + '18' }]}>
            <Text style={[styles.metodoText, { color: metodoColor }]}>{movimiento.metodo}</Text>
          </View>
        </View>
        <Text style={styles.subtipo}>
          {movimiento.subtipo}{mostrarCuotas ? `  |  Cuota ${movimiento.cuota_actual}/${movimiento.total_cuotas}` : ''}
        </Text>
      </View>
      <View style={styles.amount}>
        <Text style={[styles.monto, { color }]}>
          {amountPrefix}{formatMoney(movimiento.monto)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  concepto: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: colors.gray[500],
    marginRight: 6,
  },
  subtipo: {
    fontSize: 11,
    color: colors.gray[400],
    textTransform: 'capitalize',
  },
  metaRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 2 },
  metodoPill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  metodoText: { fontSize: 9, fontWeight: '800' },
  amount: {
    alignItems: 'flex-end',
  },
  monto: {
    fontSize: 17,
    fontWeight: '800',
  },
});
