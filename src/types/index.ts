export type TipoMovimiento = 'GASTO' | 'ENTRADA' | 'AHORRO'| 'INVERSION';
export type SubtipoMovimiento = 'FIJO' | 'BOLUDES' | 'DOLAR' | 'CEDEARS' | 'DEPTO' | 'SALIDAS' | 'SUPER' | 'OTRO' | 'SUELDO' | 'BONO';
export type MetodoMovimiento = 'VISA' | 'AMEX' | 'EFECTIVO' | 'MERCADOPAGO';

export interface Movimiento {
 id:string;
 fecha:string;
 tipo:string;
 subtipo:string;
 concepto:string;
 metodo:string;
 monto:number;
 nota?:string;
 cuota_actual?: number;
 total_cuotas?: number;
 compra_id?: string;
 created_by:string;
 created_at:string;
}

export interface CalendarioPago {
 id:string;
 fecha:string;
 servicio:string;
 monto:number;
 pago:boolean;
 created_by:string;
 created_at:string;
}

export interface DatoTarjeta {
 id: string;
 tarjeta: 'VISA' | 'AMEX' | 'MERCADOPAGO';
 anio: number;
 mes: number;
 fecha_cierre: string;
 fecha_vencimiento: string;
 created_by: string;
 created_at: string;
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
