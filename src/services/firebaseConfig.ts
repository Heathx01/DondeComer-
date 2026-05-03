import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// REEMPLAZA ESTO con tu configuración de Firebase Console
// Ve a Project Settings > General > Your Apps > Config
const firebaseConfig = {
  apiKey: "AIzaSyD0SqlrbZ4XziHpIhNdzMSgqkhjJTafCVk",
  authDomain: "dondecomerapp-c3f91.firebaseapp.com",
  projectId: "dondecomerapp-c3f91",
  storageBucket: "dondecomerapp-c3f91.firebasestorage.app",
  messagingSenderId: "1094558136993",
  appId: "1:1094558136993:web:3ae77e9e58e0820ff70ee0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
