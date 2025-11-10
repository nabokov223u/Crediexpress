# Configuración Local de Desarrollo

## Para probar Firebase localmente:

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Completa las variables de Firebase en `.env` con los valores de tu proyecto

3. Ejecuta la aplicación:
   ```bash
   npm run dev
   ```

## Comandos útiles:

```bash
# Construir para producción
npm run build

# Vista previa de build de producción
npm run preview

# Verificar que las variables de entorno están configuradas
npm run dev # y revisa la consola del navegador
```

## Troubleshooting:

### Error: "Firebase configuration is missing"
- Verifica que todas las variables `VITE_FIREBASE_*` estén configuradas
- Asegúrate de que el archivo `.env` existe y tiene los valores correctos

### Error: "Permission denied" en Firestore
- Revisa las reglas de seguridad de Firestore
- Para desarrollo, puedes usar reglas permisivas (cambiar en producción)

### La aplicación no guarda datos
- Abre las herramientas de desarrollador del navegador
- Revisa la pestaña "Console" para errores de Firebase
- Verifica que el proyecto de Firebase tiene Firestore habilitado