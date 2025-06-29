import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "./firebaseContext";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  userType: string | null;
  displayName: string| null; 
  role: string | null;
  access: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string|null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [access, setAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //Get Firebase DB instance
  const { db } = useFirebase();

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
      if (user) {

        setCurrentUser(user);
        // Fetch additional user info from Firestore (or your DB)
        try {
          const userDoc = await getDoc(doc(db, "ADMIN_USERS", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserType(data.userType || null);
            setRole(data.role || null);
            setAccess(data.access || []);
            setDisplayName(data.displayName || user.email || "User");
          } else {
            setUserType(null);
            setRole(null);
            setAccess([]);
          }
        } catch (error) {
          setUserType(null);
          setRole(null);
          setAccess([]);
        }
      } else {
        setCurrentUser(null);
        setUserType(null);
        setRole(null);
        setAccess([]);
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const value = { currentUser, login, userType, role, access,displayName };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <Backdrop
          sx={{ bgcolor: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;