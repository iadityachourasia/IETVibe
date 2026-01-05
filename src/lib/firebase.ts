import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBkLM97a3W6CZ91GtEBX6-4Rj9mImj-NwI",
    authDomain: "ietvibez.firebaseapp.com",
    databaseURL: "https://ietvibez-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ietvibez",
    storageBucket: "ietvibez.firebasestorage.app",
    messagingSenderId: "783967739352",
    appId: "1:783967739352:web:a03c36497afa1994af26ad",
    measurementId: "G-5PTW69FMQM"
};

// Initialize Firebase
console.log("Initializing Firebase with project:", firebaseConfig.projectId);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use initializeFirestore to allow for settings like long polling if needed
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== "undefined") {
    // Only initialize analytics on the client side
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Firebase Analytics initialization failed:", e);
    }
}

export { app, auth, db, googleProvider, analytics };
