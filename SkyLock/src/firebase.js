// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLcibdWWfUj7viJqm1UbBe2etp2JYBhDM",
  authDomain: "skylock-c920c.firebaseapp.com",
  databaseURL: "https://skylock-c920c-default-rtdb.firebaseio.com",
  projectId: "skylock-c920c",
  storageBucket: "skylock-c920c.firebasestorage.app",
  messagingSenderId: "1063832687502",
  appId: "1:1063832687502:web:f3dce9cd24373703e68adf",
  measurementId: "G-6C30D1BBCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);