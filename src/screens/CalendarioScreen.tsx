import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@utils/colors';
import { calendarioPagoService } from '@services/calendarioPagoService';
import { Button, Input, CustomModal, PagoCard, StatCard } from '@components/index';
import { CalendarioPago } from '@models/index';

export default function CalendarioScreen() {
  const [pagos, setPagos] = useState<CalendarioPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicio, setServicio] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const loadPagos = async () => {
    try {
      setLoading(true);
      const data = await calendarioPagoService.listar();
      setPagos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPagos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPagos();
    setRefreshing(false);
  };

  const resetForm = () => {
    setServicio('');
    setMonto('');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  const handleCreatePago = async () => {
    if (!servicio || !monto) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    try {
      const nuevoPago = await calendarioPagoService.crear({
        fecha,
        servicio,
        monto: parseFloat(monto),
        pago: false,
      });
      setPagos([...pagos, nuevoPago].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
      resetForm();
      setModalVisible(false);
      Alert.alert('Éxito', 'Pago agregado al calendario');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el pago');
    }
  };

  const handleTogglePago = async (pagoId: string, completed: boolean) => {
    try {
      const pagoActualizado = await calendarioPagoService.actualizar(pagoId, {
        pago: completed,
      });
      setPagos(
        pagos.map((p) => (p.id === pagoId ? pagoActualizado : p))
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el pago');
    }
  };

  const handleDeletePago = async (pagoId: string) => {
    Alert.alert('Eliminar', '¿Estás seguro de que deseas eliminar este pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await calendarioPagoService.eliminar(pagoId);
            setPagos(pagos.filter((p) => p.id !== pagoId));
            Alert.alert('Éxito', 'Pago eliminado');
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el pago');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const pagoPendientes = pagos.filter((p) => !p.pago);
  const pagoCompletados = pagos.filter((p) => p.pago);
  const totalPendiente = pagoPendientes.reduce((sum, p) => sum + p.monto, 0);
  const totalCompletado = pagoCompletados.reduce((sum, p) => sum + p.monto, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendario de Pagos</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            label="Total Pendiente"
            value={totalPendiente}
            type="egreso"
          />
          <StatCard
            label="Total Pagado"
            value={totalCompletado}
            type="ingreso"
          />
        </View>

        {pagos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay pagos agendados</Text>
          </View>
        ) : (
          <>
            {pagoPendientes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Pendientes ({pagoPendientes.length})
                </Text>
                {pagoPendientes.map((pago) => (
                  <PagoCard
                    key={pago.id}
                    pago={pago}
                    onToggle={(completed) => handleTogglePago(pago.id, completed)}
                    onDelete={() => handleDeletePago(pago.id)}
                  />
                ))}
              </View>
            )}

            {pagoCompletados.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Pagados ({pagoCompletados.length})
                </Text>
                {pagoCompletados.map((pago) => (
                  <PagoCard
                    key={pago.id}
                    pago={pago}
                    onToggle={(completed) => handleTogglePago(pago.id, completed)}
                    onDelete={() => handleDeletePago(pago.id)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="+ Nuevo Pago"
          onPress={() => setModalVisible(true)}
          variant="success"
          fullWidth
          size="large"
        />
      </View>

      <CustomModal
        visible={modalVisible}
        title="Nuevo Pago"
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
              title="Agregar"
              onPress={handleCreatePago}
              variant="success"
            />
          </View>
        }
      >
        <View>
          <Input
            label="Servicio"
            placeholder="Nombre del servicio"
            value={servicio}
            onChangeText={setServicio}
          />

          <Input
            label="Monto"
            placeholder="0.00"
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
          />

          <Input
            label="Fecha de Pago"
            placeholder="YYYY-MM-DD"
            value={fecha}
            onChangeText={setFecha}
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
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 12,
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
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
});
