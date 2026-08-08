import { supabase } from '../lib/supabase';

export const tarjetaRepository = {
  async findByPeriodo(userId: string, anio: number, mes: number) {
    const { data, error } = await supabase
      .from('datos_tarjeta')
      .select('*')
      .eq('created_by', userId)
      .eq('anio', anio)
      .eq('mes', mes)
      .order('tarjeta');

    if (error) throw error;
    return data;
  },
};
