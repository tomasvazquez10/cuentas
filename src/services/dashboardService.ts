import { movimientoRepository } from '@repositories/movimientoRepository';
import { calendarioPagoRepository } from '@repositories/calendarioPagoRepository';
import { authRepository } from '@repositories/authRepository';
import { parseDateAsLocal } from '@utils/formatting';

export const dashboardService = {

  async resumen() {

    const user = await authRepository.currentUser();
    if (!user) throw new Error('Debes iniciar sesion para ver el resumen');

    const [
      movimientos,
      pagos
    ] = await Promise.all([
      movimientoRepository.findAll(user.id),
      calendarioPagoRepository.findPendientes(user.id)
    ]);

    const ingresos = movimientos
      .filter(m => m.tipo === 'ENTRADA')
      .reduce((total, m) => total + Number(m.monto), 0);

    const gastos = movimientos
      .filter(m => m.tipo !== 'ENTRADA')
      .reduce((total, m) => total + Number(m.monto), 0);

    return {
      saldo: ingresos - gastos,
      ingresos,
      gastos,
      cantidadMovimientos: movimientos.length,
      pagosPendientes: pagos.length,
      proximosPagos: pagos
        .sort(
          (a, b) =>
            parseDateAsLocal(a.fecha).getTime() -
            parseDateAsLocal(b.fecha).getTime()
        )
        .slice(0, 5)
    };

  }

};
