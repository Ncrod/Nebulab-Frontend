# Resumen de la migración de autenticación a cookies

Fecha: 24 de octubre de 2026 (hora de Colombia).

## Estado

El frontend quedó desplegado en producción con el commit `ae02273` (`Migrate frontend auth to refresh cookies`). Vercel promovió el despliegue `dpl_GdpRXmGA4XNbzLzkDD98jvir7oF6` a los dominios públicos, incluido <https://www.nebulab.digital>. La API de producción usa `https://api.nebulab.digital/api`.

## Cambios realizados

- Login de tienda y CMS envían `kind: "customer"` y `kind: "admin"`, respectivamente. Login y registro usan `credentials: "include"` y reciben `{ access, user }`.
- Refresh y logout envían solo `{ kind }` con `credentials: "include"`. El token de renovación permanece en una cookie `HttpOnly`; el frontend no lo lee ni lo guarda.
- `access` y `user` se mantienen solo en memoria. Al iniciar la aplicación se eliminan las claves antiguas `nebulab-session` y `nebulab-admin-session` de `localStorage` y se intenta restaurar cada sesión con refresh.
- Las peticiones privadas siguen usando `Authorization: Bearer <access>`. Tras un 401 se renueva una vez y se reintenta la petición. `navigator.locks` coordina la renovación entre pestañas; `BroadcastChannel` comunica el cierre de sesión sin transmitir tokens.
- Se configuró `NEXT_PUBLIC_API_URL=https://api.nebulab.digital/api` en Vercel para Production y Preview. El código también convierte el valor heredado `https://nebuback.onrender.com/api` al host nuevo durante la transición.
- Se actualizó el README con la configuración local y la necesidad de coordinar el contrato del backend.

## Verificaciones realizadas

- `pnpm build`, TypeScript y ESLint pasaron. También se compiló simulando que Vercel aún tenía configurada la URL antigua.
- El despliegue de Vercel terminó en estado `Ready`. `/login` y `/login-admin` responden 200 en el dominio público y cargan el bundle de autenticación nuevo.
- La API de producción respondió 401 a refresh sin cookie, 403 desde un origen no permitido y 204 a logout sin sesión. El origen público del frontend recibió los encabezados CORS esperados.

## Pendiente de comprobar

- Probar con cuentas reales en Chrome y Safari de iPhone: cookie `__Host-nebulab-refresh-*` con `HttpOnly`, ausencia en `document.cookie`, sesión restaurada tras recargar, ningún token en `localStorage` y cierre independiente de tienda y CMS.
- Investigar el mensaje `This account cannot sign in here.` de una cuenta reportada como administradora. El backend valida la contraseña antes de mostrar ese 403. Si se usó `/login`, se debe entrar por `/login-admin`; si ocurrió en `/login-admin`, hay que revisar el rol de esa cuenta en la base de datos. La contraseña que apareció visible en una captura debe restablecerse; no se incluye aquí.
- Corregir los permisos del autor del commit en Vercel: los despliegues automáticos desde Git quedaron bloqueados. Este despliegue se hizo directamente con Vercel CLI y se promovió después de verificarlo.
