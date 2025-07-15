import { useState, useEffect, useRef } from "react";
import AppContext from "../Context/AppContext";

export default function AppProvider({ children }) {
  const [globalContextMenu, setGlobalContextMenu] = useState(false);
  const [replyModeOn, setReplyModeOn] = useState(false);
  const [forwardModeOn, setForwardModeOn] = useState(false);
  const replyIdRef = useRef(null);
  const forwardIdRef = useRef(null);

  useEffect(() => {
    const handleClick = () => {
      if (globalContextMenu) setGlobalContextMenu(false);
    };

    const handleContextMenu = (e) => {
      if (globalContextMenu) {
        setGlobalContextMenu(false);
        e.preventDefault();
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("contextmenu", handleContextMenu);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [globalContextMenu]);

  return (
    <AppContext.Provider
      value={{
        globalContextMenu,
        setGlobalContextMenu,
        replyModeOn,
        setReplyModeOn,
        replyIdRef,
        forwardModeOn,
        setForwardModeOn,
        forwardIdRef,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
