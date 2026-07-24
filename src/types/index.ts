export type TipoMovimiento = 'ingreso' | 'egreso';
export type SubtipoMovimiento = 'trabajo' | 'compra' | 'servicios' | 'transporte' | 'alimentacion' | 'salud' | 'entretenimiento' | 'otro';
export type MetodoMovimiento = 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'otro';

export interface Movimiento {
  id: string;
  fecha: string; // ISO 8601 date
  tipo: TipoMovimiento;
  subtipo: SubtipoMovimiento;
  concepto: string;
  metodo: MetodoMovimiento;
  monto: number;
  nota?: string;
  created_by: string;
  created_at: string; // ISO 8601 timestamp
}

export interface CalendarioPago {
  id: string;
  fecha: string; // ISO 8601 date
  servicio: string;
  monto: number;
  pago: boolean;
  created_by: string;
  created_at: string; // ISO 8601 timestamp
}

export interface Perfil {
  id: string;
  nombre?: string;
  email: string;
  created_at: string; // ISO 8601 timestamp
}

export interface AuthSession {
  user: Perfil | null;
  isLoading: boolean;
  isSignedIn: boolean;
}
