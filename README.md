# Nebulab-Frontend

Tienda en línea modular de productos Apple. Frontend de **Nebulab**, construido en Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4, con animaciones GSAP/Lenis y efectos WebGL (shaders). Consume la API REST del backend ([NebuBack](https://github.com/), Django + DRF) para catálogo, carrito, checkout, cuenta de usuario y panel de administración.

Desplegado en Vercel: https://nebulab-frontend.vercel.app/
Dominio: https://nebulab.digital

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos**: Tailwind CSS 4, variables CSS para tema oscuro, 4 breakpoints (móvil 320px, tablet 768px, notebook 1140px, desktop 1440px)
- **Animación**: GSAP + Lenis (scroll suave), WebGL/shaders para efectos visuales
- **Tipografías**: SF Pro Display y Neue Montreal (cargadas localmente en `app/fonts/`)
- **Gestor de paquetes**: pnpm
- **Lint**: ESLint

## Estructura

```
app/
  home/              # Inicio (/) — portada, shaders, categorías, destacados
  products/[slug]/   # Catálogo y detalle de producto
  bag/               # Bolsa y checkout (envío + pago simulado)
  account/           # Cuenta de usuario
  login/, login-admin/   # Autenticación (clientes y admins)
  reset-password/    # Recuperación de contraseña
  admin/             # Panel de administración
    products/ customers/ orders/ admins/ categories/
  components/        # Componentes de UI (incluye components/admin, components/login)
  lib/                # Cliente HTTP, auth, recursos de la API
    api.ts            # Cliente HTTP base (NEXT_PUBLIC_API_URL + tokens JWT)
    auth.ts            # Manejo de sesión/tokens
    cart.ts             # Carrito (API)
    categories.ts        # Categorías (API)
    cms/                 # products, customers, orders, admin-auth, metrics (API)
    resource.ts, server-api.ts, session-routes.ts
  data/               # Tipos y datos estáticos restantes
  fonts/              # Fuentes locales
```

## Backend

El frontend es un proyecto independiente que se comunica solo por API REST en JSON con el backend (Django + DRF + PostgreSQL/Neon). Todos los módulos de datos (`app/lib/cart.ts`, `app/lib/cms/*`, login) ya consumen la API real — no hay datos simulados.

Variable de entorno requerida (`.env.local`):

```
NEXT_PUBLIC_API_URL=https://api.nebulab.digital/api
```

## Desarrollo

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
pnpm start
pnpm lint
```

Requiere el backend corriendo (local o remoto) y accesible en `NEXT_PUBLIC_API_URL`. Si Vercel conserva temporalmente `https://nebuback.onrender.com/api`, el código usa `https://api.nebulab.digital/api` para que la autenticación por cookies funcione; actualiza también la variable en Vercel cuando tengas acceso al proyecto.
Para probar la autenticación antes del despliegue, ejecuta la rama `feature/refresh-en-cookie` del backend y usa `NEXT_PUBLIC_API_URL=http://localhost:8000/api` con el frontend en `http://localhost:3000`. El backend debe permitir ese origen y configurar la cookie para el entorno local. El acceso y el usuario se mantienen solo en memoria; la cookie de renovación es `HttpOnly`. El despliegue del frontend y del backend debe coordinarse porque sus contratos de login son incompatibles con las versiones anteriores.
El optimizador de imágenes solo acepta el host HTTPS de la API. Si las fotos del catálogo se alojan en un CDN, configura `NEXT_PUBLIC_IMAGE_HOSTS` con sus nombres de host HTTPS separados por comas antes del despliegue (por ejemplo, `NEXT_PUBLIC_IMAGE_HOSTS=cdn.ejemplo.com`).

## Pendiente

- Cobertura completa de estados de carga/error
- Pruebas de extremo a extremo
