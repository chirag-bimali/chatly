import { useState } from "react";
import AppContext from "../Context/AppContext";

export default function AppProvider({ children }) {
  const [globalContextMenu, setGlobalContextMenu] = useState(false);

  window.addEventListener("click", () => {
    if (globalContextMenu) setGlobalContextMenu(false);
  });
  window.addEventListener("contextmenu", (e) => {
    if (globalContextMenu) {
      setGlobalContextMenu(false);
      e.preventDefault();
    }
  });
  return (
    <AppContext.Provider value={{ globalContextMenu, setGlobalContextMenu }}>
      {children}
    </AppContext.Provider>
  );
}
