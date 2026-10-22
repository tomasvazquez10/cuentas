import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MetodoMovimiento, SubtipoMovimiento, TipoMovimiento } from '@models/index';

export type MovimientoPrefillParams = {
  fecha: string;
  tipo: TipoMovimiento;
  subtipo: SubtipoMovimiento;
  metodo: MetodoMovimiento;
  concepto: string;
  monto: string;
};

export type AuthStackParamList = {
  Auth: undefined;
};

export type TabParamList = {
  Inicio: undefined;
  Movimientos:
    | {
        filtroMetodo?: MetodoMovimiento;
        prefillMovimiento?: MovimientoPrefillParams;
      }
    | undefined;
  Pagos: undefined;
  Perfil: undefined;
};

export type GruposStackParamList = {
  GruposMain: undefined;
  GrupoDetalleScreen: {
    grupoId: string;
    grupoNombre?: string;
  };
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Resumen: undefined;
  Tarjetas: undefined;
  Grupos: NavigatorScreenParams<GruposStackParamList> | undefined;
};

export interface AppRootParamList
  extends AuthStackParamList,
    MainStackParamList,
    TabParamList,
    GruposStackParamList {}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRootParamList {}
  }
}

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Inicio'>,
  NativeStackScreenProps<MainStackParamList>
>;

export type MovimientosScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Movimientos'>,
  NativeStackScreenProps<MainStackParamList>
>;

export type TarjetasScreenProps = NativeStackScreenProps<MainStackParamList, 'Tarjetas'>;

export type GruposScreenProps = NativeStackScreenProps<GruposStackParamList, 'GruposMain'>;

export type GrupoDetalleScreenProps = NativeStackScreenProps<
  GruposStackParamList,
  'GrupoDetalleScreen'
>;
