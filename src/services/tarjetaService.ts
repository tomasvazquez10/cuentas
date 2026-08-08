import { authRepository } from '@repositories/authRepository';
import { tarjetaRepository } from '@repositories/tarjetaRepository';

export const tarjetaService = {
  async listarPorPeriodo(anio: number, mes: number) {
    const user = await authRepository.currentUser();
    if (!user) throw new Error('Debes iniciar sesion para ver tus tarjetas');
    return tarjetaRepository.findByPeriodo(user.id, anio, mes);
  },
};
