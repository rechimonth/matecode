# MateCode

Aplicación web SPA para gestionar tareas personales de forma simple, con autenticación, persistencia en Cloud Firestore y envío opcional de resúmenes por email.

**Demo:** https://matecode-lyart.vercel.app

## Qué resuelve

MateCode permite que un usuario autenticado cree, consulte, edite, complete y elimine sus propias tareas. El objetivo académico es demostrar un CRUD completo, autenticación, autorización por usuario, manejo de estado, validación de datos, testing y despliegue serverless.

## Usuarios objetivo

- Estudiantes que necesiten demostrar un CRUD full stack funcional.
- Personas y freelancers que quieran organizar tareas personales.
- Equipos pequeños que necesiten una herramienta simple de seguimiento.

## Funcionalidades implementadas

- Registro e inicio de sesión con email/contraseña.
- Inicio de sesión con Google.
- Persistencia de sesión mediante Firebase Auth.
- CRUD completo de tareas.
- Edición accesible desde cada tarea mediante **Editar**.
- Estados `pending` y `completed`.
- Prioridades `low`, `medium` y `high`.
- Fecha de vencimiento con semántica de fecha de calendario.
- Filtros por estado.
- Actualización optimista del estado completada/pendiente con rollback ante error.
- Eliminación con confirmación.
- Drag & drop con teclado mediante `@dnd-kit` y **persistencia del orden en Firestore**.
- Envío de resumen por email mediante AWS SES desde una función serverless de Vercel.
- Pantalla de error recuperable para fallos de arranque/renderizado, evitando una pantalla blanca silenciosa.

### Importante: tiempo real

MateCode no utiliza actualmente `onSnapshot`. Después de las operaciones CRUD se vuelve a consultar la colección para sincronizar el estado de la UI. Por lo tanto, el proyecto **no se describe como sincronización realtime**.

## Stack

| Tecnología | Uso |
|---|---|
| React | Interfaz SPA |
| TypeScript | Tipado estático |
| Vite | Desarrollo y build |
| Tailwind CSS | Estilos responsive |
| Firebase Auth | Autenticación |
| Cloud Firestore | Persistencia |
| AWS SES SDK | Email |
| Vercel | Hosting + serverless function |
| Vitest + Testing Library | Testing |
| dnd-kit | Drag & drop |
| lucide-react | Iconos |

## Arquitectura

```text
src/pages
   ↓
src/components
   ↓
src/features/*Context
   ↓
src/services
   ↓
Firebase / Vercel API / AWS SES
```

La aplicación mantiene Context API para el estado de dominio. No se agrega Redux, Zustand ni otra capa global porque no aporta una ventaja proporcional al tamaño del proyecto.

## Estructura relevante

```text
src/
├─ components/
│  ├─ AppErrorBoundary.tsx
│  ├─ TaskItem.tsx
│  ├─ TodoForm.tsx
│  ├─ TodoList.tsx
│  ├─ DeleteButton.tsx
│  └─ EmailButton.tsx
├─ features/
│  ├─ auth/AuthContext.tsx
│  └─ tasks/TasksContext.tsx
├─ pages/
│  ├─ LoginPage.tsx
│  ├─ RegisterPage.tsx
│  └─ TasksPage.tsx
├─ services/
│  ├─ auth.ts
│  ├─ firebase.ts
│  └─ tasks.ts
├─ types/index.ts
└─ utils/
   ├─ dates.ts
   └─ validators.ts

api/
└─ send-summary.ts

firestore.rules
```

## Autenticación

Firebase Auth gestiona registro, login, Google Login, persistencia de sesión y logout. `TasksContext` elimina las tareas locales al perderse la identidad autenticada para evitar reutilizar datos de otra sesión.

## CRUD

**CREATE:** el usuario completa el formulario y crea una tarea pendiente.

**READ:** `TasksContext` consulta sólo las tareas del usuario autenticado.

**UPDATE:** cada `TaskItem` tiene el botón **Editar**. La tarea seleccionada llega a `TasksPage`, `TodoForm` entra en modo edición y `updateTask()` modifica el documento existente sin duplicarlo.

**DELETE:** el usuario confirma la eliminación y el documento se elimina sólo si pertenece al usuario autenticado.

**REORDER:** el drag & drop reordena la colección y persiste `sortOrder` en Firestore con rollback local si la escritura falla.

## Seguridad

La seguridad se implementa en varias capas:

1. Firebase Auth identifica al usuario.
2. El endpoint `/api/send-summary` exige `Authorization: Bearer <Firebase ID Token>`.
3. El backend verifica el token con Firebase Admin y usa únicamente `decodedToken.uid` como identidad autorizada.
4. `body.userId` y `body.email` no son fuentes de identidad para el endpoint.
5. Firestore Rules validan el propietario actual y evitan cambiar `userId` durante un update.
6. `sortOrder` también queda limitado a documentos del propietario mediante las mismas reglas.
7. La API escapa datos dinámicos antes de insertarlos en HTML de email.
8. Las credenciales de AWS/Firebase Admin permanecen en variables de entorno del servidor.
9. El rate limiting local se considera una defensa adicional, no un mecanismo distribuido absoluto.

### Reglas de Firestore

Las reglas protegen `read`, `create`, `update` y `delete`. Un update permitido debe conservar `request.auth.uid` como propietario y sólo puede modificar campos de tarea autorizados, incluido `sortOrder`.

## Email

El navegador obtiene un Firebase ID Token y lo envía en el header `Authorization`. El servidor deriva el destinatario desde el email verificado del token.

El HTML del email utiliza escaping para datos controlados por el usuario. Si el usuario no tiene un email válido, la operación se rechaza de forma controlada.

La región AWS por defecto es `sa-east-1`. Una variable `AWS_REGION` válida en Vercel tiene prioridad.

## Validaciones

El formulario valida y recorta espacios en título y descripción. También limita longitudes razonables y controla las prioridades permitidas. La validación de cliente mejora la UX; las Firestore Rules funcionan como barrera de seguridad adicional.

Las fechas de `type=date` se convierten sin usar `toISOString()` para evitar el desplazamiento típico entre fecha de calendario y zona horaria.

## Accesibilidad y responsive

Las acciones principales usan `<button>`, labels asociados, estados `aria-pressed`/`aria-busy` cuando corresponde, nombres accesibles y focus visible. **Editar** no depende de hover y funciona con mouse, touch y teclado.

La interfaz mantiene un diseño responsive con Tailwind CSS y controles utilizables en pantallas pequeñas.

## Testing

El repositorio contiene **20 archivos de prueba** después de la remediación. La suite cubre autenticación, contexto de tareas, formularios, componentes, páginas, servicios, validadores, fechas y seguridad de la API.

Los escenarios críticos incluyen:

- CREATE / READ / UPDATE / DELETE.
- Editar una tarea y guardar cambios.
- Editar → cancelar → volver a crear.
- Selección de tarea A → cancelación → selección de tarea B sin datos obsoletos.
- Toggle optimista con rollback ante error.
- Logout → login de otro usuario sin reutilizar tareas anteriores.
- API sin token → `401`.
- API con token inválido/expirado → `401`.
- UID verificado utilizado para Firestore.
- `body.userId` ignorado para autorización.
- Email dirigido al correo derivado de la identidad verificada.
- Escaping HTML contra `<script>`, atributos y caracteres especiales.
- JSON inválido, método no permitido, CORS no permitido, error de Firestore y rate limit.

Los tests se centran en comportamiento y no utilizan snapshots como única validación.

## Ejecución local

```bash
git clone https://github.com/rechimonth/matecode.git
cd matecode
npm install
cp .env.example .env
npm run dev
```

No completes credenciales reales en archivos versionados. `.env`, `.env.local` y secretos de producción deben permanecer fuera del repositorio.

## Variables de entorno

### Frontend

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Serverless / Vercel

```env
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=
SES_CONFIGURATION_SET=
ALLOWED_ORIGINS=https://matecode-lyart.vercel.app
FIREBASE_SERVICE_ACCOUNT_KEY=
```

`FIREBASE_SERVICE_ACCOUNT_KEY` contiene el JSON de la service account sólo en el entorno seguro de Vercel. Nunca debe subirse al repositorio.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | ESLint sin warnings permitidos |
| `npm run test` | Suite Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run typecheck` | Verificación TypeScript |
| `npm run build` | Typecheck + build de producción |
| `npm run preview` | Previsualización de producción |

## Despliegue

El frontend y la función `api/send-summary.ts` están preparados para Vercel. Firebase Auth y Firestore se configuran en el proyecto Firebase; AWS SES se configura del lado servidor.

Antes de desplegar, comprobar:

```bash
npm ci
npm run lint
npm run test
npm run typecheck
npm run build
```

## Limitaciones conocidas

- No existe sincronización Firestore realtime por listener; la UI se refresca después de operaciones.
- El rate limit de la función usa memoria del proceso y no sustituye un rate limiter distribuido.
- Las pruebas automatizadas no sustituyen una prueba manual contra un proyecto Firebase/SES real.
- Las tareas creadas antes de la introducción de `sortOrder` conservan el orden por fecha hasta que sean reordenadas.

## Decisiones técnicas

Se priorizaron cambios pequeños y defendibles para un proyecto académico: React Context en lugar de una librería de estado adicional, validación en frontend más reglas de Firestore, autenticación Firebase Admin en el endpoint y tests de comportamiento para requisitos críticos.

## Roadmap

Las siguientes mejoras son futuras y no deben considerarse funcionalidades actuales: sincronización `onSnapshot`, rate limiting distribuido y una suite de integración con servicios cloud reales.

## Licencia y autor

Revisar la información legal/licencia del repositorio antes de publicar una copia redistribuible.
