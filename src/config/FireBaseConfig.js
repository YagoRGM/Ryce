import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAE8lnhZTfbjzcdaUyxrGLZN1rDmffM6_c",
  authDomain: "ryce-dacaf.firebaseapp.com",
  projectId: "ryce-dacaf",
  storageBucket: "ryce-dacaf.appspot.com", // 🛠️ corrigido o .app
  messagingSenderId: "1001839867872",
  appId: "1:1001839867872:web:8e2076f1ed189c39f15d85"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
