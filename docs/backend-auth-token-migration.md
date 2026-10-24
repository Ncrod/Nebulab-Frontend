# Backend: migración de tokens fuera de `localStorage`

## Objetivo y estado actual

Este documento es el encargo para el equipo de NebuBack. El frontend guarda hoy `access`, `refresh` y `user` en `localStorage`, con claves separadas para clientes y administradores. Envía `access` como `Authorization: Bearer ...`, manda `refresh` en el cuerpo de `/auth/refresh/` y `/auth/logout/`, y comprueba la sesión en el navegador. Véanse `app/lib/api.ts`, `app/lib/auth.ts` y `app/lib/cms/admin-auth.ts`.

El objetivo es que **ningún token de renovación sea accesible a JavaScript** y que el token de acceso permanezca **solo en memoria** del frontend, con una vida corta. Una cookie `HttpOnly` protege el token de renovación frente a su lectura por un script inyectado; no elimina por sí sola el riesgo de XSS ni impide que un script malicioso haga peticiones mientras está activo.

> **No dar por cerrado el riesgo al desplegar solo el backend.** El frontend debe adoptar el contrato nuevo, dejar de guardar ambos tokens en `localStorage` y completar las pruebas de extremo a extremo indicadas abajo.

## Decisión de infraestructura obligatoria

La tienda publicada usa `https://nebulab.digital` y la URL actual de la API es `https://nebuback.onrender.com/api`. Son sitios distintos. Una cookie `SameSite=Lax` o `Strict` del dominio `onrender.com` no acompañará las peticiones `fetch` hechas desde `nebulab.digital`; `SameSite=None` además depende de que el navegador permita cookies de terceros.

Antes de cambiar los endpoints, publicar la API en un origen **del mismo sitio** que el frontend, por ejemplo `https://api.nebulab.digital/api`, o interponer una ruta del mismo origen mediante un BFF/proxy que maneje las cookies. Confirmar también cómo funcionarán los dominios de pruebas y los despliegues de vista previa. Documentar el origen elegido y las variables de entorno finales. Mantener HTTPS en producción.

Si se usa `api.nebulab.digital`, la cookie debe ser **host-only**: no establecer `Domain=.nebulab.digital`. El frontend enviará `credentials: "include"` a los endpoints que usan la cookie. El backend debe permitir únicamente los orígenes concretos del frontend, responder con `Access-Control-Allow-Credentials: true` y `Vary: Origin`, y nunca usar `Access-Control-Allow-Origin: *` con credenciales.

## Contrato solicitado al backend

Los nombres exactos pueden acordarse, pero la semántica debe quedar documentada antes de adaptar el frontend. El ejemplo siguiente conserva las dos sesiones independientes que existen hoy.

| Operación | Petición | Respuesta esperada |
| --- | --- | --- |
| `POST /api/auth/login/` | `{ "email": "...", "password": "...", "kind": "customer" \| "admin" }` | JSON `{ "access": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "cliente" \| "admin" } }` y `Set-Cookie` del `kind` correspondiente. **Sin `refresh` en JSON.** Rechazar un rol que no corresponda al `kind` solicitado. |
| `POST /api/auth/register/` | Registro de cliente como ahora. | Mismo formato `{ access, user }` y cookie de cliente. |
| `POST /api/auth/refresh/` | `{ "kind": "customer" \| "admin" }`, sin token en el cuerpo; cookie enviada por el navegador. | Rotar el token de renovación; responder `{ access, user }` y nueva cookie. Ante cookie ausente, vencida, revocada o de otro rol, responder `401`. **Sin `refresh` en JSON.** |
| `POST /api/auth/logout/` | `{ "kind": "customer" \| "admin" }`, sin token en el cuerpo. | Revocar la sesión representada por esa cookie y expirar esa cookie con los mismos atributos de nombre, ruta y dominio. Hacer la operación idempotente, incluso si el token de acceso venció. No cerrar la otra sesión. |
| Endpoints privados | `Authorization: Bearer <access>` como ahora. | Validar firma, vencimiento y permisos en el servidor. Los endpoints de administración deben exigir rol `admin`, independientemente de la ruta o de la UI. No usar la cookie de renovación para autenticar operaciones de negocio. |

La respuesta `user` de renovación permite reconstruir la sesión después de recargar la página sin persistir el token de acceso. Si se prefiere otro mecanismo, entregar un endpoint `/auth/me/` y documentar cómo se obtiene el usuario inmediatamente después de renovar.

## Cookies y ciclo de vida

1. Emitir **dos cookies de renovación distintas**, una para `customer` y otra para `admin`, con nombres inequívocos. El ejemplo recomendado es `__Host-nebulab-refresh-customer` y `__Host-nebulab-refresh-admin`: `Secure`, `HttpOnly`, `SameSite=Lax` o `Strict`, `Path=/` y **sin `Domain`**. Registrar la elección exacta. No poner tokens en cookies legibles por JavaScript.
2. Definir y documentar la duración de los tokens de acceso y renovación. El acceso debe ser corto; la renovación debe expirar y poder revocarse en el servidor. No confiar solo en que el navegador borre la cookie.
3. Rotar el token de renovación en cada `/auth/refresh/`; invalidar el anterior de forma atómica. Definir cómo se detecta su reutilización y cómo se manejan dos renovaciones simultáneas de pestañas diferentes sin cerrar una sesión legítima por accidente. Documentar la política elegida.
4. Revocar la renovación al cerrar sesión; definir la revocación de sesiones al cambiar o restablecer contraseña y al desactivar una cuenta. Rechazar tokens anteriores después del corte de migración según un plan explícito.
5. Establecer `Cache-Control: no-store` en login, registro, renovación y logout. No escribir tokens, contraseñas ni valores completos de `Set-Cookie` en logs, trazas o errores.
6. Aplicar protección CSRF a los endpoints que aceptan cookies (`refresh`, `logout` y cualquier otro que las use): validar `Origin` frente a una lista exacta de orígenes permitidos y usar el mecanismo CSRF del backend cuando corresponda. `SameSite` y CORS son capas adicionales, no sustitutos de la validación CSRF.
7. Limitar intentos de login y renovación y mantener mensajes de error que no filtren si una cuenta existe.

## Cambios que haremos en este frontend después

Cuando el backend esté listo y entregue el reporte de abajo, adaptaremos `app/lib/api.ts`, `app/lib/auth.ts` y `app/lib/cms/admin-auth.ts` para:

- Usar `credentials: "include"` en login, registro, renovación y logout según el origen elegido.
- Mantener `access` y `user` en memoria; renovar al cargar la aplicación para restaurar cliente y administrador por separado.
- Eliminar la lectura y escritura de `nebulab-session` y `nebulab-admin-session` en `localStorage`, y limpiar los valores heredados durante la migración.
- Enviar únicamente `access` en `Authorization`; no leer ni enviar la cookie desde JavaScript ni poner `refresh` en JSON.
- Mantener el cierre de sesión, la expiración, los errores `401`/`403` y las dos sesiones independientes. Coordinar pestañas si la política de rotación lo requiere.

## Pruebas de aceptación antes de cerrar el riesgo

- Login y registro devuelven `access` y `user`, nunca `refresh` en JSON; las cookies llegan con los atributos acordados y no aparecen en `document.cookie`.
- Tras recargar la página, cliente y administrador recuperan su sesión mediante la cookie y reciben un nuevo `access`; `localStorage` y `sessionStorage` no contienen tokens.
- Al vencer `access`, la petición se recupera una vez mediante `/auth/refresh/`; un token de renovación viejo o revocado no puede reutilizarse.
- Logout invalida la renovación en el servidor y elimina la cookie; una recarga no reabre la sesión. Cerrar cliente no cierra administrador y viceversa.
- Un cliente sin rol `admin` recibe `403` en endpoints administrativos aun si intenta llamar a la API directamente.
- Una petición desde un origen no autorizado no puede leer respuestas con credenciales ni renovar/cerrar una sesión mediante CSRF.
- Las pruebas anteriores funcionan en el dominio de producción y en el entorno de prueba acordado, con HTTPS y sin depender de cookies de terceros.

## Reporte que debe enviarnos el equipo de backend

No incluir tokens reales, contraseñas ni cookies completas. Enviar:

1. Repositorio, rama, commit o PR y fecha de despliegue en el entorno de prueba.
2. Origen público definitivo de la API y lista exacta de orígenes frontend permitidos (producción, pruebas y vistas previas si aplican).
3. Contrato final de cada endpoint: método, ruta, cuerpos de solicitud y respuesta de ejemplo **con valores ficticios**, códigos de error y si requiere `credentials: "include"`.
4. Nombres y atributos de las cookies (`Secure`, `HttpOnly`, `SameSite`, `Path`, `Domain`), duración de acceso/renovación y reglas de rotación y revocación.
5. Cómo se distinguen las sesiones de cliente y administrador, cómo se valida el rol y qué pasa con los tokens antiguos.
6. Implementación de CORS y CSRF, junto con resultados de pruebas automatizadas o manuales para los casos de aceptación anteriores. Redactar cualquier captura de encabezados `Set-Cookie`.
7. Cambios de configuración que debemos hacer en el frontend (`NEXT_PUBLIC_API_URL`, dominios de prueba, etc.) y pasos de despliegue coordinado.

Con ese reporte podremos implementar la mitad frontend y verificarla. Solo entonces se podrá marcar como mitigado el riesgo de **tokens persistidos y legibles por JavaScript**; seguiremos tratando XSS y la seguridad de los tokens de acceso en memoria como riesgos separados.

## Referencias

- [OWASP, Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP, Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN, peticiones con credenciales y CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Credentials)
