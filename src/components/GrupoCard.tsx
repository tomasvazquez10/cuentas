import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '@utils/colors';
import { Grupo } from '../types'; // Ajusta según la ruta de tus tipos

interface GrupoCardProps {
  grupo: Grupo;
  onPress?: () => void;
  onDelete?: () => void;
  cantidadMiembros?: number; // Opcional, si traes el conteo
}

export const GrupoCard: React.FC<GrupoCardProps> = ({
  grupo,
  onPress,
  onDelete,
  cantidadMiembros,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
    >
      <View style={[styles.icon, { backgroundColor: colors.primary ? colors.primary + '20' : '#007AFF20' }]}>
        <Text style={styles.iconText}>👥</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.nombre}>{grupo.nombre}</Text>
        <Text style={styles.descripcion} numberOfLines={1}>
          {grupo.descripcion || 'Sin descripción'}
        </Text>
        {cantidadMiembros !== undefined && (
          <Text style={styles.miembros}>
            {cantidadMiembros} {cantidadMiembros === 1 ? 'miembro' : 'miembros'}
          </Text>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>{'›'}</Text>
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
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  miembros: {
    fontSize: 11,
    color: colors.gray[400],
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  arrow: {
    fontSize: 22,
    color: colors.gray[400],
    fontWeight: '300',
  },
});