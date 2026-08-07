export const colors = {
  primary: '#5B4BDB',
  secondary: '#7C6DF2',
  success: '#18A87A',
  danger: '#E05263',
  warning: '#E6A23C',
  ingresos: '#18A87A',
  egresos: '#E05263',
  metodos: {
    EFECTIVO: '#166534',
    VISA: '#2563EB',
    AMEX: '#0EA5E9',
    MERCADOPAGO: '#EAB308',
  },
  light: '#F7F7FB',
  dark: '#1D1B38',
  gray: {
    50: '#FAFAFC',
    100: '#F1F0F6',
    200: '#E5E3EC',
    300: '#D1CEDC',
    400: '#9994AA',
    500: '#716C80',
    600: '#575264',
    700: '#3B3748',
    800: '#292536',
    900: '#1D1B38',
  },
};

export const getMetodoColor = (metodo: string) =>
  colors.metodos[metodo as keyof typeof colors.metodos] ?? colors.primary;
