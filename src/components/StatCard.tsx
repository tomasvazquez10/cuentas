import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney } from '@utils/formatting';

interface StatCardProps {
  label: string;
  value: number;
  type?: 'ingreso' | 'egreso' | 'neutral';
  currency?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  type = 'neutral',
  currency = true,
  color,
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

  const accentColor = color ?? getColor();

  return (
    <View style={[styles.card, { borderTopColor: accentColor }]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>
        {currency ? formatMoney(value) : value.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderTopWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  accent: { width: 30, height: 4, borderRadius: 4, marginBottom: 14 },
  label: {
    fontSize: 11,
    color: colors.gray[600],
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 26,
    fontWeight: 'bold',
  },
});
