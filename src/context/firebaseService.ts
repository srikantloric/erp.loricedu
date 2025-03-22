import { doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { dbMaster } from "../firebase";

const SCHOOL_CONFIG_KEY = "firebase_school_config"; // Local Storage Key
const SCHOOL_ID_KEY = "schoolId"; // Key for storing school ID

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Function to get Firebase Config for a school
export const getFirebaseConfig = async (schoolId: string): Promise<FirebaseConfig> => {
  // Check local storage for cached config
  const cachedConfig = localStorage.getItem(`${SCHOOL_CONFIG_KEY}_${schoolId}`);
  if (cachedConfig) {
    return JSON.parse(cachedConfig);
  }

  console.log("Fetching Firebase Config for school:", schoolId);

  try {
    // Fetch from master Firestore
    const docRef = doc(dbMaster, "schools", schoolId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const config = docSnap.data().firebaseConfig as FirebaseConfig;
      localStorage.setItem(`${SCHOOL_CONFIG_KEY}_${schoolId}`, JSON.stringify(config)); // Cache it
      return config;
    } else {
      throw new Error("Invalid School ID: No matching school found in Firestore.");
    }
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    throw new Error("Failed to fetch Firebase config. Please try again later.");
  }
};

// Get stored school ID
export const getStoredSchoolId = (): string | null => {
  return localStorage.getItem(SCHOOL_ID_KEY);
};

// Set school ID in local storage
export const setStoredSchoolId = (schoolId: string): void => {
  localStorage.setItem(SCHOOL_ID_KEY, schoolId);
};

// Initialize Firebase App for a specific school
export const initializeSchoolFirebase = async (): Promise<FirebaseApp> => {
  const schoolId = getStoredSchoolId();
  if (!schoolId) {
    throw new Error("No school selected. Please set a school ID.");
  }

  // Fetch Firebase config for school
  const firebaseConfig = await getFirebaseConfig(schoolId);

  // Check if Firebase App already exists
  const existingApp = getApps().find(app => app.name === schoolId);
  return existingApp ? existingApp : initializeApp(firebaseConfig, schoolId);
};
