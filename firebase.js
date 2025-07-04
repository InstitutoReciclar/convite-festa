// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // aqui é realtime database
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBdJV1jM2kvFzH_DIMpM5Xvcf26qPwOdxM",
  authDomain: "convite-evento-30anos.firebaseapp.com",
  projectId: "convite-evento-30anos",
  storageBucket: "convite-evento-30anos.appspot.com",
  messagingSenderId: "440872089223",
  appId: "1:440872089223:web:767d26c4ac6dd28e612a22",
  measurementId: "G-NN84T7NQX9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // <- aqui, database realtime
const analytics = getAnalytics(app);

export { db, analytics };
