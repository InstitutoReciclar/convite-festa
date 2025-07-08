// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configurações do Firebase (visíveis apenas em frontend público)
const firebaseConfig = {
  apiKey: "AIzaSyBdJV1jM2kvFzH_DIMpM5Xvcf26qPwOdxM",
  authDomain: "convite-evento-30anos.firebaseapp.com",
  projectId: "convite-evento-30anos",
  storageBucket: "convite-evento-30anos.appspot.com",
  messagingSenderId: "440872089223",
  appId: "1:440872089223:web:767d26c4ac6dd28e612a22",
  measurementId: "G-NN84T7NQX9",
};

// Inicialização principal
const app = initializeApp(firebaseConfig);

// Serviços principais
const auth = getAuth(app);
const firestore = getFirestore(app);
const dbRealtime = getDatabase(app);

// Analytics (só ativa se suportado)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Exportações organizadas
export {
  app,
  auth,
  firestore,
  dbRealtime,
  analytics,
  firebaseConfig, // opcional, útil em testes
};

// Caso queira usar ref, update, off em vários lugares:
export { ref, update, off } from "firebase/database";
