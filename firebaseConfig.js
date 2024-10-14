import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCVVvxl_z3CGOtdeVn6ULQBLo4R_55udgw",
    authDomain: "habit-tracker-3f2b9.firebaseapp.com",
    projectId: "habit-tracker-3f2b9",
    storageBucket: "habit-tracker-3f2b9.appspot.com",
    messagingSenderId: "504631443256",
    appId: "1:504631443256:web:2e1fcaa7b2c9320bb50bcd"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
