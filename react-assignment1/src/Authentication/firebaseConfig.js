// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0F79GNYeMp5cVar88b1kJfklC82yFH4E",
  authDomain: "sms-haggle.firebaseapp.com",
  projectId: "sms-haggle",
  storageBucket: "sms-haggle.appspot.com",
  messagingSenderId: "921076413137",
  appId: "1:921076413137:web:1424fd62fe27e82b128bf0",
  measurementId: "G-8V8EY3S8ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth };