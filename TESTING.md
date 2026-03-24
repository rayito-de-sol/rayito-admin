# Testing & Validation Guide

Este documento describe las pruebas manuales que deben realizarse para validar la configuración inicial de Rayito Admin.

## Prerequisitos

Antes de comenzar las pruebas, asegúrate de:

1. Configurar las variables de entorno en `.env.local`
2. Tener el backend API de Rayito corriendo
3. Tener una cuenta de Supabase configurada con usuarios de prueba

## Pruebas de Autenticación

### ✅ 17.1 Verificar flujo de inicio de sesión exitoso

**Pasos:**
1. Navega a http://localhost:5173
2. Deberías ser redirigido a `/login`
3. Ingresa credenciales válidas (email y contraseña)
4. Haz clic en "Iniciar sesión"

**Resultado esperado:**
- El spinner de carga aparece brevemente
- Eres redirigido a `/dashboard`
- Ves el mensaje de bienvenida con tu nombre o email
- El menú de navegación lateral aparece
- El botón de "Cerrar sesión" está visible en el header

### ✅ 17.2 Verificar mensaje de error con credenciales inválidas

**Pasos:**
1. En `/login`, ingresa un email o contraseña incorrectos
2. Haz clic en "Iniciar sesión"

**Resultado esperado:**
- Aparece un mensaje de error en rojo
- El mensaje indica credenciales inválidas
- No eres redirigido del login

### ✅ 17.3 Verificar redirección de rutas protegidas sin autenticación

**Pasos:**
1. Abre una ventana de incógnito o borra las cookies
2. Navega directamente a http://localhost:5173/dashboard

**Resultado esperado:**
- Eres redirigido automáticamente a `/login`
- La URL incluye `?returnTo=/dashboard`

### ✅ 17.4 Verificar acceso al dashboard con autenticación

**Pasos:**
1. Inicia sesión exitosamente
2. Navega a `/dashboard`

**Resultado esperado:**
- El dashboard se renderiza correctamente
- Ves el mensaje de bienvenida
- El layout con header y navegación lateral está presente

### ✅ 17.5 Verificar cierre de sesión

**Pasos:**
1. Desde el dashboard, haz clic en "Cerrar sesión" en el header
2. Confirma que quieres cerrar sesión si aparece un diálogo

**Resultado esperado:**
- El spinner de carga aparece brevemente
- Eres redirigido a `/login`
- Tu sesión se borra (no puedes volver atrás al dashboard)

### ✅ 17.6 Verificar auto-refresh de tokens

**Pasos:**
1. Inicia sesión
2. Abre las DevTools del navegador (Console)
3. Espera aproximadamente 50 minutos (o ajusta el tiempo de expiración en Supabase para pruebas)

**Resultado esperado:**
- En la consola, verás logs de "Auth state changed: TOKEN_REFRESHED"
- La sesión se mantiene activa sin necesidad de re-autenticarse

### ✅ 17.7 Verificar cierre automático en error 401

**Pasos:**
1. Inicia sesión
2. Invalida manualmente el token (usando DevTools → Application → Local Storage → borra el token de Supabase)
3. Intenta hacer una acción que requiera una llamada a la API

**Resultado esperado:**
- Recibes un error 401 del backend
- Automáticamente cierras sesión
- Eres redirigido a `/login`
- Aparece un mensaje de "Sesión expirada"

## Pruebas de Manejo de Errores

### ✅ 17.8 Verificar que el Error Boundary captura errores de renderizado

**Pasos:**
1. Temporalmente modifica un componente para que lance un error (e.g., `throw new Error('Test error')` en `DashboardPage`)
2. Navega al dashboard

**Resultado esperado:**
- Aparece la pantalla de error con mensaje "¡Algo salió mal!"
- Hay botones para "Intentar de nuevo" y "Recargar página"
- El error se muestra en la consola
- Al hacer clic en "Recargar página", la app se recarga

**No olvides revertir el cambio después de la prueba**

### ✅ 17.9 Verificar spinner de carga durante operaciones de autenticación

**Pasos:**
1. En `/login`, ingresa credenciales válidas
2. Observa mientras haces clic en "Iniciar sesión"
3. Desde el dashboard, haz clic en "Cerrar sesión"

**Resultado esperado:**
- Durante el inicio de sesión, aparece un overlay de carga con spinner
- Durante el cierre de sesión, aparece el mismo overlay
- El texto "Cargando..." está visible

## Pruebas de Navegación

### ✅ 17.10 Verificar parámetro returnTo después del login

**Pasos:**
1. Sin estar autenticado, navega a http://localhost:5173/dashboard
2. Serás redirigido a `/login?returnTo=/dashboard`
3. Inicia sesión

**Resultado esperado:**
- Después del login exitoso, eres redirigido a `/dashboard` (no a la raíz)
- La URL final es `/dashboard` (sin el parámetro returnTo)

### Prueba adicional con ruta personalizada:
1. Navega a http://localhost:5173/users (si existe en el futuro)
2. Serás redirigido a `/login?returnTo=/users`
3. Inicia sesión

**Resultado esperado:**
- Eres redirigido a `/users` después del login

## Pruebas de Calidad de Código

### ✅ 17.11 Ejecutar linter y corregir advertencias

**Pasos:**
```bash
pnpm lint
```

**Resultado esperado:**
- El linter se ejecuta sin errores
- No hay advertencias o todos han sido corregidos

### ✅ 17.12 Probar en diferentes navegadores

**Navegadores a probar:**
- Chrome (última versión)
- Firefox (última versión)
- Safari (si estás en macOS)
- Edge (si estás en Windows)

**Funcionalidades a verificar en cada navegador:**
- Login funciona correctamente
- Navegación funciona
- Estilos se renderizan correctamente
- No hay errores en la consola

## Checklist Completo

- [ ] 17.1 Flujo de inicio de sesión exitoso
- [ ] 17.2 Mensaje de error con credenciales inválidas
- [ ] 17.3 Redirección de rutas protegidas sin auth
- [ ] 17.4 Acceso al dashboard con auth
- [ ] 17.5 Cierre de sesión
- [ ] 17.6 Auto-refresh de tokens
- [ ] 17.7 Cierre automático en error 401
- [ ] 17.8 Error Boundary captura errores
- [ ] 17.9 Spinner de carga en operaciones auth
- [ ] 17.10 Parámetro returnTo funciona
- [ ] 17.11 Linter sin errores
- [ ] 17.12 Probado en Chrome, Firefox, otros

## Notas

- Todas estas pruebas deben realizarse una vez que el entorno esté configurado
- Reporta cualquier bug encontrado como issue
- Actualiza este documento si agregas nuevas funcionalidades que requieran pruebas

---

Última actualización: 2025-01-20
