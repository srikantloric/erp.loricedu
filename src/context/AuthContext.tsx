import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "./firebaseContext";
import { Permissions } from "types/Users";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  displayName: string | null;
  role: string | null;
  permissions: Permissions | null;
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
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
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
            setRole(data.role || null);
            setPermissions(data.permissions || []);
            setDisplayName(data.name || user.email || "User");
          } else {
            setRole(null);
            setPermissions(null);
          }
        } catch (error) {
          setRole(null);
          setPermissions(null);
        }
      } else {
        setCurrentUser(null);
        setRole(null);
        setPermissions(null);
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const value = { currentUser, login, role, permissions, displayName };

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