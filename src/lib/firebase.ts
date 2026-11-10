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

// Acceso seguro a variables de Vite sin ReferenceError por process
const getEnvVar = (viteKey: string, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyDemoRestaurantMockKeyForLocalDev123'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'restaurant-app-demo.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'restaurant-app-demo'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'restaurant-app-demo.appspot.com'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789012'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:123456789012:web:abcdef1234567890')
};

// Inicialización de Firebase App segura
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización de Firestore con persistencia IndexedDB habilitada y manejo de fallbacks
let firestoreInstance: Firestore;

try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  firestoreInstance = getFirestore(app);
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(firestoreInstance).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Persistencia de Firestore: Múltiples pestañas abiertas.');
      } else if (err.code === 'unimplemented') {
        console.warn('Persistencia IndexedDB no soportada en este entorno.');
      } else {
        console.warn('Aviso de persistencia offline:', err);
      }
    });
  }
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
