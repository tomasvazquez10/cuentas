export const queryKeys = {
  movimientos: (userId: string | null) => ['movimientos', userId] as const,
  pagos: (userId: string | null) => ['pagos', userId] as const,
  perfil: (userId: string | null) => ['perfil', userId] as const,
  tarjetas: (userId: string | null) => ['tarjetas', userId] as const,
  grupos: (userId: string | null) => ['grupos', userId] as const,
  grupoDetalle: (userId: string | null, grupoId: string) =>
    ['grupo-detalle', userId, grupoId] as const,
  tarjetasPeriodo: (userId: string | null, anio: number, mes: number) =>
    ['tarjetas', userId, anio, mes] as const,
};
