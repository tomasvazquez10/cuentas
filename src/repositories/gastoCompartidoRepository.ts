import { supabase } from '../lib/supabase';
import { GastoCompartido } from '../types';

export const gastoCompartidoRepository = {
  async findByGrupoId(grupoId: string): Promise<GastoCompartido[]> {
    const { data, error } = await supabase
      .from('gastos_compartidos')
      .select(`
        *,
        movimientos:movimiento_id (*)
      `)
      .eq('grupo_id', grupoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as GastoCompartido[];
  },

  async findById(id: string): Promise<GastoCompartido> {
    const { data, error } = await supabase
      .from('gastos_compartidos')
      .select(`
        *,
        movimientos:movimiento_id (*),
        participantes_gasto:participantes_gasto (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as GastoCompartido;
  },

  async create(gasto: Omit<GastoCompartido, 'id' | 'created_at'>): Promise<GastoCompartido> {
    const { data, error } = await supabase
      .from('gastos_compartidos')
      .insert(gasto)
      .select()
      .single();

    if (error) throw error;

    return data as GastoCompartido;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('gastos_compartidos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};