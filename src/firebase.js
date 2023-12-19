import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA8QjupYlk6oxX5J5lo0JDADFSzg-HRp7k",
    authDomain: "threadhub-52c0c.firebaseapp.com",
    projectId: "threadhub-52c0c",
    storageBucket: "threadhub-52c0c.appspot.com",
    messagingSenderId: "690699982073",
    appId: "1:690699982073:web:93b3ef33d246070015be28"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };