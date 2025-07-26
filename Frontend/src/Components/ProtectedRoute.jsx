import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthContext from "../Context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { getToken, getUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if token and user exist
        const token = getToken();
        const user = getUser();
        
        // If both exist, user is authenticated
        if (token && user) {
          return;
        }
      } catch (error) {
        // If getToken or getUser throw an error, user is not authenticated
        console.log("Authentication check failed:", error.message);
        
        // Show toast message
        toast.error("Please login to continue");
        
        // Redirect to login
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [getToken, getUser, navigate]);

  // If we reach here without being redirected, user is authenticated
  return children;
}
