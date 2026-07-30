# MateCode

**URL de producción**: https://matecode-lyart.vercel.app

**MateCode** es una aplicación web SPA de gestión de tareas diseñada para pequeñas empresas y equipos que necesitan organizar el trabajo diario de forma colaborativa, persistente y accesible desde cualquier dispositivo.

El proyecto implementa un flujo completo de autenticación, CRUD de tareas con sincronización en tiempo real, notificaciones por email y despliegue en producción, aplicando buenas prácticas de arquitectura, tipado fuerte con TypeScript, testing automatizado y control de versiones profesional.

---

## 🎯 Problema que resuelve

Muchas pequeñas empresas y equipos remotos dependen de herramientas de gestión de tareas genéricas, costosas o excesivamente complejas. MateCode ofrece una alternativa ligera, autocontenida y económica basada en servicios administrados (BaaS), sin necesidad de infraestructura propia.

Los usuarios pueden registrarse, autenticarse, crear y gestionar sus tareas personales o de equipo, y recibir resúmenes por email — todo desde una interfaz moderna, responsive y accesible.

---

## 👥 Usuarios objetivo

- **Empleados de pequeñas empresas** que necesitan gestionar tareas diarias.
- **Freelancers y equipos remotos** que requieren una herramienta simple sin curva de aprendizaje.
- **Estudiantes y proyectos académicos** que necesitan un ejemplo real de SPA full stack.

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2.7 | Biblioteca UI para la SPA |
| TypeScript | ~6.0.2 | Tipado estático y seguridad de tipos |
| Vite | ^8.1.5 | Bundler y servidor de desarrollo |
| Tailwind CSS | ^3.4.0 | Estilos utility-first y diseño responsive |
| Firebase Auth | ^10.14.1 | Autenticación (email/password y Google) |
| Cloud Firestore | ^10.14.1 | Base de datos NoSQL en tiempo real |
| AWS SDK (SES) | ^3.600.0 | Envío de emails transaccionales |
| React Router | ^7.18.1 | Enrutamiento SPA |
| @dnd-kit/core / @dnd-kit/sortable | ^6.3.1 / ^10.0.0 | Drag & drop para reordenar tareas |
| lucide-react | ^1.27.0 | Iconografía SVG |
| Vitest | ^1.6.0 | Framework de testing |
| React Testing Library | ^16.0.0 | Tests de componentes |
| Vercel | — | Hosting y serverless functions |

---

## 📁 Estructura del proyecto

```
matecode/
├─ index.html                    # Punto de entrada HTML (Vite)
├─ src/
│  ├─ assets/                    # Imágenes y assets públicos
│  │
│  ├─ pages/                     # Vistas SPA
│  │  ├─ LoginPage.tsx           # Formulario de inicio de sesión
│  │  ├─ RegisterPage.tsx        # Formulario de registro
│  │  ├─ TasksPage.tsx           # Panel principal de tareas
│  │  └─ NotFoundPage.tsx        # Página 404 personalizada
│  │
│  ├─ components/                # Componentes UI reutilizables
│  │  ├─ Header.tsx              # Cabecera con info de usuario y logout
│  │  ├─ TodoForm.tsx            # Formulario crear/editar tarea
│  │  ├─ TodoList.tsx            # Lista de tareas con drag & drop
│  │  ├─ TaskItem.tsx            # Item individual de tarea
│  │  ├─ TaskFilters.tsx         # Filtros: Todas / Pendientes / Completadas
│  │  ├─ TaskSummary.tsx         # Resumen de contadores de tareas
│  │  ├─ EmailButton.tsx         # Botón envío resumen por email
│  │  ├─ DeleteButton.tsx        # Modal confirmación eliminar tarea
│  │  ├─ LinkPasswordForm.tsx    # Formulario vinculación password a Google
│  │  └─ ui/
│  │     └─ Toast.tsx            # Sistema de notificaciones toast
│  │
│  ├─ features/                  # Lógica de dominio por contexto
│  │  ├─ auth/
│  │  │  └─ AuthContext.tsx      # Contexto de autenticación
│  │  └─ tasks/
│  │     └─ TasksContext.tsx     # Contexto de gestión de tareas
│  │
│  ├─ services/                  # Integraciones externas
│  │  ├─ firebase.ts             # Inicialización Firebase Auth + Firestore
│  │  ├─ auth.ts                 # Servicios: login, register, google, logout
│  │  └─ tasks.ts                # Servicios CRUD Firestore
│  │
│  ├─ hooks/                     # Hooks personalizados
│  │  ├─ useForm.ts              # Hook genérico para formularios
│  │  └─ useTaskStats.ts         # Estadísticas de tareas (total, pendientes, completadas)
│  │
│  ├─ routes/
│  │  ├─ ProtectedRoute.tsx      # Guard de rutas privadas
│  │  └─ PublicRoute.tsx         # Guard de rutas públicas (redirige si hay sesión)
│  │
│  ├─ types/
│  │  ├─ index.ts                # Tipos: Task, User, AuthContextType, TasksContextType
│  │  └─ firebase.d.ts           # Declaraciones TypeScript para Firebase
│  │
│  ├─ utils/
│  │  └─ validators.ts           # Validadores: email, password, fechas, truncate
│  │
│  ├─ App.css                    # Estilos del componente raíz
│  ├─ index.css                  # Estilos globales, utilidades Tailwind, shimmer/skeleton
│  ├─ App.tsx                    # Enrutamiento principal y providers
│  └─ main.tsx                   # Punto de entrada
│
├─ api/
│  └─ send-summary.ts            # Vercel Serverless Function: AWS SES email
│
├─ tests/
│  ├─ setup.ts                   # Configuración global de tests
│  ├─ mocks/
│  │  └─ firebase.ts             # Mocks de Firebase Auth
│  ├─ validators.test.ts         # Tests unitarios de validadores
│  ├─ services/
│  │  ├─ auth.test.ts            # Tests servicios de autenticación
│  │  └─ tasks.test.ts           # Tests servicios de tareas
│  ├─ components/
│  │  ├─ Header.test.tsx
│  │  ├─ TaskFilters.test.tsx
│  │  ├─ TaskSummary.test.tsx
│  │  ├─ TodoForm.test.tsx
│  │  ├─ DeleteButton.test.tsx
│  │  └─ EmailButton.test.tsx
│  ├─ pages/
│  │  ├─ LoginPage.test.tsx
│  │  └─ RegisterPage.test.tsx
│  ├─ AuthContext.test.tsx
│  ├─ TasksContext.test.tsx
│  ├─ ProtectedRoute.test.tsx
│  └─ dummy.test.ts
│
├─ .env.example                  # Variables de entorno (plantilla)
├─ .env.local                    # Variables locales (NO se sube)
├─ .gitignore                    # Exclusiones: .env, node_modules, dist, etc.
├─ tailwind.config.js            # Configuración de Tailwind CSS
├─ postcss.config.js             # Configuración de Postcss
├─ vercel.json                   # Configuración de deploy y rewrites
├─ firestore.rules               # Reglas de seguridad Firestore
├─ package.json                  # Dependencias y scripts
├─ tsconfig.json                 # Configuración TypeScript (project references)
├─ vite.config.ts                # Configuración Vite + Vitest
├─ eslint.config.js              # Reglas ESLint
└─ README.md                     # Documentación del proyecto
```

---

## ✨ Características principales

### Autenticación
- Registro con **email y contraseña**.
- Inicio de sesión con **Google** (OAuth).
- Sesión persistente mediante `onAuthStateChanged`.
- Logout con feedback visual.
- Protección de rutas privadas (`ProtectedRoute`).
- Manejo de errores con mensajes comprensibles para el usuario.

### Gestión de tareas
- **Crear** tarea con título, descripción, fecha de vencimiento y prioridad.
- **Listar** tareas del usuario autenticado.
- **Editar** tarea existente.
- **Eliminar** tarea con modal de confirmación y focus trap.
- **Marcar como completada** con optimistic update.
- **Filtros** por estado: Todas, Pendientes, Completadas.
- **Drag & drop** para reordenar tareas (`dnd-kit`). Nota: la reordenación visual se aplica en la interfaz, pero el orden no se persiste en Firestore; al recargar, las tareas vuelven a ordenarse por fecha de creación.
- Sincronización automática de la UI tras operaciones CRUD.

### Persistencia
- Almacenamiento en **Cloud Firestore**.
- Aislamiento por `userId`: cada usuario solo accede a sus propias tareas.
- Reglas de seguridad configurables en `firestore.rules`.
- Manejo de estados de carga y error.

### Notificaciones por email
- Botón **"Enviar resumen por email"** con resumen de tareas.
- Envío mediante **AWS SES** desde Vercel Serverless Function.
- HTML responsive en el email con estadísticas y listado detallado.
- Rate limiting por IP y validación de origen (CORS) en la función.

### Seguridad
- Variables de entorno para Firebase y AWS (`.env` excluido del repositorio).
- Credenciales de AWS solo en el servidor (serverless function).
- Protección de rutas en el frontend.
- Reglas de Firestore por usuario.
- Sanitización de inputs y validaciones en formularios.

### Responsive
- Diseño **mobile-first** con Tailwind CSS.
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).
- Navegación touch-friendly y adaptativa.
- Contenedores con `max-w-4xl` centrados.

### UX / Accesibilidad
- Iconografía con `lucide-react` para escaneo visual rápido.
- Estados de carga con spinners y skeletons.
- Feedback mediante sistema de **toasts** (success, error, warning, info).
- Microinteracciones: `hover:scale-105`, `active:scale-95`, transiciones suaves.
- Modales con **focus trap**, cierre con `Escape` y click en backdrop.
- ARIA labels, `role="dialog"`, `aria-modal`, `aria-live`.
- Loading states en todos los botones de acción.

### Testing
- **~65 casos de prueba** con Vitest y React Testing Library.
- Cobertura de servicios, contextos, componentes y páginas.
- Mocks de Firebase Auth y Firestore.
- Tests de casos de error y bordes.

---

## 🚀 Flujo de funcionamiento

### 1. Registro / Login
1. El usuario accede a `/register` o `/login`.
2. Completa credenciales o inicia sesión con Google.
3. Firebase Auth valida y crea la sesión.
4. `onAuthStateChanged` actualiza el `AuthContext`.
5. El usuario es redirigido a `/tasks`.

### 2. Acceso al panel
1. `ProtectedRoute` verifica el estado de autenticación.
2. Si no hay sesión, redirige a `/login` preservando la ubicación.
3. Si hay sesión, renderiza `TasksPage`.

### 3. Gestión de tareas
1. `TasksContext` carga las tareas del usuario desde Firestore.
2. El usuario puede crear, editar, eliminar y marcar tareas.
3. Cada operación actualiza Firestore y refresca el estado local.
4. `TodoList` aplica filtros y permite drag & drop.

### 4. Envío de email
1. El usuario presiona "Enviar resumen por email".
2. El frontend envía un `POST` a `/api/send-summary` con el email del usuario autenticado.
3. La Vercel Function recibe el payload, aplica rate limiting y valida el origen.
4. AWS SDK (SES) envía el email HTML con el resumen de tareas al destinatario.

### 5. Logout
1. El usuario presiona "Cerrar Sesión".
2. Firebase Auth cierra la sesión.
3. `AuthContext` limpia el estado.
4. El usuario es redirigido a `/login`.

---

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/rechimonth/matecode.git
cd matecode

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Completar .env con tus credenciales de Firebase y Vercel

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 🔐 Variables de entorno

### Frontend (`.env`)
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
```

### Serverless / Producción (Vercel)
```env
# AWS SES
AWS_REGION=southamerica-east1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=
SES_CONFIGURATION_SET=

# Seguridad
ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-app.vercel.app
```

> **Importante**: El archivo `.env` nunca debe subirse al repositorio. Utilizá `.env.example` como plantilla. Las variables de Vercel se configuran en el dashboard de despliegue.

---

## 📜 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm run build` | Genera la build de producción (`tsc -b && vite build`) |
| `npm run preview` | Previsualiza la build de producción |
| `npm run lint` | Ejecuta ESLint con reglas estrictas |
| `npm run test` | Ejecuta todos los tests con Vitest |
| `npm run test:watch` | Ejecuta los tests en modo watch |

---

## 🏗️ Decisiones arquitectónicas

### React + TypeScript
Se eligió React por su ecosistema maduro, componentización y soporte de TypeScript. El tipado fuerte reduce errores en tiempo de desarrollo y mejora la mantenibilidad. Las interfaces (`Task`, `User`, `AuthContextType`, `TasksContextType`) centralizan los contratos de datos.

### Firebase (Auth + Firestore)
Firebase proporciona autenticación y base de datos en tiempo real sin necesidad de backend propio. `onAuthStateChanged` maneja la sesión persistente, mientras que el contexto recarga las tareas tras cada mutación para mantener la UI actualizada. Las reglas de Firestore garantizan el aislamiento por usuario.

### Context API
Se utilizaron dos contextos principales:
- `AuthContext`: centraliza el estado de autenticación y expone métodos `login`, `register`, `loginWithGoogle`, `logout`.
- `TasksContext`: centraliza el estado de tareas, filtros y operaciones CRUD.

Esto evita prop drilling y permite que cualquier componente acceda al estado global sin acoplamiento innecesario.

### Serverless Function para emails
AWS SES no puede invocarse directamente desde el frontend sin exponer credenciales. Por ello se implementó una Vercel Function en `api/send-summary.ts` que actúa como intermediario. La función:
- Recibe el payload desde el frontend.
- Valida origen y aplica rate limiting.
- Invoca AWS SES con credenciales almacenadas en variables de entorno del servidor.

### Tailwind CSS
Se adoptó Tailwind para acelerar el desarrollo de interfaces consistentes y responsive. Las clases utilitarias se complementan con componentes base (`.btn`, `.card`, `.input`) definidos en `src/index.css`.

### dnd-kit
Para el requisito extra de drag & drop se integró `dnd-kit` (paquetes `@dnd-kit/core` y `@dnd-kit/sortable`), una biblioteca accesible y ligera que permite reordenar tareas mediante arrastre, con soporte de teclado.

### Lazy Loading
Las páginas se cargan de forma diferida con `React.lazy` y `Suspense`, reduciendo el bundle inicial y mejorando el tiempo de carga percibido.

---

## 🔒 Seguridad

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

Cada operación valida que el `userId` del documento coincida con el `uid` del usuario autenticado.

### Variables de entorno
- Firebase: configurado en `src/services/firebase.ts` mediante `import.meta.env`.
- AWS: variables exclusivas del servidor (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM_EMAIL`).

### Protección de rutas
`ProtectedRoute` verifica el estado de autenticación antes de renderizar contenido privado, evitando acceso no autorizado incluso si el usuario navega directamente a una URL protegida.

### Serverless
La función `/api/send-summary` incluye:
- Rate limiting por IP (10 solicitudes por hora).
- Validación de origen (`ALLOWED_ORIGINS`).
- Respuestas con códigos HTTP apropiados (400, 403, 429, 500).

---

## 🧪 Testing

### Stack
- **Vitest**: framework de tests rápido y compatible con Vite.
- **React Testing Library**: tests centrados en el comportamiento del usuario.
- **@testing-library/user-event**: simulación de interacciones reales.

### Cobertura
- **Servicios**: `auth.test.ts`, `tasks.test.ts` — verifican llamadas a Firebase.
- **Contextos**: `AuthContext.test.tsx`, `TasksContext.test.tsx` — verifican estado y métodos.
- **Componentes**: `Header`, `TaskFilters`, `TodoForm`, `DeleteButton`, `EmailButton`.
- **Páginas**: `LoginPage`, `RegisterPage`.
- **Rutas**: `ProtectedRoute`.
- **Utilidades**: `validators.test.ts`.

### Mocks
Firebase Auth y Firestore se mockean completamente para evitar llamadas reales en tests. Los mocks se definen en `tests/mocks/` y mediante `vi.mock` en cada suite.

### Ejecución
```bash
npm run test        # Ejecutar todos los tests
npm run test:watch  # Modo watch para desarrollo
```

---

## 🌐 Deploy

La aplicación está diseñada para desplegarse en **Vercel**:

1. Subir el código a GitHub/GitLab.
2. Importar el repositorio en Vercel.
3. Configurar variables de entorno en el dashboard de Vercel:
   - Variables de Firebase con prefijo `VITE_`.
   - Variables de AWS y `ALLOWED_ORIGINS` sin prefijo (serverless).
4. Vercel detecta automáticamente el framework (Vite) y ejecuta `npm run build`.
5. El archivo `vercel.json` configura:
   - Rewrite `/api/(.*)` hacia la serverless function.
   - Rewrite `/(.*)` hacia `index.html` para soporte SPA.

> **URL de producción**: https://matecode-lyart.vercel.app

---

## 📱 Responsive

El diseño sigue una aproximación **mobile-first**:

- **Mobile (< 640px)**: Layout vertical, botones apilados, tipografía compacta.
- **Tablet (640px - 1024px)**: Transición a layouts horizontales en formularios y cabecera.
- **Desktop (> 1024px)**: Contenedor `max-w-4xl` centrado, espacio generoso, navegación en fila.

Breakpoints utilizados en Tailwind:
- `sm:` — 640px
- `md:` — 768px
- `lg:` — 1024px
- `xl:` — 1280px

---

## ♿ Accesibilidad

- **ARIA labels** en botones de acción y modales.
- **role="dialog"** y **aria-modal** en ventanas de confirmación.
- **Focus trap** en `DeleteButton` y `TodoForm` para ciclo de tabulación seguro.
- **Cierre con Escape** en modales.
- **aria-live="polite"** en elementos dinámicos (títulos de tarea).
- **Estados de foco visibles** (`focus:ring-2`, `focus:ring-offset-2`).
- **Contraste de color** cumpliendo WCAG AA en textos principales.

---

## ⚡ Rendimiento

- **Lazy Loading**: páginas cargadas bajo demanda con `React.lazy`.
- **Code Splitting**: Vite genera chunks separados para vendor, librerías y páginas.
- **Memoización**: `useCallback` en handlers y contextos para evitar re-renders innecesarios.
- **Bundle optimizado**: manualChunks en `vite.config.ts` para separar React, Firebase y AWS SDK.
- **Animaciones** basadas en `transform` y `opacity` para evitar repaints costosos.

---

## 📘 Manual de usuario

### 1. Acceso
- Entrá a la URL de producción: https://matecode-lyart.vercel.app
- Si no tenés cuenta, hacé clic en **Registrate** y creá una cuenta con email y contraseña, o usá **Google**.
- Si ya tenés cuenta, ingresá con **email/contraseña** o con **Google**.

### 2. Panel de tareas
- En el panel vas a ver el resumen de tareas y los filtros **Todas / Pendientes / Completadas**.
- Para crear una tarea, completá **título**, **descripción**, opcionalmente la **fecha de vencimiento** y la **prioridad**, y luego hacé clic en **Crear tarea**.
- Para editar una tarea, usá el ícono de lápiz. Los cambios se guardan con **Guardar cambios**.
- Para marcarla como completada, hacé clic en el botón amarillo **Marcar completada**. Para desmarcarla, hacé doble clic en el botón verde **Completada**.
- Para eliminarla, hacé clic en **Eliminar**, confirmá en el modal y listo.

### 3. Resumen por email
- Hacé clic en **Enviar resumen por email**.
- La app consulta Firestore y te envía un resumen con el estado actual de tus tareas.

### 4. Cerrar sesión
- Hacé clic en **Cerrar Sesión** en la cabecera.

---

## 🤖 Uso de IA en el desarrollo

Durante el desarrollo de MateCode se utilizó inteligencia artificial como apoyo técnico, no como reemplazo de la toma de decisiones.

### Herramientas utilizadas
- **Kilo (AI Coding Assistant)** para generación de código, refactorización, revisión de arquitectura y documentación.

### Situaciones donde la IA fue más efectiva
- **Generación de componentes UI repetitivos**: formularios, botones, modales y layouts consistentes.
- **Configuración inicial del proyecto**: scaffolding de Vite + TypeScript + Tailwind, configuración de Vitest y ESLint.
- **Tests con mocks**: generación de estructuras de mocks para Firebase y patrones de testing con React Testing Library.
- **Refactorización y mejoras UX/UI**: auditoría visual, implementación de microinteracciones, skeleton loading y sistema de toasts.
- **Documentación**: redacción del README y explicación de flujos arquitectónicos.

### Decisiones tomadas por el desarrollador
- Selección del stack tecnológico (React, Firebase, AWS SES, Vercel).
- Diseño de la arquitectura por capas (`features`, `services`, `components`).
- Implementación de `TasksContext` con optimistic updates y rollback.
- Definición de reglas de Firestore por usuario.
- Configuración de variables de entorno y seguridad.
- Selección de `dnd-kit` para drag & drop.

### Patrones y buenas prácticas descubiertos
- Separar la lógica de dominio en `features/` mejora la testabilidad y mantenibilidad.
- El uso de Context Providers con `useCallback` y `useMemo` previene re-renders innecesarios.
- Los alias de paths (`@/*`) en Vite aceleran las importaciones y hacen el código más limpio.
- La combinación de `useState` + `useEffect` con flags de cancelación (`cancelled`) evita memory leaks en suscripciones asíncronas.

### Validaciones manuales realizadas
- Verificación de que la app funciona en producción con variables de entorno reales.
- Pruebas manuales de flujos completos: registro, login, CRUD, envío de email, logout.
- Verificación de reglas de Firestore aislando datos por usuario.
- Revisión de código para asegurar que ninguna credencial esté hardcodeada.

---

## 🗺️ Futuras mejoras

| Feature | Descripción |
|---------|-------------|
| **Modo oscuro** | Tema oscuro con toggle y persistencia en localStorage. |
| **PWA** | Service Worker para instalación y offline básico. |
| **Etiquetas / Categorías** | Clasificación de tareas por etiquetas y filtrado avanzado. |
| **Recordatorios** | Notificaciones push o email antes de la fecha de vencimiento. |
| **Dashboard de estadísticas** | Gráficos de productividad con `useTaskStats` extendido. |
| **Colaboración** | Compartir tareas entre usuarios de la misma organización. |
| **Adjuntos** | Subida de archivos a Firebase Storage vinculados a tareas. |
| **Comentarios** | Sistema de comentarios por tarea para trabajo en equipo. |
| **Exportación** | Exportar tareas a CSV / PDF. |
| **Integración con calendario** | Sincronización con Google Calendar. |

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para proponer cambios:

1. Hacer fork del repositorio.
2. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`.
3. Commit con mensaje semántico: `git commit -m "feat: agregar filtro por prioridad"`.
4. Push a la rama: `git push origin feature/nueva-funcionalidad`.
5. Abrir un Pull Request en GitHub.

Por favor, asegurarse de que:
- Los tests pasan (`npm run test`).
- El linter no genera warnings (`npm run lint`).
- El README se actualiza si corresponde.

---

## 📄 Licencia

MIT — ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**MateCode** — Proyecto desarrollado como Proyecto Integrador.  
Repositorio: (https://github.com/rechimonth/matecode)

---

## 📸 Capturas

> Agregar capturas de pantalla en `docs/images/` y referenciarlas aquí.

| Sección | Imagen |
|---------|--------|
| Login | `docs/images/login.jpeg` |
| Dashboard | `docs/images/dashboard.jpeg` |
| Mobile | `docs/images/mobile.jpeg` |
| Email | `docs/images/email.jpeg` |

