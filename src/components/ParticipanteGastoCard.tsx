import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import { colors } from '@utils/colors';
import { formatMoney } from '@utils/formatting';
import { ParticipanteGasto } from '../types';

interface ParticipanteGastoCardProps {
  participante: ParticipanteGasto & {
    perfiles?: {
      nombre: string | null;
      email: string;
    };
  };
  onTogglePagado?: (nuevoEstado: boolean) => void;
}

export const ParticipanteGastoCard: React.FC<ParticipanteGastoCardProps> = ({
  participante,
  onTogglePagado,
}) => {
  const nombreUsuario = participante.perfiles?.nombre || participante.perfiles?.email || 'Usuario';
  
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: participante.pagado ? '#34C75920' : '#FF3B3020' }]}>
        <Text style={styles.avatarText}>
          {nombreUsuario.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.nombre} numberOfLines={1}>{nombreUsuario}</Text>
        <Text style={[styles.estado, { color: participante.pagado ? colors.ingresos || '#34C759' : '#FF3B30' }]}>
          {participante.pagado ? 'Pagado ✓' : 'Pendiente de pago'}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.monto}>{formatMoney(participante.monto_correspondiente)}</Text>
        {onTogglePagado && (
          <Switch
            value={participante.pagado}
            onValueChange={onTogglePagado}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={'#f4f3f4'}
            style={styles.switch}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  content: {
    flex: 1,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 2,
  },
  estado: {
    fontSize: 11,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  monto: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 4,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});