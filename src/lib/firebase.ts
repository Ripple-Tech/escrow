import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy2EA2h3eXhb6d3hplOfmWJvXMA8zKM1k",
  authDomain: "ripple-store.firebaseapp.com",
  projectId: "ripple-store",
  storageBucket: "ripple-store.appspot.com",
  messagingSenderId: "38049073484",
  appId: "1:38049073484:web:1656f10d54cbe2f71b27e9",
  measurementId: "G-1H1Q367ZC5"
};


// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp