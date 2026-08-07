import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney, formatDate } from '@utils/formatting';
import { CalendarioPago } from '@models/index';

interface PagoCardProps {
  pago: CalendarioPago;
  onPress?: () => void;
  onToggle?: (completed: boolean) => void;
  onDelete?: () => void;
}

export const PagoCard: React.FC<PagoCardProps> = ({
  pago,
  onPress,
  onToggle,
  onDelete,
}) => {
  const fechaPago = new Date(pago.fecha);
  const hoy = new Date();
  const diasRestantes = Math.ceil(
    (fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={[styles.card, pago.pago && styles.completedCard]}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Text style={[styles.servicio, pago.pago && styles.completedText]}>
          {pago.servicio}
        </Text>
        <Text style={styles.fecha}>{formatDate(pago.fecha)}</Text>
        {!pago.pago && diasRestantes > 0 && (
          <Text style={styles.diasRestantes}>
            {diasRestantes} día{diasRestantes !== 1 ? 's' : ''} restante{diasRestantes !== 1 ? 's' : ''}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.monto}>
        <Text style={styles.montoText}>{formatMoney(pago.monto)}</Text>
      </View>
      {onToggle && (
        <Switch
          value={pago.pago}
          onValueChange={onToggle}
          trackColor={{ false: colors.gray[300], true: colors.success }}
          thumbColor={pago.pago ? colors.success : colors.gray[400]}
        />
      )}
    </View>
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
  completedCard: {
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
  },
  servicio: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray[400],
  },
  fecha: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  diasRestantes: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '500',
  },
  monto: {
    marginRight: 12,
  },
  montoText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
});
