import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney, formatDate } from '@utils/formatting';
import { Movimiento } from '@types/index';

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
  const montoColor = isIngreso ? colors.ingresos : colors.egresos;
  const subtypeColor = colors.subtypes[movimiento.subtipo] || colors.gray[500];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: subtypeColor }]}>
          <Text style={styles.badgeText}>
            {movimiento.subtipo.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.concepto}>{movimiento.concepto}</Text>
          <Text style={styles.fecha}>{formatDate(movimiento.fecha)}</Text>
        </View>
        <Text style={[styles.monto, { color: montoColor }]}>
          {isIngreso ? '+' : '-'} {formatMoney(movimiento.monto)}
        </Text>
      </View>
      {movimiento.nota && (
        <Text style={styles.nota}>{movimiento.nota}</Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.metodo}>{movimiento.metodo}</Text>
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
    borderLeftColor: colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  titleContainer: {
    flex: 1,
  },
  concepto: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  fecha: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  monto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nota: {
    fontSize: 13,
    color: colors.gray[600],
    fontStyle: 'italic',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metodo: {
    fontSize: 11,
    color: colors.gray[500],
    textTransform: 'capitalize',
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
