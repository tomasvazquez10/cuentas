import { useQuery } from '@tanstack/react-query';
import { calendarioPagoService } from '@services/calendarioPagoService';
import { gastoCompartidoService } from '@services/gastoCompartidoService';
import { grupoService } from '@services/grupoService';
import { miembroGrupoService } from '@services/miembroGrupoService';
import { movimientoService } from '@services/movimientoService';
import { perfilService } from '@services/perfilService';
import { tarjetaService } from '@services/tarjetaService';
import { useAuth } from '@context/AuthContext';
import {
  CalendarioPago,
  GastoCompartido,
  Grupo,
  MiembroGrupo,
  Movimiento,
  Perfil,
} from '@models/index';
import { queryKeys } from './queryKeys';

export const useMovimientosQuery = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.movimientos(userId),
    queryFn: async (): Promise<Movimiento[]> => movimientoService.listar(),
    enabled: !!userId,
  });
};

export const usePagosQuery = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.pagos(userId),
    queryFn: async (): Promise<CalendarioPago[]> => calendarioPagoService.listar(),
    enabled: !!userId,
  });
};

export const usePerfilQuery = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.perfil(userId),
    queryFn: async (): Promise<Perfil | null> => {
      if (!userId) return null;
      return perfilService.getPerfil(userId);
    },
    enabled: !!userId,
  });
};

export const useTarjetasPeriodoQuery = (anio: number, mes: number) => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.tarjetasPeriodo(userId, anio, mes),
    queryFn: () => tarjetaService.listarPorPeriodo(anio, mes),
    enabled: !!userId,
  });
};

interface GrupoConBalance {
  grupo: Grupo;
  balance: number;
}

export const useGruposConBalanceQuery = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.grupos(userId),
    queryFn: async (): Promise<GrupoConBalance[]> => {
      const grupos = await grupoService.obtenerGruposDelUsuario();
      return Promise.all(
        grupos.map(async (grupo) => {
          const gastos = await gastoCompartidoService.obtenerGastosDeGrupo(grupo.id);
          const balance = gastos.reduce(
            (total, gasto) => total + (gasto.movimientos?.monto ?? 0),
            0
          );
          return { grupo, balance };
        })
      );
    },
    enabled: !!userId,
  });
};

export interface GrupoDetalleData {
  grupo: Grupo;
  miembros: MiembroGrupo[];
  gastos: GastoCompartido[];
}

export const useGrupoDetalleQuery = (grupoId: string) => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.grupoDetalle(userId, grupoId),
    queryFn: async (): Promise<GrupoDetalleData> => {
      const [grupo, miembros, gastos] = await Promise.all([
        grupoService.obtenerGrupoPorId(grupoId),
        miembroGrupoService.obtenerMiembros(grupoId),
        gastoCompartidoService.obtenerGastosDeGrupo(grupoId),
      ]);
      return { grupo, miembros, gastos };
    },
    enabled: !!userId && !!grupoId,
  });
};
