import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase App
const appMaster = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(appMaster);
export const dbMaster = getFirestore(appMaster);
export const storageRef = ref(getStorage(appMaster));
export const remoteConfig = getRemoteConfig(appMaster);

export default appMaster;
