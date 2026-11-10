import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableIndexedDbPersistence,
  getFirestore,
  Firestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || import.meta.env?.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || import.meta.env?.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || import.meta.env?.VITE_FIREBASE_APP_ID || ''
};

// Inicialización de Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización de Firestore con persistencia IndexedDB habilitada
let firestoreInstance: Firestore;

try {
  // Enfoque moderno recomendado en Firebase v9+ / v10+
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  // Fallback usando getFirestore y enableIndexedDbPersistence
  firestoreInstance = getFirestore(app);
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(firestoreInstance).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Persistencia de Firestore falló: Múltiples pestañas abiertas al mismo tiempo.');
      } else if (err.code === 'unimplemented') {
        console.warn('El navegador no soporta persistencia IndexedDB para Firestore.');
      } else {
        console.error('Error al inicializar la persistencia offline:', err);
      }
    });
  }
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
