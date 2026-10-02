# Nebulab: lo que falta en el frontend

Hola Nico. Revisé el enunciado del examen final contra lo que tenemos. El backend ya cubre todo lo suyo, pero quedan
estas cosas del lado del front. Van en orden de prioridad.

API: `https://nebuback.onrender.com/api` · Swagger: `https://nebuback.onrender.com/api/docs/`

---

## 1. Pantalla de categorías en el panel de admin (obligatorio)

El examen pide que el panel gestione **categorías y productos**: crear, listar, editar y eliminar sin recargar la
página (criterio de aceptación #3). Hoy el CMS solo tiene productos. Hay que agregar algo como `/admin/categories`,
con el mismo estilo que la pantalla de productos.

Todos los endpoints llevan `Authorization: Bearer <access del admin>`. Sin token → `401`; con un cliente → `403`.

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/admin/categories/` | Lista paginada (10 por página) con `productsCount` |
| `POST` | `/admin/categories/` | Crear |
| `GET` | `/admin/categories/{id}/` | Ver una |
| `PATCH` | `/admin/categories/{id}/` | Editar (parcial) |
| `DELETE` | `/admin/categories/{id}/` | Borrar → `204` sin cuerpo |

### Listar

`GET /admin/categories/?search=watch&ordering=-products_count&page=1`

- `search`: palabras contra nombre y slug.
- `ordering`: `id`, `name`, `products_count` (con `-` delante para descendente). Por defecto `id`.

```json
{
  "count": 7,
  "next": null,
  "previous": null,
  "results": [
    { "id": 1, "name": "Iphone", "slug": "iphone", "productsCount": 0 }
  ]
}
```

### Crear

```json
POST /admin/categories/
{ "name": "Apple TV" }
```

→ `201 { "id": 8, "name": "Apple TV", "slug": "apple-tv", "productsCount": 0 }`

`slug` es opcional: si no se envía (o va vacío) se genera desde el nombre.

### Editar

```json
PATCH /admin/categories/8/
{ "name": "Apple TV 4K" }
```

→ `200` con la categoría actualizada. Los productos de esa categoría pasan a mostrar el nombre nuevo (recuerda que el
campo `category` de un producto es el **nombre** de la categoría). El slug solo cambia si lo envías.

### Borrar

`DELETE /admin/categories/8/` → `204`.

Si la categoría tiene productos → `400 { "detail": "This category has products. Move them to another category or delete them first." }`.
Sugerencia: deshabilitar el botón cuando `productsCount > 0` y, si igual llega el 400, mostrar el `detail` en un toast.

### Errores de validación (400, por campo, igual que en productos)

```json
{ "name": ["The category needs a name."] }
{ "name": ["Another category already uses this name."] }
{ "slug": ["Use only lowercase letters, numbers and hyphens."] }
{ "slug": ["Another category already uses this slug."] }
```

---

## 2. Categorías dinámicas en toda la app (obligatorio)

Como ahora se pueden crear, renombrar y borrar categorías, **ya no pueden estar quemadas en el código**. Usar siempre
`GET /categories/` (público, sin token, sin paginar, devuelve un array):

```json
[ { "id": 1, "name": "Iphone", "slug": "iphone" }, ... ]
```

Revisar al menos:
- El menú / filtros del catálogo público (la tienda debe poder "navegarse por categoría").
- El `<select>` de categoría del formulario de crear/editar producto.
- El filtro de categoría de la lista de productos del admin.

Para filtrar productos: `GET /products/?category=<name>` (nombre exacto, no distingue mayúsculas).

---

## 3. Mostrar el error de "HTML no permitido" (obligatorio)

Por seguridad (XSS), el backend ahora rechaza **cualquier** texto que traiga etiquetas HTML, en todos los endpoints
(nombre, descripción, opciones de producto, dirección de envío, notas de cliente, registro…):

```json
400 { "description": ["HTML tags are not allowed."] }
```

Las contraseñas no se revisan, y un texto normal con `<`, `>` o `&` sueltos sí se acepta. Solo hay que asegurarse de
que ese error se muestre bajo el campo como cualquier otro error de validación (si los formularios ya pintan los
errores por campo, no hay que hacer nada).

---

## 4. Seguridad del lado del front (para la sustentación)

El criterio #8 pide demostrar HTTPS, XSS y CSRF con casos concretos. El backend ya lo cubre, pero conviene que el front
también lo pueda justificar:

- **XSS:** no usar `dangerouslySetInnerHTML` en ningún lado (o confirmar que no se usa). React escapa todo lo que
  muestra; esa es nuestra defensa en el front.
- **CSRF:** el token va en el encabezado `Authorization: Bearer`, no en cookies. No cambiar eso (no guardar la sesión en
  cookies que el navegador mande solo).
- **HTTPS:** Vercel ya sirve todo por HTTPS. Revisar que todas las URLs (API, imágenes) sean `https://`.
- Si quieres, agrega cabeceras de seguridad en `next.config` (`X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`). Es opcional, pero suma.

---

## 5. Requisitos del examen que son del front

Confirmar que están (son de la semana 14 y se revisan en la sustentación):

- [ ] **SCSS** en la aplicación (aunque usemos Tailwind, el enunciado lo pide explícitamente).
- [ ] **Gestor de dependencias / task runner** (pnpm con scripts en `package.json`), y saber explicarlo.
- [ ] La app desplegada y accesible (`https://www.nebulab.digital`).
- [ ] El carrito: agregar, quitar, cambiar cantidad y ver el total, todo contra la API.

---

## 6. Ojo: la base de datos quedó limpia

Vaciamos la base de datos para la entrega. Quedan **solo las 7 categorías y los admins** (`admin@nebulab.com` y tu
cuenta). **No hay productos, clientes, carritos ni pedidos**, así que la tienda se va a ver vacía hasta que carguemos
los productos desde el panel de admin. Si tenías sesiones abiertas, vuelve a iniciar sesión.

---

## Cómo probar rápido

1. Inicia sesión como admin en el CMS.
2. Crea una categoría "Prueba" → debe aparecer en la tienda y en el formulario de productos.
3. Crea un producto en "Prueba" → intenta borrar la categoría → debe salir el error de que tiene productos.
4. Borra el producto, luego la categoría → `204` y desaparece de todos lados.
5. Escribe `<b>hola</b>` en la descripción de un producto → debe salir "HTML tags are not allowed." bajo el campo.

Cualquier duda, todo está documentado en Swagger con ejemplos. 🙌
