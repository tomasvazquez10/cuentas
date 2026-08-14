import { gastoCompartidoRepository } from '../repositories/gastoCompartidoRepository';
import { participanteGastoRepository } from '../repositories/participanteGastoRepository';
import { movimientoRepository } from '../repositories/movimientoRepository'; // Asumiendo que ya existe o está accesible
import { GastoCompartido, TipoDivision } from '../types';

interface CrearGastoCompartidoDTO {
  // Datos para la tabla 'movimientos'
  movimiento: {
    fecha: string;
    tipo: any; // Ajusta al tipo exacto de tu app (ej. 'GASTO')
    subtipo: any;
    concepto: string;
    metodo: any;
    monto: number;
    nota?: string;
  };
  // Datos para 'gastos_compartidos'
  grupoId: string;
  tipoDivision: TipoDivision;
  userId: string;
  // Datos para 'participantes_gasto'
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

  /**
   * Crea un movimiento financiero y lo distribuye automáticamente entre los participantes del grupo.
   */
  async crearGastoCompartido(dto: CrearGastoCompartidoDTO): Promise<GastoCompartido> {
    const { movimiento, grupoId, tipoDivision, userId, participantes } = dto;

    if (!participantes || participantes.length === 0) {
      throw new Error('Debe haber al menos un participante en el gasto compartido');
    }

    // Paso 1: Crear el movimiento base en la tabla 'movimientos'
    const nuevoMovimiento = await movimientoRepository.create({
      ...movimiento,
      created_by: userId,
    });

    if (!nuevoMovimiento || !nuevoMovimiento.id) {
      throw new Error('Error al crear el movimiento base del gasto');
    }

    // Paso 2: Crear el registro de 'gastos_compartidos'
    const nuevoGastoCompartido = await gastoCompartidoRepository.create({
      movimiento_id: nuevoMovimiento.id,
      grupo_id: grupoId,
      tipo_division: tipoDivision,
      created_by: userId,
    });

    if (!nuevoGastoCompartido || !nuevoGastoCompartido.id) {
      throw new Error('Error al registrar el gasto compartido');
    }

    // Paso 3: Mapear e insertar los participantes en 'participantes_gasto'
    const participantesPayload = participantes.map((p) => ({
      gasto_compartido_id: nuevoGastoCompartido.id,
      usuario_id: p.usuarioId,
      porcentaje: p.porcentaje ?? null,
      monto_correspondiente: p.montoCorrespondiente,
      pagado: false, // Por defecto inician como no pagados (excepto quizás el que paga, opcional)
    }));

    await participanteGastoRepository.createMany(participantesPayload);

    return nuevoGastoCompartido;
  },

  async eliminarGastoCompartido(id: string): Promise<void> {
    // Al estar configurado en Supabase con restricciones de borrado en cascada (o manual),
    // primero eliminamos los participantes, luego el gasto compartido y opcionalmente el movimiento.
    await participanteGastoRepository.deleteByGastoId(id);
    await gastoCompartidoRepository.delete(id);
  },
};