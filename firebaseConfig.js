import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxC8CeWWKxFdrBajdNN6yGaTGcjgXfqXo",

  authDomain: "absensi-2d172.firebaseapp.com",

  projectId: "absensi-2d172",

  storageBucket: "absensi-2d172.firebasestorage.app",

  messagingSenderId: "383881893743",

  appId: "1:383881893743:web:20ee78f91e42ceeef37a9a"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };