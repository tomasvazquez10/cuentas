export type TipoMovimiento = 'GASTO' | 'ENTRADA' | 'AHORRO'| 'INVERSION';
export type SubtipoMovimiento = 'FIJO' | 'BOLUDES' | 'DOLAR' | 'CEDEARS' | 'DEPTO' | 'SALIDAS' | 'SUPER' | 'OTRO' | 'SUELDO' | 'BONO';
export type MetodoMovimiento = 'EFECTIVO' | 'VISA' | 'AMEX' | 'MERCADOPAGO';

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

// Tipos para la gestión de Grupos y Gastos Compartidos

export type TipoDivision = 'IGUALITARIO' | 'PORCENTAJE' | 'MONTO_FIJO';
export type RolMiembro = 'ADMIN' | 'MIEMBRO'; // O los roles que manejes en tu app

export interface Grupo {
  id: string;
  nombre: string;
  descripcion: string | null;
  creado_por: string;
  created_at: string;
}

export interface MiembroGrupo {
  id: string;
  grupo_id: string;
  usuario_id: string;
  rol: string; // 'ADMIN' | 'MIEMBRO' u otros
  joined_at: string;
  // Opcional: si haces un JOIN con la tabla 'perfiles' para mostrar el nombre/avatar
  perfiles?: {
    nombre: string | null;
    email: string;
  };
}

export interface GastoCompartido {
  id: string;
  movimiento_id: string;
  tipo_division: TipoDivision;
  created_by: string;
  created_at: string;
  grupo_id: string | null;
}

export interface ParticipanteGasto {
  id: string;
  gasto_compartido_id: string;
  usuario_id: string;
  porcentaje: number | null;
  monto_correspondiente: number;
  pagado: boolean;
  // Opcional: JOIN con perfiles para ver quién es el participante
  perfiles?: {
    nombre: string | null;
    email: string;
  };
}

// Interfaz compuesta útil para las pantallas donde muestras el gasto con sus participantes y movimientos
export interface GastoCompartidoDetalle extends GastoCompartido {
  participantes: ParticipanteGasto[];
  movimiento?: {
    concepto: string;
    monto: number;
    fecha: string;
  };
}