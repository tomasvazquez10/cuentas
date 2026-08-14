import { grupoRepository } from '../repositories/grupoRepository';
import { miembroGrupoRepository } from '../repositories/miembroGrupoRepository';
import { authRepository } from '../repositories/authRepository'; // 👈 Importamos tu authRepository
import { Grupo } from '../types';

// Helper interno siguiendo tu patrón
const getAuthenticatedUserId = async () => {
  const user = await authRepository.currentUser();
  if (!user) throw new Error('Debes iniciar sesión para realizar esta acción');
  return user.id;
};

export const grupoService = {
  async obtenerGruposDelUsuario(): Promise<Grupo[]> {
    const userId = await getAuthenticatedUserId();
    return await grupoRepository.findAllByUser(userId);
  },

  async obtenerGrupoPorId(id: string): Promise<Grupo> {
    if (!id) throw new Error('ID de grupo inválido');
    return await grupoRepository.findById(id);
  },

  /**
   * Crea un grupo obteniendo automáticamente el ID del usuario autenticado
   * y añadiéndolo como miembro ADMIN.
   */
  async crearGrupo(
    nombre: string,
    descripcion: string | null
  ): Promise<Grupo> {
    if (!nombre.trim()) throw new Error('El nombre del grupo es obligatorio');

    const userId = await getAuthenticatedUserId();

    // 1. Crear el grupo asignando el 'creado_por' con el usuario autenticado
    const nuevoGrupo = await grupoRepository.create({
      nombre,
      descripcion,
      creado_por: userId,
    });

    // 2. Añadir al creador como miembro ADMIN en la tabla intermedia
    await miembroGrupoRepository.addMember({
      grupo_id: nuevoGrupo.id,
      usuario_id: userId,
      rol: 'ADMIN',
    });

    return nuevoGrupo;
  },

  async actualizarGrupo(
    id: string,
    datosActualizados: Partial<Omit<Grupo, 'id' | 'created_at' | 'creado_por'>>
  ): Promise<Grupo> {
    const userId = await getAuthenticatedUserId();
    const grupo = await grupoRepository.findById(id);

    if (grupo.creado_por !== userId) {
      throw new Error('No tienes permisos para modificar este grupo');
    }

    return await grupoRepository.update(id, datosActualizados);
  },

  async eliminarGrupo(id: string): Promise<void> {
    const userId = await getAuthenticatedUserId();
    const grupo = await grupoRepository.findById(id);

    if (grupo.creado_por !== userId) {
      throw new Error('Solo el creador puede eliminar el grupo');
    }
    
    await grupoRepository.delete(id);
  },
};