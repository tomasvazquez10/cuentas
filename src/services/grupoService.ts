import { grupoRepository } from '../repositories/grupoRepository';
import { miembroGrupoRepository } from '../repositories/miembroGrupoRepository';
import { Grupo, MiembroGrupo } from '../types';

export const grupoService = {
  async obtenerGruposDelUsuario(userId: string): Promise<Grupo[]> {
    if (!userId) throw new Error('Usuario no autenticado');
    return await grupoRepository.findAllByUser(userId);
  },

  async obtenerGrupoPorId(id: string): Promise<Grupo> {
    if (!id) throw new Error('ID de grupo inválido');
    return await grupoRepository.findById(id);
  },

  /**
   * Crea un grupo y automáticamente añade al creador como miembro con rol ADMIN.
   */
  async crearGrupo(
    nombre: string,
    descripcion: string | null,
    userId: string
  ): Promise<Grupo> {
    if (!nombre.trim()) throw new Error('El nombre del grupo es obligatorio');

    // 1. Crear el grupo
    const nuevoGrupo = await grupoRepository.create({
      nombre,
      descripcion,
      creado_por: userId,
    });

    // 2. Añadir al creador como miembro ADMIN
    await miembroGrupoRepository.addMember({
      grupo_id: nuevoGrupo.id,
      usuario_id: userId,
      rol: 'ADMIN',
    });

    return nuevoGrupo;
  },

  async actualizarGrupo(
    id: string,
    userId: string,
    datosActualizados: Partial<Omit<Grupo, 'id' | 'created_at' | 'creado_por'>>
  ): Promise<Grupo> {
    // Opcional: Podrías validar aquí si el usuario es ADMIN antes de dejarlo editar
    const grupo = await grupoRepository.findById(id);
    if (grupo.creado_por !== userId) {
      throw new Error('No tienes permisos para modificar este grupo');
    }

    return await grupoRepository.update(id, datosActualizados);
  },

  async eliminarGrupo(id: string, userId: string): Promise<void> {
    const grupo = await grupoRepository.findById(id);
    if (grupo.creado_por !== userId) {
      throw new Error('Solo el creador puede eliminar el grupo');
    }
    await grupoRepository.delete(id);
  },
};