import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney, formatDate } from '@utils/formatting';
import { CalendarioPago } from '@types/index';

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
  const isCompleted = pago.pago;
  const backgroundColor = isCompleted ? colors.gray[100] : '#fff';
  const borderColor = isCompleted ? colors.success : colors.warning;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor, borderLeftColor: borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            isCompleted && styles.checkboxCompleted,
          ]}
          onPress={() => onToggle?.(!isCompleted)}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.content}>
          <Text
            style={[
              styles.servicio,
              isCompleted && styles.servicioCompleted,
            ]}
          >
            {pago.servicio}
          </Text>
          <Text style={styles.fecha}>{formatDate(pago.fecha)}</Text>
        </View>
        <Text style={styles.monto}>{formatMoney(pago.monto)}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.estado, isCompleted && styles.estadoCompleted]}>
          {isCompleted ? 'Pagado' : 'Pendiente'}
        </Text>
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
          >
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  servicio: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  servicioCompleted: {
    color: colors.gray[500],
    textDecorationLine: 'line-through',
  },
  fecha: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  monto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estado: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  estadoCompleted: {
    color: colors.success,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
  },
});
