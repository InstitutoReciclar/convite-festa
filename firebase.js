import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBdJV1jM2kvFzH_DIMpM5Xvcf26qPwOdxM",
  authDomain: "convite-evento-30anos.firebaseapp.com",
  projectId: "convite-evento-30anos",
  storageBucket: "convite-evento-30anos.appspot.com",
  messagingSenderId: "440872089223",
  appId: "1:440872089223:web:767d26c4ac6dd28e612a22",
  measurementId: "G-NN84T7NQX9"
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestoreDB = getFirestore(app);
const dbRealtime = getDatabase(app);

let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, firestoreDB, dbRealtime, analytics };