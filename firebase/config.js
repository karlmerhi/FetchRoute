import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

// Note: Replace with your actual Firebase configuration
// This would come from your Firebase console after creating a project
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase if it hasn't been initialized yet
const initializeFirebase = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

// Initialize app
const app = initializeFirebase();

// Enable offline persistence for Firestore
firestore().settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  persistence: true, // Enable offline persistence
});

// Export Firebase services
export { app, auth, firestore, functions };

export default { app, auth, firestore, functions };
