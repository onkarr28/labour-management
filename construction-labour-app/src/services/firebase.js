import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBU5FBvJl_WkYIlKm7zyJ2FBMi1ntAt-t4',
  authDomain: 'labour-management-e3795.firebaseapp.com',
  projectId: 'labour-management-e3795',
  storageBucket: 'labour-management-e3795.firebasestorage.app',
  messagingSenderId: '137692656080',
  appId: '1:137692656080:web:be6d03ed2cf621432c49d5',
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
