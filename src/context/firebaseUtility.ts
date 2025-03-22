import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeSchoolFirebase } from "./firebaseService";

export const getFirebaseApp = async () => {
  return await initializeSchoolFirebase();
};

export const getAuthInstance = async () => {
  const app = await getFirebaseApp();
  return getAuth(app);
};

export const getFirestoreInstance = async () => {
  const app = await getFirebaseApp();
  return getFirestore(app);
};

export const getStorageInstance = async () => {
  const app = await getFirebaseApp();
  return getStorage(app);
};
