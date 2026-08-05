import type { CalendarioPago } from '@types/index';

export const calendarioService = {
  async getPagos(): Promise<CalendarioPago[]> {
    return [];
  },

  async getPagosProximos(): Promise<CalendarioPago[]> {
    return [];
  },

  async createPago(pago: Omit<CalendarioPago, 'id' | 'created_by' | 'created_at'>): Promise<CalendarioPago> {
    return {
      id: `local-${Date.now()}`,
      created_by: 'local',
      created_at: new Date().toISOString(),
      ...pago,
    } as CalendarioPago;
  },

  async deletePago(_id: string): Promise<void> {
    return;
  },

  async updatePago(_id: string, _updates: Partial<Omit<CalendarioPago, 'id' | 'created_by' | 'created_at'>>): Promise<CalendarioPago> {
    return {
      id: _id,
      fecha: '',
      servicio: '',
      monto: 0,
      pago: false,
      created_by: 'local',
      created_at: new Date().toISOString(),
    };
  },
};
