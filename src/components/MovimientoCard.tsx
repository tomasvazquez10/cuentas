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
}

export const MovimientoCard: React.FC<MovimientoCardProps> = ({
  movimiento,
  onPress,
  onDelete,
}) => {
  const isIngreso = movimiento.tipo === 'ENTRADA';
  const color = isIngreso ? colors.ingresos : colors.egresos;
  const metodoColor = getMetodoColor(movimiento.metodo);
  const sign = isIngreso ? '+' : '-';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
    >
      <View style={[styles.icon, { backgroundColor: metodoColor + '20' }]}>
        <Text style={[styles.iconText, { color }]}>💰</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.concepto}>{movimiento.concepto}</Text>
        <Text style={styles.fecha}>{formatDate(movimiento.fecha)}</Text>
        <Text style={styles.subtipo}>
          {movimiento.subtipo}
          {movimiento.cuota_actual && movimiento.total_cuotas
            ? `  |  Cuota ${movimiento.cuota_actual}/${movimiento.total_cuotas}`
            : ''}
        </Text>
      </View>
      <View style={styles.amount}>
        <Text style={[styles.monto, { color }]}>
          {sign} {formatMoney(movimiento.monto)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  concepto: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  subtipo: {
    fontSize: 11,
    color: colors.gray[400],
    textTransform: 'capitalize',
  },
  amount: {
    alignItems: 'flex-end',
  },
  monto: {
    fontSize: 16,
    fontWeight: '700',
  },
});
