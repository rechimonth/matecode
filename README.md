# MateCode - Gestor de Tareas

Aplicación web SPA para gestión de tareas diarias con autenticación, persistencia en la nube y notificaciones por email. Desarrollada como solución para pequeñas empresas.

## Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend as a Service**: Firebase (Auth + Cloud Firestore)
- **Emails**: AWS SES invocado desde Vercel Serverless Functions
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **Deploy**: Vercel
- **Linting**: ESLint + Prettier

## Decisiones Arquitectónicas

### Estructura por capas

El proyecto está organizado en capas claras:

- `src/pages/`: Vistas principales de la aplicación (Login, Register, Tasks)
- `src/components/`: Componentes UI reutilizables (TodoForm, TodoList, Header, etc.)
- `src/features/`: Lógica de dominio aislada por contexto (auth, tasks)
- `src/services/`: Integraciones con servicios externos (Firebase Auth, Firestore)
- `src/hooks/`: Hooks personalizados (useAuth, useTasks, useTaskStats, useForm)
- `src/types/`: Tipos e interfaces TypeScript compartidos
- `src/utils/`: Helpers y validadores
- `api/`: Vercel Serverless Functions para envío de emails (AWS SES)

### Estado y Contextos

Se utilizaron Contextos de React (`AuthContext`, `TasksContext`) para centralizar la gestión de autenticación y tareas. Esto evita prop drilling y facilita la escalabilidad.

### Persistencia y Seguridad

- Firestore almacena tareas con un campo `userId` para aislar datos por usuario.
- La autenticación se maneja mediante Firebase Auth (email/password y Google).
- Las rutas protegidas usan `ProtectedRoute` para restringir acceso.

### Emails (AWS SES)

Los emails se envían desde Vercel Functions para no exponer credenciales de AWS en el frontend. El flujo es:

1. El usuario presiona "Enviar resumen por email".
2. El frontend invoca `/api/send-summary` con el `userId` y resumen de tareas.
3. Vercel Function usa AWS SDK para enviar el email mediante SES.

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/matecode.git
cd matecode

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Completar .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

Creá un archivo `.env` basado en `.env.example` con las siguientes variables:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# API
VITE_API_URL=

# AWS SES (solo para Vercel Functions / producción)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=
```

> ⚠️ Nunca subas el archivo `.env` al repositorio. Incluí `.env` en `.gitignore`.

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm run build` | Genera la build de producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run test` | Ejecuta los tests con Vitest |
| `npm run test:watch` | Ejecuta los tests en modo watch |

## Flujo de Envío de Emails

1. **Frontend**: El botón "Enviar resumen por email" en `src/components/EmailButton.tsx` construye un payload con el email del usuario y el resumen de sus tareas.
2. **Vercel Function**: Se hace un `POST` a `/api/send-summary` (configurado en `api/send-summary.ts`).
3. **AWS SES**: La función usa el AWS SDK v3 con las credenciales almacenadas como variables de entorno en Vercel para enviar el email HTML renderizado.

El HTML del email se genera dinámicamente con el nombre del usuario, cantidad de tareas pendientes/completadas y el listado detallado.

## Testing

```bash
npm run test
```

Se incluyen:
- Tests unitarios de validadores (`tests/validators.test.ts`)
- Tests de servicios externos (`tests/services/auth.test.ts`, `tests/services/tasks.test.ts`)
- Tests de contextos (`tests/AuthContext.test.tsx`, `tests/TasksContext.test.tsx`)
- Tests de componentes (`tests/components/EmailButton.test.tsx`, `tests/components/Header.test.tsx`, `tests/components/TaskFilters.test.tsx`, `tests/TodoForm.test.tsx`)
- Tests de páginas (`tests/pages/LoginPage.test.tsx`, `tests/pages/RegisterPage.test.tsx`)
- Tests de rutas (`tests/ProtectedRoute.test.tsx`)

## Seguridad

- **No exponer secretos**: Las credenciales de Firebase y AWS se manejan como variables de entorno.
- **Reglas de Firestore**: Configurar reglas para que cada usuario solo acceda a sus propias tareas.
- **Protección de rutas**: `ProtectedRoute` redirige a usuarios no autenticados.

## Uso de IA en el Proceso de Desarrollo

Utilicé IA para acelerar la generación de código boilerplate y sugerencias de arquitectura:

- **Prompts efectivos**: Pedí estructuras de carpetas, patrones de Context API y ejemplos de pruebas con Vitest.
- **Situaciones donde más ayudó**:
  - Generación de layouts de formularios y componentes UI consistentes.
  - Configuración inicial de Vite + TypeScript + Tailwind.
  - Estructura de tests con mocks predictivos.
- **Patrones descubiertos**:
  - Separar lógica de dominio en `features/` mejora la mantenibilidad.
  - El uso de Context Providers con `useCallback` y `useMemo` previene re-renders innecesarios.
  - Los alias de paths (`@/*`) en Vite aceleran la importación y hacen el código más limpio.

## Deploy en Producción

1. Subir el código a GitHub/GitLab.
2. Importar el repositorio en [Vercel](https://vercel.com).
3. Configurar variables de entorno en Vercel (Firebase + AWS SES).
4. Verificar que la función `/api/send-summary` tenga acceso a las variables de AWS.
5. URL de producción: https://matecode-n5pccoo2a-rechimonths-projects.vercel.app

## Checklist de Validación

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin warnings
- [ ] `npm run test` pasa con tests nuevos
- [ ] App funcional en Vercel con URL pública
- [ ] Auth, CRUD, filtros, drag & drop y email funcionan
- [ ] `.env` excluido del repo
- [ ] Reglas de Firestore deployadas

## Licencia

MIT
