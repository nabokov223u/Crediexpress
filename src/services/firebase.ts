import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { FormData } from '../context/FormContext';

export interface PrequalificationResult {
  status: 'approved' | 'review' | 'denied';
  id?: string;
}

export interface FirestoreApplication extends FormData {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'approved' | 'review' | 'denied';
  id?: string;
}

/**
 * Guarda una nueva aplicación de prequalificación en Firestore
 */
export async function savePrequalificationToFirebase(
  formData: FormData,
  result: PrequalificationResult
): Promise<string> {
  try {
    const applicationData: Omit<FirestoreApplication, 'id'> = {
      ...formData,
      status: result.status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'applications'), applicationData);
    
    console.log('Aplicación guardada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error guardando aplicación en Firebase:', error);
    throw new Error('No se pudo guardar la aplicación en la base de datos');
  }
}

/**
 * Actualiza el estado de una aplicación existente
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'approved' | 'review' | 'denied'
): Promise<void> {
  try {
    const applicationRef = doc(db, 'applications', applicationId);
    await updateDoc(applicationRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    console.log('Estado de aplicación actualizado:', applicationId);
  } catch (error) {
    console.error('Error actualizando estado de aplicación:', error);
    throw new Error('No se pudo actualizar el estado de la aplicación');
  }
}

/**
 * Estructura de datos que se guarda en Firestore:
 * 
 * Collection: 'applications'
 * Document structure:
 * {
 *   applicant: {
 *     idNumber: string,
 *     fullName: string,
 *     maritalStatus: "single" | "married",
 *     spouseId?: string
 *   },
 *   loan: {
 *     vehicleAmount: number,
 *     downPaymentPct: number (0-1),
 *     termMonths: number
 *   },
 *   status: "approved" | "review" | "denied",
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */