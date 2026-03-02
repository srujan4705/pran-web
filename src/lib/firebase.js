import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = { 
  apiKey: "AIzaSyC1d5eRlrl1dJEQaOjL24W3BLfQ7eyBrmE", 
  authDomain: "pran-2a3cf.firebaseapp.com", 
  projectId: "pran-2a3cf", 
  storageBucket: "pran-2a3cf.firebasestorage.app", 
  messagingSenderId: "572737688476", 
  appId: "1:572737688476:web:ad9dfa3832f59911ceae59", 
  measurementId: "G-HJC02Y87YG" 
}; 

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
