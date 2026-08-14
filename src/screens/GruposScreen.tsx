import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@utils/colors';
import { Button, Input, CustomModal, GastoCompartidoCard, StatCard, ConfirmDialog } from '@components/index';
import { Grupo, GastoCompartido, MiembroGrupo, TipoDivision, TipoMovimiento, SubtipoMovimiento, MetodoMovimiento } from '@models/index';
import { grupoService } from '@services/grupoService';
import { miembroGrupoService } from '@services/miembroGrupoService';
import { gastoCompartidoService } from '@services/gastoCompartidoService';

const SUBTIPOS_GASTO: SubtipoMovimiento[] = ['FIJO', 'BOLUDES', 'DEPTO', 'SALIDAS', 'SUPER'];
const METODOS: MetodoMovimiento[] = ['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO'];

export default function GruposScreen({ navigation, route }: any) {
  // Estados de control de grupos
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<string | null>(null);
  
  // Datos del grupo actual
  const [gastos, setGastos] = useState<GastoCompartido[]>([]);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modales
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const [modalGrupoVisible, setModalGrupoVisible] = useState(false);

  // Formulario Nuevo Gasto
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [tipoDivision, setTipoDivision] = useState<TipoDivision>('IGUALITARIO');
  const [subtipo, setSubtipo] = useState<SubtipoMovimiento>('SALIDAS');
  const [metodo, setMetodo] = useState<MetodoMovimiento>('EFECTIVO');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Formulario Nuevo Grupo
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [descripcionGrupo, setDescripcionGrupo] = useState('');

  // Diálogo eliminar
  const [gastoAEliminar, setGastoAEliminar] = useState<string | null>(null);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      // El service se encarga por debajo de buscar el usuario actual con authRepository
      const listaGrupos = await grupoService.obtenerGruposDelUsuario();
      setGrupos(listaGrupos);

      if (listaGrupos.length > 0 && (!grupoSeleccionadoId || !listaGrupos.some(g => g.id === grupoSeleccionadoId))) {
        setGrupoSeleccionadoId(listaGrupos[0].id);
      } else if (listaGrupos.length === 0) {
        setGrupoSeleccionadoId(null);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudieron cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrupo = async () => {
    if (!nombreGrupo.trim()) {
      Alert.alert('Error', 'El nombre del grupo es obligatorio');
      return;
    }

    try {
      // Ya no le pasamos el ID por parámetro, el service lo resuelve con authRepository
      const nuevoGrupo = await grupoService.crearGrupo(nombreGrupo, descripcionGrupo);
      setModalGrupoVisible(false);
      setNombreGrupo('');
      setDescripcionGrupo('');
      await loadGrupos();
      setGrupoSeleccionadoId(nuevoGrupo.id);
      Alert.alert('Éxito', 'Grupo creado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el grupo');
    }
  };

  const loadDatosGrupo = async (idGrupo: string) => {
    try {
      setLoading(true);
      const [miembrosData, gastosData] = await Promise.all([
        miembroGrupoService.obtenerMiembros(idGrupo),
        gastoCompartidoService.obtenerGastosDeGrupo(idGrupo),
      ]);
      setMiembros(miembrosData);
      setGastos(gastosData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del grupo seleccionado');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGrupos();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (grupoSeleccionadoId) {
        loadDatosGrupo(grupoSeleccionadoId);
      } else {
        setGastos([]);
        setMiembros([]);
      }
    }, [grupoSeleccionadoId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGrupos();
    if (grupoSeleccionadoId) {
      await loadDatosGrupo(grupoSeleccionadoId);
    }
    setRefreshing(false);
  };

  // Crear Gasto Compartido
  const handleCreateGasto = async () => {
    if (!concepto || !monto || !grupoSeleccionadoId) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      Alert.alert('Error', 'Indica un monto válido');
      return;
    }

    if (miembros.length === 0) {
      Alert.alert('Error', 'El grupo seleccionado no tiene miembros');
      return;
    }

    try {
      const montoPorPersona = Number((montoNumerico / miembros.length).toFixed(2));
      const participantesPayload = miembros.map((m) => ({
        usuarioId: m.usuario_id,
        montoCorrespondiente: montoPorPersona,
      }));

      await gastoCompartidoService.crearGastoCompartido({
        movimiento: {
          fecha,
          tipo: 'GASTO' as TipoMovimiento,
          subtipo,
          concepto,
          metodo,
          monto: montoNumerico,
        },
        grupoId: grupoSeleccionadoId,
        tipoDivision,
        participantes: participantesPayload,
      });

      setModalGastoVisible(false);
      setConcepto('');
      setMonto('');
      await loadDatosGrupo(grupoSeleccionadoId);
      Alert.alert('Éxito', 'Gasto compartido registrado');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo registrar el gasto');
    }
  };

  const handleDeleteGasto = async (id: string) => {
    try {
      await gastoCompartidoService.eliminarGastoCompartido(id);
      setGastos((prev) => prev.filter((g) => g.id !== id));
      Alert.alert('Éxito', 'Gasto eliminado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el gasto');
    }
  };

  const grupoActual = grupos.find((g) => g.id === grupoSeleccionadoId);
  const totalGastosGrupo = gastos.reduce((acc, g: any) => acc + (g.movimientos?.monto || 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gastos en Grupo</Text>
          <Text style={styles.headerSubtitle}>Administra y divide gastos con tus círculos</Text>
        </View>

        {/* SELECTOR DE GRUPOS (Chips Horizontales) */}
        <View style={styles.selectorContainer}>
          <View style={styles.selectorHeaderRow}>
            <Text style={styles.filterLabel}>SELECCIONAR GRUPO</Text>
            <TouchableOpacity onPress={() => setModalGrupoVisible(true)}>
              <Text style={styles.nuevoGrupoText}>+ Crear Grupo</Text>
            </TouchableOpacity>
          </View>

          {grupos.length === 0 ? (
            <View style={styles.noGroupsBox}>
              <Text style={styles.noGroupsText}>No perteneces a ningún grupo todavía.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gruposScroll}>
              {grupos.map((g) => {
                const isSelected = g.id === grupoSeleccionadoId;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGrupoSeleccionadoId(g.id)}
                    style={[styles.grupoChip, isSelected && styles.grupoChipSelected]}
                  >
                    <Text style={[styles.grupoChipText, isSelected && styles.grupoChipTextSelected]}>
                      {g.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {grupoActual ? (
          <>
            <View style={styles.balanceContainer}>
              <StatCard
                label={`Total en ${grupoActual.nombre}`}
                value={totalGastosGrupo}
                type="egreso"
              />
            </View>

            {/* Miembros del grupo seleccionado */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>MIEMBROS ({miembros.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {miembros.map((m: any) => (
                  <View key={m.id} style={styles.miembroChip}>
                    <Text style={styles.miembroAvatar}>👤</Text>
                    <Text style={styles.miembroNombre} numberOfLines={1}>
                      {m.perfiles?.nombre || m.perfiles?.email || 'Miembro'}
                    </Text>
                    <Text style={styles.miembroRol}>{m.rol}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Gastos del grupo seleccionado */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>GASTOS COMPARTIDOS</Text>
              {gastos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay gastos registrados en este grupo</Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {gastos.map((gasto) => (
                    <GastoCompartidoCard
                      key={gasto.id}
                      gasto={gasto}
                      onDelete={() => setGastoAEliminar(gasto.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainerLarge}>
            <Text style={styles.emptyTextLarge}>Selecciona un grupo arriba o crea uno nuevo para comenzar.</Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante condicional (Solo habilitado si hay grupo seleccionado) */}
      {grupoSeleccionadoId && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            accessibilityLabel="Nuevo gasto compartido"
            onPress={() => setModalGastoVisible(true)}
            style={styles.fab}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL: Crear Gasto Compartido */}
      <CustomModal
        visible={modalGastoVisible}
        title="Nuevo Gasto en Grupo"
        onClose={() => setModalGastoVisible(false)}
        footer={
          <View style={styles.modalFooter}>
            <Button title="Cancelar" onPress={() => setModalGastoVisible(false)} variant="secondary" />
            <Button title="Guardar" onPress={handleCreateGasto} variant="primary" />
          </View>
        }
      >
        <View>
          <Input
            label="Concepto"
            placeholder="Ej. Almuerzo, Alquiler, Supermercado"
            value={concepto}
            onChangeText={setConcepto}
          />
          <Input
            label="Monto Total"
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
            {SUBTIPOS_GASTO.map((s) => (
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
        </View>
      </CustomModal>

      {/* MODAL: Crear Grupo Nuevo */}
      <CustomModal
        visible={modalGrupoVisible}
        title="Crear Nuevo Grupo"
        onClose={() => setModalGrupoVisible(false)}
        footer={
          <View style={styles.modalFooter}>
            <Button title="Cancelar" onPress={() => setModalGrupoVisible(false)} variant="secondary" />
            <Button title="Crear" onPress={handleCreateGrupo} variant="primary" />
          </View>
        }
      >
        <View>
          <Input
            label="Nombre del Grupo"
            placeholder="Ej. Viaje a la costa, Amigos depto"
            value={nombreGrupo}
            onChangeText={setNombreGrupo}
          />
          <Input
            label="Descripción (Opcional)"
            placeholder="Detalles del grupo"
            value={descripcionGrupo}
            onChangeText={setDescripcionGrupo}
            multiline
            numberOfLines={2}
          />
        </View>
      </CustomModal>

      {/* Diálogo de Confirmación Borrado */}
      <ConfirmDialog
        visible={!!gastoAEliminar}
        title="Eliminar gasto?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setGastoAEliminar(null)}
        onConfirm={() => {
          const id = gastoAEliminar;
          setGastoAEliminar(null);
          if (id) void handleDeleteGasto(id);
        }}
      />
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
    paddingBottom: 20,
    paddingTop: 42,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ffffffcc',
    marginTop: 4,
  },
  selectorContainer: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  selectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  nuevoGrupoText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  gruposScroll: {
    flexDirection: 'row',
  },
  grupoChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    elevation: 1,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  grupoChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  grupoChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  grupoChipTextSelected: {
    color: '#fff',
  },
  noGroupsBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  noGroupsText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  balanceContainer: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.gray[500],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  miembroChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 95,
    elevation: 1,
  },
  miembroAvatar: {
    fontSize: 18,
    marginBottom: 4,
  },
  miembroNombre: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.dark,
    textAlign: 'center',
  },
  miembroRol: {
    fontSize: 9,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#fff',
    borderRadius: 18,
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  emptyContainerLarge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTextLarge: {
    fontSize: 15,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: colors.dark,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
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