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

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <div className="bg-base max-h-dvh overflow-hidden h-dvh flex flex-col">
          <Router>
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
