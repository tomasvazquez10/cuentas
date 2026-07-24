import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney } from '@utils/formatting';

interface StatCardProps {
  label: string;
  value: number;
  type?: 'ingreso' | 'egreso' | 'neutral';
  currency?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  type = 'neutral',
  currency = true,
}) => {
  const getColor = () => {
    switch (type) {
      case 'ingreso':
        return colors.ingresos;
      case 'egreso':
        return colors.egresos;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getColor() }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: getColor() }]}>
        {currency ? formatMoney(value) : value.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
