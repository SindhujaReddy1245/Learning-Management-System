
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGfQLXi4cPxnaSy05WI6QnQXzi0fnHREo",
  authDomain: "lms-oauth-e5f0a.firebaseapp.com",
  projectId: "lms-oauth-e5f0a",
  storageBucket: "lms-oauth-e5f0a.firebasestorage.app",
  messagingSenderId: "1077071483290",
  appId: "1:1077071483290:web:c966e32a060e8dfd782a23"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

export { auth, db, provider };
