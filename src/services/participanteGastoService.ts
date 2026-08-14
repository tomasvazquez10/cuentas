import { participanteGastoRepository } from '../repositories/participanteGastoRepository';
import { ParticipanteGasto } from '../types';

export const participanteGastoService = {
  async obtenerParticipantesPorGasto(gastoCompartidoId: string): Promise<ParticipanteGasto[]> {
    if (!gastoCompartidoId) throw new Error('ID de gasto compartido requerido');
    return await participanteGastoRepository.findByGastoCompartidoId(gastoCompartidoId);
  },

  async cambiarEstadoPago(participanteId: string, pagado: boolean): Promise<ParticipanteGasto> {
    if (!participanteId) throw new Error('ID de participante requerido');
    return await participanteGastoRepository.updatePagado(participanteId, pagado);
  },
};