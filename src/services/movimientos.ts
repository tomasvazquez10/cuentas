import type { Movimiento } from '@types/index';

export const movimientosService = {
  async getMovimientos(): Promise<Movimiento[]> {
    return [];
  },

  async createMovimiento(movimiento: Omit<Movimiento, 'id' | 'created_by' | 'created_at'>): Promise<Movimiento> {
    return {
      id: `local-${Date.now()}`,
      created_by: 'local',
      created_at: new Date().toISOString(),
      ...movimiento,
    } as Movimiento;
  },

  async deleteMovimiento(_id: string): Promise<void> {
    return;
  },

  async updateMovimiento(_id: string, _updates: Partial<Omit<Movimiento, 'id' | 'created_by' | 'created_at'>>): Promise<Movimiento> {
    return {
      id: _id,
      fecha: '',
      tipo: 'egreso',
      subtipo: 'otro',
      concepto: '',
      metodo: 'efectivo',
      monto: 0,
      created_by: 'local',
      created_at: new Date().toISOString(),
    };
  },
};
