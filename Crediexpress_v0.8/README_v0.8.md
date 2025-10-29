# CrediExpress v0.8 — Integración API Cédula (Ecuador)

Esta versión autocompleta el nombre completo a partir del número de cédula (10 dígitos) usando el web service externo.

## Variables de entorno (Vercel)
Configura en tu proyecto de Vercel (Settings → Environment Variables):

- `VITE_API_BASE_URL` = `https://webservices.ec/api/cedula`
- `VITE_API_TOKEN` = `<TU_TOKEN>`

> No subas el token al repositorio público. Usa variables de entorno en Vercel.

## Notas técnicas
- Servicio: `src/services/cedula.ts`
- Página: `src/pages/Step1Identity.tsx` (escucha cambios en `idNumber` y autocompleta `fullName`).
- Manejo de errores: silencioso en UI; revisa consola si hay problemas de red o credenciales.
