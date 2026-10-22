import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';
import type { AppRootParamList } from './types';

export const linking: LinkingOptions<AppRootParamList> = {
  prefixes: [Linking.createURL('/'), 'cuentas://'],
  config: {
    screens: {
      Auth: 'auth',
      Tabs: {
        path: '',
        screens: {
          Inicio: '',
          Movimientos: 'movimientos',
          Pagos: 'pagos',
          Perfil: 'perfil',
        },
      },
      Resumen: 'resumen',
      Tarjetas: 'tarjetas',
      Grupos: {
        path: 'grupos',
        screens: {
          GruposMain: '',
          GrupoDetalleScreen: ':grupoId',
        },
      },
    },
  },
};
