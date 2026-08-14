import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney, formatDate } from '@utils/formatting';
import { GastoCompartido } from '../types';

interface GastoCompartidoCardProps {
  gasto: GastoCompartido & {
    movimientos?: {
      concepto: string;
      monto: number;
      fecha: string;
      subtipo: string;
    };
  };
  onPress?: () => void;
  onDelete?: () => void;
}

export const GastoCompartidoCard: React.FC<GastoCompartidoCardProps> = ({
  gasto,
  onPress,
  onDelete,
}) => {
  const movimiento = gasto.movimientos;
  const concepto = movimiento?.concepto || 'Gasto compartido';
  const monto = movimiento?.monto || 0;
  const fecha = movimiento?.fecha ? formatDate(movimiento.fecha) : '';
  
  // Texto amigable para el tipo de división
  const divisionLabels = {
    IGUALITARIO: 'División Igualitaria',
    PORCENTAJE: 'Porcentaje',
    MONTO_FIJO: 'Monto Fijo',
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
    >
      <View style={[styles.icon, { backgroundColor: '#FF950020' }]}>
        <Text style={styles.iconText}>🧾</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.concepto}>{concepto}</Text>
        <Text style={styles.fecha}>{fecha}</Text>
        <Text style={styles.divisionBadge}>
          {divisionLabels[gasto.tipo_division] || gasto.tipo_division}
        </Text>
      </View>
      <View style={styles.amount}>
        <Text style={styles.monto}>{formatMoney(monto)}</Text>
        <Text style={styles.tipoGasto}>Total grupo</Text>
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
    marginBottom: 4,
  },
  divisionBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary || '#007AFF',
    backgroundColor: '#007AFF10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  amount: {
    alignItems: 'flex-end',
  },
  monto: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
  tipoGasto: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 2,
  },
});