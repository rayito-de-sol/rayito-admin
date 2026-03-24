# Rayito Admin

Panel de administración web para el sistema de gestión de fábrica Rayito.

## Descripción

Aplicación frontend desarrollada con React, TypeScript y Vite. Proporciona una interfaz de usuario para gestionar las operaciones de la fábrica, incluyendo autenticación de usuarios y navegación protegida.

## Tecnologías

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Requisitos Previos

- Node.js 18+
- pnpm 8+
- Cuenta de Supabase configurada
- Backend API de Rayito en ejecución

## Configuración Inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y configura las siguientes variables:

```env
# URL del backend API (desarrollo: http://localhost:8080/api/v1)
VITE_API_URL=http://localhost:8080/api/v1

# Configuración de Supabase (obtén estos valores de tu proyecto en Supabase)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu-clave-publica-aqui
```

### 3. Iniciar servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en http://localhost:5173

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo con hot-reload |
| `pnpm build` | Compila la aplicación para producción |
| `pnpm preview` | Previsualiza la build de producción localmente |
| `pnpm lint` | Ejecuta ESLint para encontrar problemas en el código |
| `pnpm format` | Formatea el código con Prettier |

## Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables (Layout, Header, Navigation, etc.)
│   └── ui/         # Componentes de shadcn/ui
├── hooks/          # Custom React hooks (useAuth)
├── lib/            # Utilidades de librerías (cn utility)
├── pages/          # Componentes de página (LoginPage, DashboardPage)
├── services/       # Servicios externos (API client, Supabase)
│   └── api/        # Cliente HTTP y endpoints
├── stores/         # Zustand stores (auth, UI)
├── types/          # Definiciones de tipos TypeScript
├── utils/          # Funciones utilitarias
├── App.tsx         # Componente raíz con routing
├── main.tsx        # Punto de entrada
└── config.ts       # Configuración y validación de env vars
```

## Autenticación

La aplicación usa Supabase para la autenticación:

1. Los usuarios inician sesión con email y contraseña
2. Solo usuarios en la lista blanca del backend pueden acceder
3. Las rutas protegidas requieren autenticación activa
4. Los tokens JWT se refrescan automáticamente

## Rutas

| Ruta | Protegida | Descripción |
|------|-----------|-------------|
| `/` | No | Redirige a `/dashboard` o `/login` según estado de auth |
| `/login` | No | Página de inicio de sesión |
| `/dashboard` | Sí | Panel principal (requiere autenticación) |
| `*` | No | Página 404 |

## Convenciones de Código

- **TypeScript**: Modo estricto habilitado
- **Imports**: Usar alias `@/*` para imports desde `src/`
- **Componentes**: PascalCase para nombres de archivos y componentes
- **Hooks**: Prefijo `use` para custom hooks
- **Stores**: Prefijo `use` y sufijo `Store` (e.g., `useAuthStore`)
- **Estilos**: Tailwind utility classes + shadcn components

## Variables de Entorno

Todas las variables de entorno deben tener el prefijo `VITE_` para ser accesibles en el cliente.

Ver `.env.example` para la lista completa de variables requeridas.

## Despliegue

### Build de Producción

```bash
pnpm build
```

Los archivos compilados se generan en el directorio `dist/`.

### Plataformas Recomendadas

- **Netlify**: Configuración automática con git
- **Vercel**: Detección automática de Vite
- **Render**: Soporte para sitios estáticos

**Configuración de Build:**
- Build command: `pnpm build`
- Output directory: `dist`
- Node version: 18+

Recuerda configurar las variables de entorno en el panel de tu plataforma de hosting.

## Licencia

Privado - Uso interno únicamente

---

Desarrollado con ❤️ para Rayito
