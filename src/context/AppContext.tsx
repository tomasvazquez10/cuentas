import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Movimiento, CalendarioPago } from '@types/index';
import { movimientosService } from '@services/movimientos';
import { calendarioService } from '@services/calendario';

interface AppContextType {
  // Movimientos
  movimientos: Movimiento[];
  loadMovimientos: () => Promise<void>;
  addMovimiento: (movimiento: Omit<Movimiento, 'id' | 'created_by' | 'created_at'>) => Promise<void>;
  deleteMovimiento: (id: string) => Promise<void>;
  updateMovimiento: (id: string, updates: Partial<Omit<Movimiento, 'id' | 'created_by' | 'created_at'>>) => Promise<void>;

  // Pagos
  pagos: CalendarioPago[];
  loadPagos: () => Promise<void>;
  addPago: (pago: Omit<CalendarioPago, 'id' | 'created_by' | 'created_at'>) => Promise<void>;
  deletePago: (id: string) => Promise<void>;
  updatePago: (id: string, updates: Partial<Omit<CalendarioPago, 'id' | 'created_by' | 'created_at'>>) => Promise<void>;

  // Loading states
  loadingMovimientos: boolean;
  loadingPagos: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [pagos, setPagos] = useState<CalendarioPago[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [loadingPagos, setLoadingPagos] = useState(false);

  // Movimientos
  const loadMovimientos = useCallback(async () => {
    setLoadingMovimientos(true);
    try {
      const data = await movimientosService.getMovimientos();
      setMovimientos(data);
    } finally {
      setLoadingMovimientos(false);
    }
  }, []);

  const addMovimiento = useCallback(
    async (movimiento: Omit<Movimiento, 'id' | 'created_by' | 'created_at'>) => {
      const newMovimiento = await movimientosService.createMovimiento(movimiento);
      setMovimientos([newMovimiento, ...movimientos]);
    },
    [movimientos]
  );

  const deleteMovimiento = useCallback(
    async (id: string) => {
      await movimientosService.deleteMovimiento(id);
      setMovimientos(movimientos.filter((m) => m.id !== id));
    },
    [movimientos]
  );

  const updateMovimiento = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Movimiento, 'id' | 'created_by' | 'created_at'>>
    ) => {
      const updated = await movimientosService.updateMovimiento(id, updates);
      setMovimientos(movimientos.map((m) => (m.id === id ? updated : m)));
    },
    [movimientos]
  );

  // Pagos
  const loadPagos = useCallback(async () => {
    setLoadingPagos(true);
    try {
      const data = await calendarioService.getPagos();
      setPagos(data);
    } finally {
      setLoadingPagos(false);
    }
  }, []);

  const addPago = useCallback(
    async (pago: Omit<CalendarioPago, 'id' | 'created_by' | 'created_at'>) => {
      const newPago = await calendarioService.createPago(pago);
      setPagos([...pagos, newPago].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
    },
    [pagos]
  );

  const deletePago = useCallback(
    async (id: string) => {
      await calendarioService.deletePago(id);
      setPagos(pagos.filter((p) => p.id !== id));
    },
    [pagos]
  );

  const updatePago = useCallback(
    async (
      id: string,
      updates: Partial<Omit<CalendarioPago, 'id' | 'created_by' | 'created_at'>>
    ) => {
      const updated = await calendarioService.updatePago(id, updates);
      setPagos(pagos.map((p) => (p.id === id ? updated : p)));
    },
    [pagos]
  );

  const value: AppContextType = {
    movimientos,
    loadMovimientos,
    addMovimiento,
    deleteMovimiento,
    updateMovimiento,
    pagos,
    loadPagos,
    addPago,
    deletePago,
    updatePago,
    loadingMovimientos,
    loadingPagos,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
