import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '@utils/colors';
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
  const isIngreso = movimiento.tipo === 'ingreso';
  const color = isIngreso ? colors.ingresos : colors.egresos;
  const sign = isIngreso ? '+' : '-';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
    >
      <View style={[styles.icon, { backgroundColor: color + '20' }]}>
        <Text style={[styles.iconText, { color }]}>💰</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.concepto}>{movimiento.concepto}</Text>
        <Text style={styles.fecha}>{formatDate(movimiento.fecha)}</Text>
        <Text style={styles.subtipo}>{movimiento.subtipo}</Text>
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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