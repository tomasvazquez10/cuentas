import { gastoCompartidoRepository } from '../repositories/gastoCompartidoRepository';
import { participanteGastoRepository } from '../repositories/participanteGastoRepository';
import { movimientoRepository } from '../repositories/movimientoRepository';
import { authRepository } from '../repositories/authRepository'; // 👈 Importar authRepository
import { GastoCompartido, TipoDivision } from '../types';

const getAuthenticatedUserId = async () => {
  const user = await authRepository.currentUser();
  if (!user) throw new Error('Debes iniciar sesión para realizar esta acción');
  return user.id;
};

interface CrearGastoCompartidoDTO {
  movimiento: {
    fecha: string;
    tipo: any;
    subtipo: any;
    concepto: string;
    metodo: any;
    monto: number;
    nota?: string;
  };
  grupoId: string;
  tipoDivision: TipoDivision;
  participantes: Array<{
    usuarioId: string;
    porcentaje?: number;
    montoCorrespondiente: number;
  }>;
}

export const gastoCompartidoService = {
  async obtenerGastosDeGrupo(grupoId: string): Promise<GastoCompartido[]> {
    if (!grupoId) throw new Error('ID de grupo requerido');
    return await gastoCompartidoRepository.findByGrupoId(grupoId);
  },

  async obtenerDetalleGasto(id: string): Promise<GastoCompartido> {
    return await gastoCompartidoRepository.findById(id);
  },

  async crearGastoCompartido(dto: CrearGastoCompartidoDTO): Promise<GastoCompartido> {
    const { movimiento, grupoId, tipoDivision, participantes } = dto;

    if (!participantes || participantes.length === 0) {
      throw new Error('Debe haber al menos un participante en el gasto compartido');
    }

    // 👈 Obtenemos el usuario autenticado automáticamente
    const userId = await getAuthenticatedUserId();

    // Paso 1: Crear el movimiento base
    const nuevoMovimiento = await movimientoRepository.create({
      ...movimiento,
      created_by: userId,
    });

    if (!nuevoMovimiento || !nuevoMovimiento.id) {
      throw new Error('Error al crear el movimiento base del gasto');
    }

    // Paso 2: Crear el gasto compartido
    const nuevoGastoCompartido = await gastoCompartidoRepository.create({
      movimiento_id: nuevoMovimiento.id,
      grupo_id: grupoId,
      tipo_division: tipoDivision,
      created_by: userId,
    });

    if (!nuevoGastoCompartido || !nuevoGastoCompartido.id) {
      throw new Error('Error al registrar el gasto compartido');
    }

    // Paso 3: Insertar los participantes
    const participantesPayload = participantes.map((p) => ({
      gasto_compartido_id: nuevoGastoCompartido.id,
      usuario_id: p.usuarioId,
      porcentaje: p.porcentaje ?? null,
      monto_correspondiente: p.montoCorrespondiente,
      pagado: false,
    }));

    await participanteGastoRepository.createMany(participantesPayload);

    return nuevoGastoCompartido;
  },

  async eliminarGastoCompartido(id: string): Promise<void> {
    await participanteGastoRepository.deleteByGastoId(id);
    await gastoCompartidoRepository.delete(id);
  },
};