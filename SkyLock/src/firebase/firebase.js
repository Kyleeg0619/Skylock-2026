import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

export const googleProvider = new GoogleAuthProvider();

const firebaseConfig = {
  apiKey: "AIzaSyBbCO0Vdozr82Hf5ux52NB18Vv1HBJu8I4",
  authDomain: "skylock-c920c.firebaseapp.com",
  databaseURL: "https://skylock-c920c-default-rtdb.firebaseio.com",
  projectId: "skylock-c920c",
  storageBucket: "skylock-c920c.firebasestorage.app",
  messagingSenderId: "1063832687502",
  appId: "1:1063832687502:web:f3dce9cd24373703e68adf",
  measurementId: "G-6C30D1BBCE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);