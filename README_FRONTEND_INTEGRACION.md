# Nebulab: guía para conectar el frontend a la API

Hola Nicolás. El backend ya está **desplegado y funcionando**. Esta guía reúne todo lo que necesitas para dejar los datos simulados de `localStorage` y usar la API real.

| | |
|---|---|
| **API en producción** | `https://nebuback.onrender.com/api` |
| **Documentación (Swagger)** | https://nebuback.onrender.com/api/docs/ |
| **Esquema OpenAPI** | https://nebuback.onrender.com/api/schema/ (se importa en Postman: File → Import → Link) |
| **Repositorio del backend** | https://github.com/Tomaxus/NebuBack |
| **Base de datos** | PostgreSQL en Neon, con las 7 categorías y los 31 productos del catálogo |
| **Estado** | 31 endpoints del Anexo A del contrato, 54 pruebas automáticas, desplegado el 29/09/2026 |

Revisé tu frontend desplegado. Productos, pedidos, líneas, dirección, estados, categorías e impuesto ya usan **los mismos nombres de campo que la API**. El trabajo consiste en reemplazar los módulos de datos, no en rediseñar pantallas.

---

## 0. Empieza por la documentación

Antes de tocar código, abre **https://nebuback.onrender.com/api/docs/**. Ahí está cada endpoint con sus parámetros, el cuerpo que espera, la respuesta exitosa y la sección **Schemas** con la forma exacta de cada objeto. Los mensajes de error de cada caso están en la sección 5 de esta guía.

1. En **Catálogo**, prueba `GET /api/products/` con **Try it out → Execute**. Es público.
2. En **Autenticación**, usa `POST /api/auth/login/` con las credenciales de admin que te paso por privado y copia el valor de `access`.
3. Pulsa **Authorize** (arriba a la derecha), pega el token (sin escribir "Bearer") y prueba cualquier endpoint con candado. El token dura 30 minutos.
4. Para probar como cliente, crea una cuenta con `POST /api/auth/register/` y usa ese token.

Si algo de Swagger no coincide con esta guía, **manda Swagger**, porque se genera del código.

---

## 1. Configuración

### Variable de entorno

| Entorno | `NEXT_PUBLIC_API_URL` |
|---|---|
| Local, con el backend en tu equipo | `http://localhost:8000/api` |
| Local, contra el backend desplegado | `https://nebuback.onrender.com/api` |
| Producción (Vercel) | `https://nebuback.onrender.com/api` |

En Vercel: **Settings → Environment Variables → `NEXT_PUBLIC_API_URL`**, aplicada a *Production* y *Preview*, y luego redeploy.

### CORS (dominios permitidos)

El backend acepta peticiones de:
- `https://nebulab-frontend.vercel.app`
- `https://nebulab.digital` y `https://www.nebulab.digital`
- `http://localhost:3000` y `http://localhost:3001`

Las **previews de Vercel** (`nebulab-frontend-git-*.vercel.app`) no están en la lista y fallarán por CORS. Si las necesitas, avísame y las agrego.

### Arranque en frío

**Render gratis se duerme** después de 15 minutos sin uso. La primera petición puede tardar unos 50 segundos. Muestra un estado de carga y no des la API por caída al primer intento.

---

## 2. Reglas generales de la API

| Tema | Regla |
|---|---|
| Rutas | Todas terminan en `/`: `/products/`, no `/products` |
| JSON | Claves en camelCase (`isNew`, `cardLast4`), igual que los tipos actuales del front |
| Parámetros de URL | En snake_case (`page_size`, `is_new`, `low_stock`, `ordering=-created_at`) |
| IDs | **Enteros** en todo: producto, cliente, pedido, admin y línea de carrito |
| Dinero | Número en USD. Puede llegar como `1199.0`; en JavaScript es el mismo `1199` |
| Fechas | ISO 8601 en UTC: `"2026-09-25T22:41:00Z"` |
| Listas | `{ count, next, previous, results }` con `page` y `page_size` (máximo 100) |
| Actualizar | `PATCH` parcial. No se usa `PUT` |
| Borrar | `204` sin cuerpo |
| Mensajes | En inglés, pensados para mostrarse tal cual |

---

## 3. Los 31 endpoints

Todas las rutas van precedidas de `https://nebuback.onrender.com/api`. Acceso: **Público** (sin token), **Sesión** (cualquier usuario con sesión: cliente o admin) o **Admin** (solo rol admin; un cliente recibe `403`).

### Autenticación

| # | Método | Ruta | Acceso | Cuerpo | Respuesta |
|---|---|---|---|---|---|
| 1 | POST | `/auth/register/` | Público | `{ name, email, password }` | `201 { access, refresh, user }` |
| 2 | POST | `/auth/login/` | Público | `{ email, password }` | `200 { access, refresh, user }` · `401` |
| 3 | POST | `/auth/refresh/` | Público | `{ refresh }` | `200 { access, refresh }` · `401` |
| 4 | POST | `/auth/logout/` | Sesión | `{ refresh }` | `204` |
| 5 | GET | `/auth/me/` | Sesión | — | `200 { id, name, email, role }` |
| 6 | POST | `/auth/password-reset/` | Público | `{ email }` | `204` siempre |

### Catálogo

| # | Método | Ruta | Acceso | Parámetros | Respuesta |
|---|---|---|---|---|---|
| 7 | GET | `/categories/` | Público | — | Arreglo de `{ id, name, slug }` (sin paginar) |
| 8 | GET | `/products/` | Público | `category`, `is_new`, `recommended`, `search`, `ordering`, `page`, `page_size` | Paginado de Product, solo `live`, 9 por página |
| 9 | GET | `/products/{slug}/` | Público | — | Product · `404` si no existe o está desactivado |

### Carrito y checkout

| # | Método | Ruta | Acceso | Cuerpo | Respuesta |
|---|---|---|---|---|---|
| 10 | GET | `/cart/` | Sesión | — | Cart (lo crea vacío si no existe) |
| 11 | POST | `/cart/items/` | Sesión | `{ slug, options: [{ name, value }] }` | Cart completo |
| 12 | PATCH | `/cart/items/{id}/` | Sesión | `{ quantity }` (0 elimina) | Cart completo |
| 13 | DELETE | `/cart/items/{id}/` | Sesión | — | Cart completo (`200`) |
| 14 | POST | `/orders/` | Sesión | `{ shippingAddress, cardLast4 }` | `201` Order |

### Administración de productos

| # | Método | Ruta | Acceso | Parámetros / cuerpo | Respuesta |
|---|---|---|---|---|---|
| 15 | GET | `/admin/products/` | Admin | `search`, `status`, `category`, `low_stock`, `ordering`, `page`, `page_size` | Paginado de Product (todos los estados), 10 por página |
| 16 | POST | `/admin/products/` | Admin | Product sin `id` ni fechas | `201` Product |
| 17 | GET | `/admin/products/{id}/` | Admin | — | Product |
| 18 | PATCH | `/admin/products/{id}/` | Admin | Solo los campos que cambian | Product |
| 19 | DELETE | `/admin/products/{id}/` | Admin | — | `204` |

### Administración de clientes

| # | Método | Ruta | Acceso | Parámetros / cuerpo | Respuesta |
|---|---|---|---|---|---|
| 20 | GET | `/admin/customers/` | Admin | `search`, `status`, `ordering`, `page`, `page_size` | Paginado de Customer (con `ordersCount`, `totalSpent`, `lastOrderAt`) |
| 21 | POST | `/admin/customers/` | Admin | `{ name, email, notes }` | `201` Customer |
| 22 | GET | `/admin/customers/{id}/` | Admin | — | Customer |
| 23 | PATCH | `/admin/customers/{id}/` | Admin | `{ name, email, notes, status }` (parcial) | Customer |
| 24 | DELETE | `/admin/customers/{id}/` | Admin | — | `204` (sus pedidos se conservan) |

### Administración de pedidos

| # | Método | Ruta | Acceso | Parámetros / cuerpo | Respuesta |
|---|---|---|---|---|---|
| 25 | GET | `/admin/orders/` | Admin | `search`, `status`, `days`, `customer`, `ordering`, `page`, `page_size` | Paginado de Order + `summary` + `statusCounts` |
| 26 | GET | `/admin/orders/{id}/` | Admin | — | Order (con `units`) |
| 27 | PATCH | `/admin/orders/{id}/` | Admin | `{ status }` | Order (ajusta el stock) |

### Administradores y dashboard

| # | Método | Ruta | Acceso | Parámetros / cuerpo | Respuesta |
|---|---|---|---|---|---|
| 28 | GET | `/admin/admins/` | Admin | `ordering`, `page`, `page_size` | Paginado de Admin |
| 29 | POST | `/admin/admins/` | Admin | `{ name, email, password }` | `201` Admin |
| 30 | DELETE | `/admin/admins/{id}/` | Admin | — | `204` · `400` si es tu propia cuenta |
| 31 | GET | `/admin/dashboard/` | Admin | `days=7\|30\|90` (por defecto 30) | Dashboard |

El detalle de cada respuesta y de cada error está en Swagger y en la sección 5, archivo por archivo.

---

## 4. Cliente HTTP (archivo nuevo: `app/lib/api.ts`)

Hay un solo cliente que agrega el token, lo renueva cuando vence y redirige al login si la sesión se perdió. Hay dos sesiones independientes, como en el contrato:

- `nebulab-session`: la del cliente.
- `nebulab-admin-session`: la del admin, usada en las rutas `/admin/*`.

```ts
const API = process.env.NEXT_PUBLIC_API_URL!;

type Sesion = { access: string; refresh: string; user: { id: number; name: string; email: string; role: "cliente" | "admin" } };
type Tipo = "cliente" | "admin";
const CLAVE: Record<Tipo, string> = { cliente: "nebulab-session", admin: "nebulab-admin-session" };

export const leerSesion = (t: Tipo): Sesion | null => {
  try { return JSON.parse(localStorage.getItem(CLAVE[t]) ?? "null"); } catch { return null; }
};
export const guardarSesion = (t: Tipo, s: Sesion) => localStorage.setItem(CLAVE[t], JSON.stringify(s));
export const cerrarSesionLocal = (t: Tipo) => localStorage.removeItem(CLAVE[t]);

export class ApiError extends Error {
  constructor(public status: number, public data: any) { super(data?.detail ?? `HTTP ${status}`); }
}

const renovando: Partial<Record<Tipo, Promise<boolean>>> = {};

async function renovar(t: Tipo): Promise<boolean> {
  const sesion = leerSesion(t);
  if (!sesion) return false;
  renovando[t] ??= fetch(`${API}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: sesion.refresh }),
  })
    .then(async (r) => {
      if (!r.ok) return false;
      const { access, refresh } = await r.json();
      guardarSesion(t, { ...sesion, access, refresh });
      return true;
    })
    .finally(() => { delete renovando[t]; });
  return renovando[t]!;
}

export async function api<T = any>(ruta: string, opciones: RequestInit & { sesion?: Tipo } = {}, reintento = true): Promise<T> {
  const { sesion: tipo, ...init } = opciones;
  const token = tipo ? leerSesion(tipo)?.access : undefined;
  const r = await fetch(`${API}${ruta}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (r.status === 401 && tipo && reintento && (await renovar(tipo))) return api<T>(ruta, opciones, false);
  if (r.status === 401 && tipo) {
    cerrarSesionLocal(tipo);
    window.location.href = tipo === "admin" ? "/login-admin" : "/login";
  }
  if (r.status === 204) return undefined as T;
  const datos = await r.json().catch(() => null);
  if (!r.ok) throw new ApiError(r.status, datos);
  return datos as T;
}
```

Uso: `api("/cart/", { sesion: "cliente" })`, `api("/admin/products/", { sesion: "admin", method: "POST", body: JSON.stringify(datos) })`.

- **`401`**: la sesión venció. El cliente intenta renovar una vez y, si falla, manda al login.
- **`403`**: no cierres la sesión. Significa que el usuario no tiene permiso (por ejemplo, un cliente en una ruta de admin).

---

## 5. Qué cambiar, archivo por archivo

### `app/components/login/LoginScreen.tsx` (tienda)

| Acción | Llamada | Respuesta |
|---|---|---|
| Registro | `POST /auth/register/` `{ name, email, password }` | `201 { access, refresh, user }`. Guardar en `nebulab-session` y llevar a `/home` |
| Login | `POST /auth/login/` `{ email, password }` | `200 { access, refresh, user }`. Si falla: `401 { "detail": "Wrong email or password." }` |
| Olvidé contraseña | `POST /auth/password-reset/` `{ email }` | `204` siempre |

- Si el registro usa un email que un admin creó antes (cliente sin contraseña), la cuenta se reclama; no es un error.
- Errores del registro: `{ "email": ["An account with this email already exists."] }` y `{ "password": [...] }` con los validadores de Django (mínimo 8 caracteres, no demasiado común, etc.).

### `app/lib/cms/admin-auth.ts` (login del CMS en `/login-admin`)

- `signInAdmin`: llama a `POST /auth/login/`. **Si `user.role !== "admin"`, no guardes la sesión** y muestra `"Wrong email or password."`. Si es admin, guarda en `nebulab-admin-session`.
- `signOutAdmin`: `POST /auth/logout/` con `{ refresh }` (y el token del admin), luego borra la sesión local.
- `useAdminSession`: el nombre y el email salen de `user`, o de `GET /auth/me/`.
- **Borrar** el hash SHA-256 de contraseñas y la lista `nebulab-cms-admins`. Hoy cualquiera puede ver ese hash en el navegador; con la API la verificación ocurre en el servidor.
- `useAdmins`: `GET /admin/admins/?page_size=100`. Cada admin trae `{ id, name, email, createdAt, createdBy, createdByName }`.
- `createAdmin`: `POST /admin/admins/` `{ name, email, password }`. Errores: `"The admin needs a name."`, `"Another admin already uses this email."`, `"Use at least 8 characters."`. "Repetir contraseña" se sigue validando solo en el front.
- `deleteAdmin`: `DELETE /admin/admins/{id}/`. Errores: `400 { "detail": "You cannot delete your own account." }` y `400 { "detail": "There must be at least one admin." }`.

### `app/components/account/AccountGreeting.tsx`

- Nombre real: `leerSesion("cliente")?.user.name`, o `GET /auth/me/`. Quitar el `"Iván Mateo"` fijo.
- "Sign Out": `POST /auth/logout/` con `{ refresh }` y borrar `nebulab-session`.
- Hoy la "sesión" depende de la URL `/home`. Hay que protegerla con la sesión real: sin `nebulab-session`, mandar a `/login`.

### `app/lib/cms/products.ts`

| Función | Llamada |
|---|---|
| `useLiveProducts` (catálogo) | `GET /products/?page=1&page_size=9` + filtros |
| Carrusel del home (`Featured.tsx`) | `GET /products/?recommended=true&page_size=50` |
| Detalle (`ProductDetailLoader`) | `GET /products/{slug}/`. `404 { "detail": "Not found." }` si no existe o está desactivado |
| Categorías | `GET /categories/`, que devuelve un arreglo de `{ id, name, slug }` (opcional: hoy son constantes) |
| `useProducts` (admin) | `GET /admin/products/?page_size=100`, que incluye los desactivados |
| `saveProduct` nuevo | `POST /admin/products/`. Si `slug` va vacío, lo genera el backend |
| `saveProduct` existente, `setProductStatus` | `PATCH /admin/products/{id}/` con solo los campos que cambian |
| `deleteProducts` | `DELETE /admin/products/{id}/` por cada uno (no hay borrado masivo) |
| `adjustStock` | **Se elimina.** El stock lo maneja el servidor |

- Filtros del catálogo: `category=Iphone`, `is_new=true`, `recommended=true`, `search=macbook air` (sin tildes ni mayúsculas), `ordering=price|-price|name|-name|created_at|-created_at`, `page`, `page_size`.
- Filtros del admin: `search`, `status=live|disabled`, `category`, `low_stock=true`, `ordering=name|status|slug|category|price|stock|updated_at` (con `-` para invertir).
- Páginas: `Math.ceil(count / page_size)`. Una página que no existe devuelve `404 { "detail": "Invalid page." }`; en ese caso vuelve a la 1.
- Errores del formulario, por campo y con los mismos textos que ya usa el front: `"The product needs a name."`, `"Another product already uses this slug."`, `"Choose a valid category."`, `"Enter a price of 0 or more."`, `"Stock must be a whole number, 0 or more."`, `"Every attribute needs a name and at least one value."` y el de la URL de imagen. Nuevo: `"Use only lowercase letters, numbers and hyphens."` para un slug inválido.

### `app/lib/cart.ts` (requiere `nebulab-session`)

| Función | Llamada | Respuesta |
|---|---|---|
| `useCart` | `GET /cart/` | El carrito |
| `addToCart` | `POST /cart/items/` `{ slug, options: [{ name, value }] }` | El carrito completo |
| `changeQuantity` | `PATCH /cart/items/{id}/` `{ quantity }` | El carrito completo |
| Quitar línea | `DELETE /cart/items/{id}/` | El carrito completo (`200`, no `204`) |
| `clearCart` | **Se elimina.** El checkout vacía el carrito |

Forma del carrito:

```json
{
  "items": [{ "id": 15, "slug": "iphone-18-pro-max", "name": "iPhone 18 Pro Max", "price": 1199.0,
              "image": "/images/catalog/airpods-pro-2.png",
              "options": [{ "name": "Storage", "value": "256GB" }, { "name": "Color", "value": "Silver" }],
              "quantity": 1 }],
  "subtotal": 1199.0, "taxRate": 0.08, "tax": 95.92, "total": 1294.92
}
```

- **Cambios frente a hoy:**
  - `id` de la línea: ahora es un **entero**, no `slug|256GB|Silver`.
  - Cantidad: `changeQuantity` envía la **cantidad final** (`quantity ± 1`), no el delta. `0` borra la línea.
  - Totales: se muestran los que envía el backend. **Quitar `TAX_RATE`** del front.
  - Datos del producto: solo se envían `slug` y `options`. El nombre, el precio y la imagen los pone el servidor.
- **Errores:**
  - `{ "quantity": ["Only 3 left in stock."] }`
  - `{ "quantity": ["This product is sold out."] }`
  - `{ "slug": ["This product is not available."] }`
  - `{ "options": ["Choose a valid value for every attribute of this product."] }`

### `app/lib/cms/orders.ts` y `BagPayment.tsx`

**Checkout:** `POST /orders/` con el token del cliente y este cuerpo:

```json
{
  "shippingAddress": { "address": "Calle 10 #20-30", "city": "Bogota", "postalCode": "110111", "country": "Colombia" },
  "cardLast4": "4242"
}
```

- **No enviar** email, titular, número completo, fecha ni CVC. El email sale de la cuenta, así que el campo Email debe ir precargado con `user.email` y en solo lectura.
- Respuesta: `201` con el pedido completo. El toast usa `number`, por ejemplo `"Order NB-1004 placed"`. El carrito queda vacío en el servidor.
- Errores:
  - `400 { "detail": "Your bag is empty." }`
  - `403 { "detail": "This account can't place orders. Contact support." }`
  - `400 { "detail": "Some items are no longer available.", "items": ["15"] }`
  - `400 { "detail": "Some items don't have enough stock.", "items": ["15"] }`
  - Campos vacíos: `{ "shippingAddress": { "city": ["Enter your city."] } }`

**Admin (Sales):**

| Función | Llamada |
|---|---|
| `useOrders` | `GET /admin/orders/?page_size=100` + filtros |
| `setOrderStatus` | `PATCH /admin/orders/{id}/` `{ status }`. El servidor ajusta el stock |

- La lista trae dos objetos extra para las tarjetas y las pestañas:
  - `summary`: `{ revenue, orders, avgOrder }`, calculado con todos los filtros.
  - `statusCounts`: `{ all, paid, shipped, delivered, cancelled, refunded }`, calculado solo con `days` y `customer`.
- Cada pedido del admin incluye `units`.
- Filtros: `search`, `status`, `days=7|30|90`, `customer={id}`, `ordering=number|created_at|customer_name|units|total|status`.

### `app/lib/cms/customers.ts`

| Función | Llamada |
|---|---|
| `useCustomers` + `customerStats` | `GET /admin/customers/?page_size=100`. Cada cliente ya trae `ordersCount`, `totalSpent`, `lastOrderAt` |
| `saveCustomer` nuevo | `POST /admin/customers/` `{ name, email, notes }` |
| `saveCustomer` existente, `setCustomerStatus` | `PATCH /admin/customers/{id}/` (`{ status: "blocked" }`, etc.) |
| `deleteCustomers` | `DELETE /admin/customers/{id}/` por cada uno. Sus pedidos se conservan |
| `findOrCreateCustomer` | **Se elimina.** El cliente sale del token en el checkout |

- Filtros: `search`, `status=active|blocked`, `ordering=name|status|orders_count|total_spent|last_order_at|created_at`.
- Errores: `"The customer needs a name."`, `"Enter a valid email address."`, `"Another customer already uses this email."`

### `app/lib/cms/metrics.ts` (dashboard)

- `buildDashboard` pasa a ser `GET /admin/dashboard/?days=7|30|90`.
- La respuesta tiene exactamente la interfaz `Dashboard` del contrato: `revenue`, `orders`, `avgOrder`, `newCustomers`, los cuatro `*Delta.pct`, `series` (un punto por día, incluidos los días sin ventas), `byStatus`, `byCategory`, `topProducts`, `lowStock`, `catalog`, `totals` y `recent`.
- Los días se agrupan en la zona horaria `America/Bogota`.

---

## 6. Qué eliminar

- [ ] `app/lib/cms/demo-data.ts` y el botón **Restore demo data**.
- [ ] Las claves de `localStorage`: `nebulab-cart`, `nebulab-cms-products-v2`, `nebulab-cms-customers`, `nebulab-cms-orders-v2` y `nebulab-cms-admins`. Solo quedan `nebulab-session` y `nebulab-admin-session`.
- [ ] `TAX_RATE` y cualquier cálculo de totales, stock o métricas en el navegador.
- [ ] Los IDs de texto (`cus_001`, `ord_0134`, `adm_001`) en tipos y comparaciones. Pasan a `number`.
- [ ] **Agentation** en producción: hoy va incluida en el bundle desplegado aunque no se muestra. Cárgala solo si `process.env.NODE_ENV === "development"`.

---

## 7. Detalles encontrados en el sitio desplegado

- **`/about` y `/contact` dan 404.** Están enlazadas en el menú ("About us") y en el botón "Contact us" del inicio. Hay que crearlas o quitar los enlaces antes de la sustentación.
- **SCSS:** el documento del curso exige un preprocesador SCSS (RNF04) y el proyecto usa Tailwind CSS. Conviene agregar al menos algunos estilos en archivos `.scss` antes de la semana 14.
- **Estados de carga y error:** hoy no existen porque todo es local. Con la API hacen falta, sobre todo por el arranque en frío de Render.
- **Datos reales:** en Neon no hay pedidos ni clientes todavía. El dashboard empezará en cero, lo cual es normal.

---

## 8. Orden sugerido y cómo probar

1. `api.ts` y la variable `NEXT_PUBLIC_API_URL`.
2. Catálogo: lista, detalle y recomendados. Son públicos, así que se prueban sin login.
3. Login y registro de la tienda, más `AccountGreeting`.
4. Carrito y checkout.
5. Login del CMS y luego productos, clientes, ventas, admins y dashboard.
6. Limpieza (sección 6) y estados de carga y error.

**Flujo de prueba completo:**

1. Regístrate como cliente.
2. Agrega un iPhone eligiendo capacidad y color.
3. Sube la cantidad a 2 y paga. Revisa que el carrito quede vacío.
4. Entra al CMS como admin, abre el pedido y cámbialo a `cancelled`. En la lista de productos el stock debe volver a subir.

---

## 9. Lista de revisión

Marca cada punto cuando lo compruebes contra la API desplegada.

**Configuración**
- [ ] `NEXT_PUBLIC_API_URL` configurada en local y en Vercel, con redeploy hecho.
- [ ] Todas las llamadas usan la `/` final.
- [ ] No aparecen errores de CORS en la consola desde `nebulab-frontend.vercel.app` ni desde `nebulab.digital`.

**Catálogo (sin sesión)**
- [ ] El catálogo muestra los 31 productos, 9 por página, y la paginación usa `count`.
- [ ] Los filtros de categoría, "New" y búsqueda funcionan (buscar `hermes` encuentra "Apple Watch Hermès").
- [ ] El carrusel del home muestra los 5 recomendados.
- [ ] El detalle `/products/iphone-18-pro-max` carga desde la API y un slug inexistente muestra el 404 de la página.

**Cuentas**
- [ ] El registro crea la cuenta y deja la sesión iniciada.
- [ ] El login con credenciales malas muestra `Wrong email or password.`
- [ ] `/login-admin` rechaza a un cliente con el mismo mensaje genérico.
- [ ] `/account` muestra el nombre real y "Sign Out" cierra la sesión en el servidor.
- [ ] Al vencer el token (30 minutos) la sesión se renueva sola; si no se puede, lleva al login.

**Carrito y compra**
- [ ] "Add to cart" sin sesión lleva a `/login`.
- [ ] Mismo producto con las mismas opciones suma cantidad; con otras opciones crea otra línea.
- [ ] `+` y `−` envían la cantidad final; llegar a 0 borra la línea.
- [ ] Subtotal, impuesto (8 %) y total se muestran como llegan del backend.
- [ ] El checkout envía solo `shippingAddress` y `cardLast4`; el toast muestra el número `NB-…` y el carrito queda vacío.
- [ ] Superar el stock muestra `Only N left in stock.`

**Panel de administración**
- [ ] Productos: crear, editar, desactivar y borrar funcionan, y los errores salen debajo de cada campo.
- [ ] Clientes: crear, bloquear y borrar; las columnas de pedidos, total gastado y último pedido vienen del servidor.
- [ ] Ventas: las tarjetas usan `summary`, las pestañas usan `statusCounts`, y cancelar un pedido devuelve el stock.
- [ ] Admins: crear y borrar; no deja borrar tu propia cuenta.
- [ ] Dashboard: los selectores de 7, 30 y 90 días cambian los datos.

**Limpieza**
- [ ] No queda ninguna lectura ni escritura de `nebulab-cart` ni de `nebulab-cms-*`.
- [ ] No quedan IDs de texto (`cus_`, `ord_`, `adm_`) ni `TAX_RATE`.

---

## 10. Recomendaciones

1. **Borra los datos viejos del navegador.** Quien ya visitó la tienda tiene los datos simulados guardados. Al cargar la app por primera vez con la API, elimina `nebulab-cart`, `nebulab-cms-products-v2`, `nebulab-cms-customers`, `nebulab-cms-orders-v2`, `nebulab-cms-admins` y la `nebulab-admin-session` vieja (la que no tiene `access`).
2. **Muestra los errores tal como llegan.** Los errores de campo vienen como `{ "campo": ["mensaje"] }` con las mismas claves de tus formularios, y los generales como `{ "detail": "mensaje" }`. Ya están en inglés.
3. **Maneja el arranque en frío.** Pon esqueletos de carga en catálogo y panel, y un mensaje amable si la API tarda más de unos segundos.
4. **No recalcules nada en el front.** Totales, impuesto, stock, estadísticas de clientes y dashboard los da el servidor; recalcularlos puede dar centavos distintos.
5. **Precios.** La API puede enviar `1199.0`; en JavaScript es el mismo número. Si algún día hay precios con centavos, formatea con 2 decimales.
6. **Protege las rutas por sesión, no por URL.** Sin `nebulab-session` válida, `/home`, `/bag` y `/account` deben mandar a `/login`; sin sesión de admin, `/admin` manda a `/login-admin`.
7. **Resuelve lo de la sección 7** (los 404 de `/about` y `/contact`, y SCSS) antes de la sustentación.
8. **Accesibilidad:** revisa textos alternativos de imágenes, el foco visible en botones y el contraste del tema oscuro.

Si encuentras algo que no cuadra con la API, dime el endpoint, lo que enviaste y lo que respondió. El backend se ajusta rápido.
