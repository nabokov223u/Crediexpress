# Entendimiento del Proyecto Crediexpress

Este documento resume el entendimiento del proyecto Crediexpress, una aplicación web de pre-calificación de créditos vehiculares.

## 1. Visión General
Crediexpress es un asistente (wizard) de 3 pasos construido con **React**, **TypeScript** y **Vite**. Su objetivo es permitir a los usuarios pre-calificar para un crédito vehicular ingresando su identidad y configurando las condiciones del préstamo.

## 2. Stack Tecnológico
-   **Frontend Framework**: React (v18)
-   **Build Tool**: Vite
-   **Lenguaje**: TypeScript
-   **Estilos**: Tailwind CSS
-   **Animaciones**: Framer Motion
-   **Manejo de Formularios**: React Hook Form + Zod (validación)
-   **Backend/Persistencia**: Firebase (para guardar solicitudes), SessionStorage (para persistencia local del estado)

## 3. Arquitectura y Flujo de Datos

### 3.1. Estado Global (`FormContext.tsx`)
El estado de la aplicación se maneja a través de un Contexto de React (`FormContext`).
-   **Datos del Solicitante (`Applicant`)**: Cédula, Nombre, Teléfono, Email, Estado Civil, Cédula del Cónyuge.
-   **Datos del Préstamo (`Loan`)**: Monto del Vehículo, Porcentaje de Entrada (0-1), Plazo en Meses.
-   **Persistencia**: Los datos se guardan automáticamente en `sessionStorage` bajo la clave `crediexpress:data` para evitar pérdida de datos al recargar.

### 3.2. Flujo de Usuario (`App.tsx`)
La aplicación no utiliza un router tradicional (como react-router). En su lugar, maneja un estado local `step` en `App.tsx` para renderizar los componentes correspondientes.
1.  **Splash Screen**: Animación inicial de carga.
2.  **Paso 1: Identidad (`Step1IdentityMinimal.tsx`)**:
    -   El usuario ingresa su cédula.
    -   Se consulta un servicio (`cedula.ts`) para obtener el nombre.
    -   El usuario completa teléfono, email y estado civil.
3.  **Paso 2: Vehículo (`Step2VehicleMinimal.tsx`)**:
    -   El usuario ajusta el Monto del Vehículo, Entrada (%) y Plazo.
    -   Se calcula la cuota mensual en tiempo real (`calculator.ts`).
    -   Al finalizar, se envía la solicitud a la API.
4.  **Resultado (`ResultMinimal.tsx`)**:
    -   Muestra el estado de la solicitud: `approved`, `review` o `denied`.

### 3.3. Servicios
-   **`api.ts`**: Maneja la comunicación con el backend (`https://api-pre.originarsa.com/...`). Transforma los datos del contexto al formato requerido por el endpoint `ObtenerCalificacionCreditoRapido`.
-   **`calculator.ts`**: Contiene la lógica de negocio para calcular la cuota mensual utilizando el sistema de amortización francés.
-   **`cedula.ts`**: Servicio para obtener datos de la persona a partir de su cédula.

## 4. Estructura de Archivos Clave
-   `src/App.tsx`: Componente raíz, maneja la navegación entre pasos.
-   `src/context/FormContext.tsx`: Definición del estado y tipos de datos.
-   `src/pages/Step1IdentityMinimal.tsx`: Lógica y UI del paso 1.
-   `src/pages/Step2VehicleMinimal.tsx`: Lógica y UI del paso 2 (simulador).
-   `src/utils/validators.ts`: Esquemas de validación Zod.

## 5. Notas Adicionales
-   El proyecto utiliza componentes "Minimal" (`Step1IdentityMinimal`, etc.) que parecen ser una iteración de diseño sobre los componentes originales.
-   La validación de formularios es estricta, especialmente con la cédula y los campos requeridos.
-   Las animaciones son una parte central de la experiencia de usuario (UX), utilizando `AnimatePresence` para transiciones suaves entre pasos.
