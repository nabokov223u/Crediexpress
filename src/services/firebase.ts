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

export interface DataConsentRecord {
  idNumber?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  acceptedAt: Timestamp;
  policyUrl: string;
  status: 'approved';
  source?: string;
  userAgent?: string;
}

/**
 * Guarda una nueva aplicación de prequalificación en Firestore
 */
export async function savePrequalificationToFirebase(
  formData: FormData,
  result: PrequalificationResult
): Promise<string> {
  try {
    const applicationData: Omit<FirestoreApplication, 'id'> & {
      dataConsentApproved: boolean;
      dataConsentAcceptedAt: Timestamp;
      policyUrl: string;
    } = {
      ...formData,
      status: result.status,
      dataConsentApproved: true,
      dataConsentAcceptedAt: Timestamp.now(),
      policyUrl: 'https://www.originarsa.com/politicas',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'applications'), applicationData);
    
    return docRef.id;
  } catch (error) {
    throw new Error('No se pudo guardar la aplicación en la base de datos');
  }
}

/**
 * Guarda el registro de aprobación de uso de datos en Firestore (colección 'data_consents')
 */
export async function saveDataConsentToFirebase(data: {
  idNumber?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  source?: string;
}): Promise<string | null> {
  try {
    const consentRecord: DataConsentRecord = {
      idNumber: data.idNumber || '',
      fullName: data.fullName || '',
      phone: data.phone || '',
      email: data.email || '',
      acceptedAt: Timestamp.now(),
      policyUrl: 'https://www.originarsa.com/politicas',
      status: 'approved',
      source: data.source || 'Step1Identity',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    const docRef = await addDoc(collection(db, 'data_consents'), consentRecord);
    console.log('✅ Aprobación de uso de datos guardada en Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('⚠️ Error guardando la aprobación de uso de datos en Firebase:', error);
    return null;
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
  } catch (error) {
    throw new Error('No se pudo actualizar el estado de la aplicación');
  }
}

/**
 * Estructura de datos que se guarda en Firestore:
 * 
 * Collection: 'applications'
 * Collection: 'data_consents'
 */