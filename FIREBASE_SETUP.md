# Configuración Firebase para Vercel

## Variables de entorno necesarias en Vercel

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en tu proyecto de Vercel:

### Pasos para configurar en Vercel:

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en "Settings" > "Environment Variables"
3. Agrega las siguientes variables:

```
VITE_FIREBASE_API_KEY = [tu_api_key]
VITE_FIREBASE_AUTH_DOMAIN = [tu_proyecto_id].firebaseapp.com
VITE_FIREBASE_PROJECT_ID = [tu_proyecto_id]
VITE_FIREBASE_STORAGE_BUCKET = [tu_proyecto_id].appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = [tu_sender_id]
VITE_FIREBASE_APP_ID = [tu_app_id]
```

### Cómo obtener los valores de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Click en el ícono de configuración ⚙️ > "Project settings"
4. En la sección "Your apps", click en "Config" 
5. Copia los valores del objeto `firebaseConfig`

### Ejemplo de configuración Firebase:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // → VITE_FIREBASE_API_KEY
  authDomain: "mi-proyecto.firebaseapp.com", // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "mi-proyecto", // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "mi-proyecto.appspot.com", // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789", // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123" // → VITE_FIREBASE_APP_ID
};
```

### Configurar Firestore Database:

1. En Firebase Console, ve a "Firestore Database"
2. Click "Create database"
3. Selecciona modo "Start in production mode" 
4. Elige una ubicación (recomendado: us-central)
5. Configurar reglas de seguridad (ejemplo básico):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura en la colección applications
    match /applications/{document} {
      allow read, write: if true; // Cambiar por reglas más estrictas en producción
    }
  }
}
```

### Estructura de datos en Firestore:

La aplicación creará documentos en la colección `applications` con la siguiente estructura:

```javascript
{
  applicant: {
    idNumber: "string",
    fullName: "string", 
    maritalStatus: "single" | "married",
    spouseId: "string" // opcional
  },
  loan: {
    vehicleAmount: number,
    downPaymentPct: number, // 0-1 (ej: 0.2 = 20%)
    termMonths: number
  },
  status: "approved" | "review" | "denied",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Notas de seguridad:

- Las variables `VITE_*` son públicas y se incluyen en el bundle del cliente
- Configura reglas de Firestore adecuadas para producción
- Considera habilitar App Check para mayor seguridad
- Los API keys de Firebase son seguros para uso público, pero configura restricciones de dominio