import { movimientoRepository } from '@repositories/movimientoRepository';
import { calendarioPagoRepository } from '@repositories/calendarioPagoRepository';

export const dashboardService = {

  async resumen() {

    const [
      movimientos,
      pagos
    ] = await Promise.all([
      movimientoRepository.findAll(),
      calendarioPagoRepository.findPendientes()
    ]);

    const ingresos = movimientos
      .filter(m => m.tipo === 'ENTRADA')
      .reduce((total, m) => total + Number(m.monto), 0);

    const gastos = movimientos
      .filter(m => m.tipo === 'GASTO')
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
            new Date(a.fecha).getTime() -
            new Date(b.fecha).getTime()
        )
        .slice(0, 5)
    };

  }

};