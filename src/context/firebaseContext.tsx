import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { CircularProgress, Box, Typography } from "@mui/material";
import { getAuthInstance, getFirestoreInstance, getStorageInstance } from "./firebaseUtility";

interface FirebaseContextType {
  db: any;
  auth: any;
  storage: any;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  console.log("FirebaseProvider called...");

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getFirestoreInstance(), getAuthInstance(), getStorageInstance()])
      .then(([dbInstance, authInstance, storageInstance]) => {
        setDb(dbInstance);
        setAuth(authInstance);
        setStorage(storageInstance);
      })
      .catch((error) => console.error("Error initializing Firebase:", error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="body1" mt={2}>Initializing Firebase...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <FirebaseContext.Provider value={{ db, auth, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
