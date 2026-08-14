import { miembroGrupoRepository } from '../repositories/miembroGrupoRepository';
import { MiembroGrupo } from '../types';

export const miembroGrupoService = {
  async obtenerMiembros(grupoId: string): Promise<MiembroGrupo[]> {
    if (!grupoId) throw new Error('ID de grupo requerido');
    return await miembroGrupoRepository.findByGrupoId(grupoId);
  },

  async agregarMiembro(
    grupoId: string,
    usuarioId: string,
    rol: string = 'MIEMBRO'
  ): Promise<MiembroGrupo> {
    if (!grupoId || !usuarioId) throw new Error('Datos incompletos para agregar miembro');
    
    return await miembroGrupoRepository.addMember({
      grupo_id: grupoId,
      usuario_id: usuarioId,
      rol,
    });
  },

  async quitarMiembro(grupoId: string, usuarioId: string): Promise<void> {
    if (!grupoId || !usuarioId) throw new Error('Datos incompletos');
    await miembroGrupoRepository.removeMember(grupoId, usuarioId);
  },

  async cambiarRol(id: string, nuevoRol: string): Promise<MiembroGrupo> {
    return await miembroGrupoRepository.updateRole(id, nuevoRol);
  },
};