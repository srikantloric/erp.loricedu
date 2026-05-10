import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeSchoolFirebase } from "./firebaseService";

export const getFirebaseApp = async () => {
  return await initializeSchoolFirebase();
};

export const getAuthInstance = async () => {
  const { app } = await getFirebaseApp();
  return getAuth(app);
};

export const getFirestoreInstance = async () => {
  const { app, config } = await getFirebaseApp();
  // return getFirestore(app);
  console.log("Initializing database:", config.databaseId);
  return initializeFirestore(app, {}, config.databaseId || "(default)");
};

export const getStorageInstance = async () => {
  const { app } = await getFirebaseApp();
  return getStorage(app);
};
