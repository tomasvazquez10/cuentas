import { supabase } from '../lib/supabase';

export const perfilRepository = {

  async getById(id: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  },


  async create(perfil: any) {
    const { data, error } = await supabase
      .from('perfiles')
      .insert(perfil)
      .select()
      .single();

    if (error) throw error;

    return data;
  },


  async update(id: string, perfil: any) {
    const { data, error } = await supabase
      .from('perfiles')
      .update(perfil)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

};