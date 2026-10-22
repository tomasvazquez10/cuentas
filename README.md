````markdown
# 📱 Cuentas - Aplicación de Gestión Financiera Personal

Una aplicación móvil desarrollada con React Native y Expo para gestionar tus gastos diarios, ingresos y calendario de pagos de forma simple e intuitiva.

## ✨ Características

- 💰 **Registro de Movimientos**: Registra todos tus gastos e ingresos con categorías personalizables
- 📊 **Análisis Financiero**: Visualiza tu balance, ingresos y egresos en tiempo real
- 📅 **Calendario de Pagos**: Gestiona tus pagos pendientes y realiza un seguimiento
- 👤 **Gestión de Perfil**: Accede a tu información personal y configuración
- 🔐 **Autenticación Segura**: Login seguro con Supabase
- 📱 **Diseño Responsivo**: Interfaz optimizada para diferentes tamaños de pantalla
- ⚡ **Rendimiento**: Aplicación rápida y fluida

## 🛠️ Stack Tecnológico

### Frontend
- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo para React Native
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación entre pantallas
- **Context API** - Gestión de estado global

### Backend
- **Supabase** - Backend como servicio (BaaS)
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura

### Herramientas
- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Jest** - Framework de testing
- **Babel** - Transpilador de JavaScript

## 📦 Instalación

### Requisitos previos

- Node.js v18 o superior (se recomienda v20 LTS)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tomasvazquez10/cuentas.git
   cd cuentas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```
   EXPO_PUBLIC_SUPABASE_URL=tu_url_supabase
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Iniciar la aplicación**
   ```bash
   npx expo start
   ```

   Dentro de la terminal de Expo, usa los atajos de teclado: `i` para iOS (macOS), `a` para Android y `w` para web.

## 📁 Estructura del Proyecto

```
cuentas/
├── src/
│   ├── App.tsx                 # Configuración principal y navegación
│   ├── Root.tsx                # Componente raíz con providers
│   ├── screens/                # Pantallas de la aplicación
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── MovimientosScreen.tsx
│   │   ├── CalendarioScreen.tsx
│   │   ├── PerfilScreen.tsx
│   │   └── index.ts
│   ├── components/             # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── StatCard.tsx
│   │   ├── MovimientoCard.tsx
│   │   ├── PagoCard.tsx
│   │   ├── Card.tsx
│   │   ├── CustomModal.tsx
│   │   └── index.ts
│   ├── services/               # Servicios API
│   │   ├── auth.ts
│   │   ├── movimientos.ts
│   │   └── calendario.ts
│   ├── context/                # Context para estado global
│   │   ├── AuthContext.tsx
│   │   ├── AppContext.tsx
│   │   └── index.ts
│   ├── utils/                  # Utilidades y helpers
│   │   ├── colors.ts
│   │   └── formatting.ts
│   └── types/                  # Tipos TypeScript
│       └── index.ts
├── .env.local                  # Variables de entorno
├── .eslintrc.json              # Configuración ESLint
├── .prettierrc                 # Configuración Prettier
├── babel.config.js             # Configuración Babel
├── jest.config.js              # Configuración Jest
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Uso de la Aplicación

### Autenticación

1. Abre la aplicación
2. Regístrate con tu email y contraseña
3. O inicia sesión si ya tienes cuenta
4. ¡Listo! Ya puedes comenzar a usar la app

### Registro de Movimientos

1. Ve a la pestaña **Movimientos**
2. Haz clic en **+ Nuevo Movimiento**
3. Completa los campos:
   - **Tipo**: Ingreso o Egreso
   - **Concepto**: Descripción del movimiento
   - **Monto**: Cantidad
   - **Fecha**: Fecha del movimiento
   - **Categoría**: Clasifica el movimiento
   - **Método**: Forma de pago
   - **Nota** (opcional): Información adicional
4. Haz clic en **Crear**

### Gestión de Pagos

1. Ve a la pestaña **Pagos**
2. Haz clic en **+ Nuevo Pago**
3. Completa:
   - **Servicio**: Nombre del servicio
   - **Monto**: Cantidad a pagar
   - **Fecha de Pago**: Cuándo vence
4. Desliza el interruptor para marcar como pagado
5. Usa el botón de eliminar para remover pagos

### Análisis

En la pantalla **Inicio** verás:
- **Resumen Financiero** con ingresos, egresos y balance
- **Pagos Próximos** - Los 3 pagos más cercanos
- **Últimos Movimientos** - Los 5 movimientos más recientes

## 🔧 Scripts Disponibles

```bash
# Iniciar la aplicación
npm start

# Ejecutar linter
npm run lint

# Ejecutar tests
npm test

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en web
npm run web

# Verificar tipos TypeScript
npm run type-check
```

## 🔌 Integración con Supabase

La aplicación usa Supabase para:

- **Autenticación**: Sign up, Sign in, Sign out
- **Base de datos**: Almacenamiento de movimientos y pagos
- **Realtime**: Actualizaciones en tiempo real

### Configuración de Base de Datos

Las tablas necesarias son:

```sql
-- Tabla de movimientos
CREATE TABLE movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users,
  fecha DATE NOT NULL,
  tipo VARCHAR(10) NOT NULL, -- 'ingreso' o 'egreso'
  subtipo VARCHAR(50),
  concepto VARCHAR(255) NOT NULL,
  metodo VARCHAR(50),
  monto DECIMAL(10, 2) NOT NULL,
  nota TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE calendario_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users,
  fecha DATE NOT NULL,
  servicio VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  pago BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

## 🧪 Testing

Ejecuta los tests con:

```bash
npm test
```

Los tests se encuentran en archivos `.test.ts` o `.test.tsx` en cada módulo.

## 📱 Deployment

### Builds y actualizaciones con EAS

1. Instala EAS CLI globalmente:
   ```bash
   npm install -g eas-cli
   ```
   También puedes anteponer `npx eas-cli` a cada comando `eas` para ejecutarlo sin instalación global.
2. Inicia sesión y configura el proyecto:
   ```bash
   eas login
   eas build:configure
   ```

3. Genera un build para Android:
   ```bash
   eas build --platform android
   ```

   Para generar un APK, usa el perfil `preview`:
   ```bash
   eas build --platform android --profile preview
   ```

4. Genera un build para iOS:
   ```bash
   eas build --platform ios
   ```

5. Publica actualizaciones OTA:
   ```bash
   eas update
   ```

6. Envía los builds a las tiendas:
   ```bash
   eas submit
   ```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

El proyecto declara la licencia MIT; falta incluir el archivo `LICENSE` con el texto completo de esa licencia.

## 📞 Contacto

- **Autor**: Tomás Vázquez
- **Email**: tomasvazquez10@gmail.com
- **GitHub**: [@tomasvazquez10](https://github.com/tomasvazquez10)

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un issue en [GitHub Issues](https://github.com/tomasvazquez10/cuentas/issues) con:

- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Información del dispositivo/sistema

## 📚 Recursos Útiles

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.io/docs)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Hecho con ❤️ por Tomás Vázquez
````
