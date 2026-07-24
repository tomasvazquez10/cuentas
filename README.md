# Cuentas - Aplicación Mobile de Gestión de Gastos

Aplicación mobile para gestionar gastos diarios y calendario de pagos, construida con React Native/Expo y Supabase.

## Características

### Gestión de Movimientos
- ✅ Registrar gastos e ingresos diarios
- ✅ Categorizar movimientos (trabajo, compras, servicios, transporte, alimentación, salud, entretenimiento)
- ✅ Registrar método de pago (efectivo, tarjeta débito/crédito, transferencia)
- ✅ Agregar notas a los movimientos
- ✅ Editar y eliminar movimientos
- ✅ Ver resumen de gastos por período

### Calendario de Pagos
- ✅ Crear recordatorios de pagos pendientes
- ✅ Marcar pagos como realizados
- ✅ Ver pagos próximos (próximos 30 días)
- ✅ Editar y eliminar pagos
- ✅ Ver total de pagos pendientes

### Autenticación
- ✅ Registro e inicio de sesión
- ✅ Persistencia de sesión
- ✅ Gestión de perfil de usuario

## Stack Tecnológico

- **Framework UI**: React Native 0.73
- **Plataforma**: Expo 51
- **Backend**: Supabase (PostgreSQL)
- **Navegación**: React Navigation
- **Estado**: React Context + Hooks
- **Lenguaje**: TypeScript
- **Fechas**: date-fns

## Instalación

### Requisitos Previos
- Node.js >= 18
- npm o yarn
- Expo CLI: `npm install -g expo-cli`

### Pasos de Instalación

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
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Supabase:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Iniciar la aplicación**
   ```bash
   npm start
   # o
   yarn start
   ```

   - Para iOS: Presiona `i`
   - Para Android: Presiona `a`
   - Para Web: Presiona `w`

## Estructura del Proyecto

```
cuentas/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── screens/             # Pantallas de la app
│   │   ├── HomeScreen.tsx
│   │   ├── MovimientosScreen.tsx
│   │   ├── CalendarioScreen.tsx
│   │   ├── PerfilScreen.tsx
│   │   └── AuthScreen.tsx
│   ├── services/            # Servicios de API
│   │   ├── supabase.ts
│   │   ├── movimientos.ts
│   │   ├── calendario.ts
│   │   └── auth.ts
│   ├── utils/              # Utilidades
│   │   ├── formatting.ts
│   │   ├── colors.ts
│   │   └── constants.ts
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts
│   ├── context/            # Context API
│   └── App.tsx             # Componente principal
├── app.json                # Configuración de Expo
├── package.json
├── tsconfig.json
└── .env.example
```

## Base de Datos

La aplicación utiliza Supabase con las siguientes tablas:

### movimientos
Registra todos los movimientos financieros (ingresos y egresos)

### calendario_pagos
Guarda los recordatorios de pagos pendientes

### perfiles
Guarda la información del perfil de usuario

## Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en Web
npm run web

# Ejecutar pruebas
npm test

# Verificar tipos TypeScript
npm run type-check

# Linter
npm run lint
```

## Pasos Siguientes

- [ ] Implementar pantallas y componentes
- [ ] Crear Context API para estado global
- [ ] Implementar persistencia local con AsyncStorage
- [ ] Agregar notificaciones push
- [ ] Implementar gráficos de gastos
- [ ] Agregar filtros avanzados
- [ ] Exportar datos a CSV/PDF
- [ ] Agregar temas (light/dark mode)
- [ ] Pruebas unitarias e integración
- [ ] Publicar en App Store y Google Play

## Contribución

Los pull requests son bienvenidos. Para cambios mayores, abre un issue primero para discutir qué te gustaría cambiar.

## Licencia

MIT
