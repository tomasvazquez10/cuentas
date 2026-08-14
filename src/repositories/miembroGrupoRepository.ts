import { supabase } from '../lib/supabase';
import { MiembroGrupo } from '../types';

export const miembroGrupoRepository = {
  async findByGrupoId(grupoId: string): Promise<MiembroGrupo[]> {
    const { data, error } = await supabase
      .from('miembros_grupo')
      .select(`
        *,
        perfiles:usuario_id (
          nombre,
          email
        )
      `)
      .eq('grupo_id', grupoId);

    if (error) throw error;

    return data as MiembroGrupo[];
  },

  async addMember(miembro: Omit<MiembroGrupo, 'id' | 'joined_at'>): Promise<MiembroGrupo> {
    const { data, error } = await supabase
      .from('miembros_grupo')
      .insert(miembro)
      .select()
      .single();

    if (error) throw error;

    return data as MiembroGrupo;
  },

  async removeMember(grupoId: string, usuarioId: string): Promise<void> {
    const { error } = await supabase
      .from('miembros_grupo')
      .delete()
      .eq('grupo_id', grupoId)
      .eq('usuario_id', usuarioId);

    if (error) throw error;
  },

  async updateRole(id: string, rol: string): Promise<MiembroGrupo> {
    const { data, error } = await supabase
      .from('miembros_grupo')
      .update({ rol })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as MiembroGrupo;
  }
};