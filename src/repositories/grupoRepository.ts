import { supabase } from '../lib/supabase';
import { Grupo } from '../types'; // Ajusta la ruta si es necesario

export const grupoRepository = {
  async findAllByUser(userId: string): Promise<Grupo[]> {
    // Primero buscamos los IDs de los grupos donde el usuario es miembro
    const { data: membresias, error: errorMembresias } = await supabase
      .from('miembros_grupo')
      .select('grupo_id')
      .eq('usuario_id', userId);

    if (errorMembresias) throw errorMembresias;
    if (!membresias || membresias.length === 0) return [];

    const grupoIds = membresias.map((m) => m.grupo_id);

    // Luego traemos los datos de esos grupos
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .in('id', grupoIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as Grupo[];
  },

  async findById(id: string): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as Grupo;
  },

  async create(grupo: Omit<Grupo, 'id' | 'created_at'>): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupos')
      .insert(grupo)
      .select()
      .single();

    if (error) throw error;

    return data as Grupo;
  },

  async update(id: string, grupo: Partial<Omit<Grupo, 'id' | 'created_at' | 'creado_por'>>): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupos')
      .update(grupo)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Grupo;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('grupos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};