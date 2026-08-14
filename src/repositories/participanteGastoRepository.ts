import { supabase } from '../lib/supabase';
import { ParticipanteGasto } from '../types';

export const participanteGastoRepository = {
  async findByGastoCompartidoId(gastoCompartidoId: string): Promise<ParticipanteGasto[]> {
    const { data, error } = await supabase
      .from('participantes_gasto')
      .select(`
        *,
        perfiles:usuario_id (
          nombre,
          email
        )
      `)
      .eq('gasto_compartido_id', gastoCompartidoId);

    if (error) throw error;

    return data as ParticipanteGasto[];
  },

  // Inserción en lote para los participantes de un gasto
  async createMany(participantes: Omit<ParticipanteGasto, 'id'>[]): Promise<ParticipanteGasto[]> {
    const { data, error } = await supabase
      .from('participantes_gasto')
      .insert(participantes)
      .select();

    if (error) throw error;

    return data as ParticipanteGasto[];
  },

  async updatePagado(id: string, pagado: boolean): Promise<ParticipanteGasto> {
    const { data, error } = await supabase
      .from('participantes_gasto')
      .update({ pagado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as ParticipanteGasto;
  },

  async deleteByGastoId(gastoCompartidoId: string): Promise<void> {
    const { error } = await supabase
      .from('participantes_gasto')
      .delete()
      .eq('gasto_compartido_id', gastoCompartidoId);

    if (error) throw error;
  }
};