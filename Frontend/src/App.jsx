import "./App.css";
import Signup from "./Pages/Signup/Signup";
import Login from "./Pages/Login/Login";
import Settings from "./Pages/Home/Settings/Settings";
import Home from "./Pages/Home/Home";
import TopBar from "./Components/TopBar";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NotFound from "./Pages/NotFound";
import AuthProvider from "./Providers/AuthProvider";
import AppProvider from "./Providers/AppProvider";
import AppContext from "./Context/AppContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="bg-base max-h-dvh overflow-hidden h-dvh flex flex-col">
        <Toaster position="bottom-right" />
        <Router>
          <Routes>
            <Route
              path="/signup"
              element={
                <AppProvider>
                  <Signup />
                </AppProvider>
              }
            />
            <Route
              path="/login"
              element={
                <AppProvider>
                  <Login />
                </AppProvider>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <AppProvider>
                    <Home />
                  </AppProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
