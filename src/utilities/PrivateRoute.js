import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate} from "react-router-dom";


  export default function PrivateRoute({children}) {
    const { currentUser } = useAuth()
    console.log(currentUser)

    if (!currentUser) {
      return <Navigate to="/login"/>
    }
    return children
  }

