import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@utils/colors';
import { movimientoService } from '@services/movimientoService';
import { Button, Input, CustomModal, MovimientoCard } from '@components/index';
import { Movimiento, TipoMovimiento, SubtipoMovimiento, MetodoMovimiento } from '@models/index';

const SUBTIPOS: SubtipoMovimiento[] = ['FIJO', 'BOLUDES', 'OTRO', 'DOLAR', 'CEDEARS', 'DEPTO', 'SUPER', 'SALIDAS', 'SUELDO', 'BONO'];

const METODOS: MetodoMovimiento[] = ['VISA', 'AMEX', 'EFECTIVO', 'MERCADOPAGO'];

export default function MovimientosScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimiento>('GASTO');
  const [subtipo, setSubtipo] = useState<SubtipoMovimiento>('SUPER');
  const [metodo, setMetodo] = useState<MetodoMovimiento>('EFECTIVO');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await movimientoService.listar();
      setMovimientos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMovimientos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovimientos();
    setRefreshing(false);
  };

  const resetForm = () => {
    setTipo('GASTO');
    setSubtipo('FIJO');
    setMetodo('VISA');
    setConcepto('');
    setMonto('');
    setNota('');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  const handleCreateMovimiento = async () => {
    if (!concepto || !monto) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    try {
      const nuevoMovimiento = await movimientoService.crear({
        fecha,
        tipo,
        subtipo,
        concepto,
        metodo,
        monto: parseFloat(monto),
        nota: nota || undefined,
      });
      setMovimientos([nuevoMovimiento, ...movimientos]);
      resetForm();
      setModalVisible(false);
      Alert.alert('Éxito', 'Movimiento creado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el movimiento');
    }
  };

  const handleDeleteMovimiento = async (id: string) => {
    Alert.alert('Eliminar', '¿Estás seguro de que deseas eliminar este movimiento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await movimientoService.eliminar(id);
            setMovimientos(movimientos.filter((m) => m.id !== id));
            Alert.alert('Éxito', 'Movimiento eliminado');
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el movimiento');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movimientos</Text>
        </View>

        {movimientos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay movimientos</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {movimientos.map((mov) => (
              <MovimientoCard
                key={mov.id}
                movimiento={mov}
                onDelete={() => handleDeleteMovimiento(mov.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="+ Nuevo Movimiento"
          onPress={() => setModalVisible(true)}
          variant="primary"
          fullWidth
          size="large"
        />
      </View>

      <CustomModal
        visible={modalVisible}
        title="Nuevo Movimiento"
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={
          <View style={styles.modalFooter}>
            <Button
              title="Cancelar"
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              variant="secondary"
            />
            <Button
              title="Crear"
              onPress={handleCreateMovimiento}
              variant="primary"
            />
          </View>
        }
      >
        <View>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeButtons}>
            <Button
              title="Entrada"
              onPress={() => setTipo('ENTRADA')}
              variant={tipo === 'ENTRADA' ? 'success' : 'secondary'}
              size="small"
            />
            <Button
              title="Gasto"
              onPress={() => setTipo('GASTO')}
              variant={tipo === 'GASTO' ? 'danger' : 'secondary'}
              size="small"
            />
          </View>

          <Input
            label="Concepto"
            placeholder="Descripción del movimiento"
            value={concepto}
            onChangeText={setConcepto}
          />

          <Input
            label="Monto"
            placeholder="0.00"
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
          />

          <Input
            label="Fecha"
            placeholder="YYYY-MM-DD"
            value={fecha}
            onChangeText={setFecha}
          />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.optionsContainer}>
            {SUBTIPOS.map((s) => (
              <Button
                key={s}
                title={s}
                onPress={() => setSubtipo(s)}
                variant={subtipo === s ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>

          <Text style={styles.label}>Método de Pago</Text>
          <View style={styles.optionsContainer}>
            {METODOS.map((m) => (
              <Button
                key={m}
                title={m}
                onPress={() => setMetodo(m)}
                variant={metodo === m ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>

          <Input
            label="Nota (opcional)"
            placeholder="Agregar una nota"
            value={nota}
            onChangeText={setNota}
            multiline
            numberOfLines={3}
          />
        </View>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
});
