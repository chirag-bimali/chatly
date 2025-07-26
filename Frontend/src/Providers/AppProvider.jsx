import { useState, useEffect, useRef, useContext } from "react";
import * as signalR from "@microsoft/signalr";
import { toast } from "react-hot-toast";

import AppContext from "../Context/AppContext";
import AuthContext from "../Context/AuthContext";
import AuthenticationError from "../Exceptions/AuthenticationError";
import { useNavigate } from "react-router-dom";

let HUB_ROUTE = "http://localhost:5280/hubs";

export default function AppProvider({ children }) {
  const [globalContextMenu, setGlobalContextMenu] = useState(false);
  const [replyModeOn, setReplyModeOn] = useState(false);
  const [forwardModeOn, setForwardModeOn] = useState(false);
  const [forwardContacts, setForwardContacts] = useState([]);
  const replyIdRef = useRef(null);
  const forwardIdRef = useRef(null);
  const [latestMessage, setLatestMessage] = useState([]);
  const connectionRef = useRef(null);
  const { getToken, getUser } = useContext(AuthContext);
  const [token, setToken] = useState();
  const [currUser, setCurrUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.querySelector("html");

    if (currUser?.theme === "system" || !currUser?.theme) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)")?.matches;
      html.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      html.setAttribute("data-theme", currUser?.theme || "light");
    }
  }, [currUser?.theme]);

  useEffect(() => {
    (async function () {
      try {
        const token = getToken();
        const user = getUser();
        if (token === null || token === undefined || token.length < 10) {
          throw new AuthenticationError("User not authenticated");
        }
        setToken(token);
        setCurrUser(user);
      } catch (_) {
        _; // Handle error silently
        setCurrUser(null);
        setToken(null);
      }
    })();
  }, [getToken, getUser, navigate]);

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

  useEffect(() => {
    try {
      if (!token) {
        return;
      }
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }

      const messageHubURL = `${HUB_ROUTE}/messages`;
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(messageHubURL, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;

      connection.on("ReceiveMessage", (messageResponse) => {
        setLatestMessage([messageResponse.data]);
      });

      connection
        .start()
        .then(() => console.log("Connected to SignalR"))
        .catch((err) => console.error("SignalR Connection Error:", err));

      return () => {
        if (connectionRef.current) {
          connectionRef.current.off("ReceiveMessage");
          connectionRef.current.stop();
          connectionRef.current = null;
        }
      };
    } catch (e) {
      console.error("Error setting up SignalR connection:", e);
      toast.error("Failed to connect to the server. Please try again later.");
    }
  }, [token]);

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
        forwardContacts,
        setForwardContacts,
        latestMessage,
        setLatestMessage,
        token,
        setToken,
        currUser,
        setCurrUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
