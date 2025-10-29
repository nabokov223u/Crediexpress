# Modo Mock para API de Cédula

Este proyecto incluye un interruptor (switch) para activar o desactivar las llamadas reales al servicio de cédula ecuatoriana, ideal para desarrollo visual o pruebas sin costo.

## ¿Cómo funciona?

- Se controla con la variable de entorno `VITE_USE_API_CEDULA`.
- Cuando está en `false`, la app NO llama a internet y devuelve datos simulados de forma determinística.
- Cuando está en `true`, la app usa el proveedor real configurado con `VITE_API_BASE_URL` y `VITE_API_TOKEN`.

El switch se implementa en `src/services/cedula.ts`.

## Variables de entorno

Configure sus variables en un archivo `.env` (no se versiona) o en el panel de su proveedor (por ejemplo, Vercel):

```bash
# Control del modo API de cédula
VITE_USE_API_CEDULA=false   # Modo MOCK (recomendado para desarrollo)
# VITE_USE_API_CEDULA=true  # Modo REAL

# Solo necesarias en modo REAL
VITE_API_BASE_URL="https://tu-proveedor.example.com/api/cedula"
VITE_API_TOKEN="tu_token_de_acceso"
```

Notas:
- Valores considerados como "false" para desactivar el modo real: `false`, `0`, `no`, `off` (insensible a mayúsculas/minúsculas).
- Si `VITE_USE_API_CEDULA` no está definida, el comportamiento por defecto es USAR la API real.

## Prueba rápida

1. Inicie la app en desarrollo.
2. En el paso de Identidad, ingrese una cédula válida (10 dígitos).
3. Observe que el campo "Nombre completo" se autocompleta con datos simulados cuando el modo MOCK está activo.

El mock retorna nombres/apellidos deterministas en base a los últimos 3 dígitos de la cédula, para facilitar pruebas repetibles.

## Producción (Vercel)

- Defina `VITE_USE_API_CEDULA=true` y configure `VITE_API_BASE_URL` y `VITE_API_TOKEN` en **Project Settings → Environment Variables**.
- Realice un redeploy para aplicar los cambios.

## Archivo relevante

- `src/services/cedula.ts`: contiene la lógica del switch MOCK/REAL y la normalización de la respuesta.
