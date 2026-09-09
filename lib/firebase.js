// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4-_ta3AalCyLLOmdQX5SO-jLS2QLnFVc",
  authDomain: "self-management-alfathan.firebaseapp.com",
  projectId: "self-management-alfathan",
  storageBucket: "self-management-alfathan.firebasestorage.app",
  messagingSenderId: "885807752187",
  appId: "1:885807752187:web:516338e7ab9b03aebc615e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);