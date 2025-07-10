"use strict";
import MessageInputField from "./Components/MessageInputField";
import NoChatSelection from "./Components/NoChatSelection";
import ChatWindowTitle from "./Components/ChatWindowTitle";
import ChatsWindowBody from "./Components/ChatsWindowBody";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import APIContext from "../../../Context/APIContext";
import AuthContext from "../../../Context/AuthContext";

import { useNavigate, useParams } from "react-router-dom";

export default function ChatsWindow() {
  const { chatId } = useParams();
  const { getToken, getUser } = useContext(AuthContext);
  const currUser = useMemo(() => getUser(), [getUser]);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  const { getContact } = useContext(APIContext);
  const [chatDetails, setChatDetails] = useState({});
  const [contactUser, setContactUser] = useState({});
  const messageUpdateReason = useRef("initial");
  const navigate = useNavigate();

  // Load Contact
  useEffect(() => {
    (async function () {
      try {
        const response = await getContact({
          contactId: chatId,
          token: getToken(),
        });
        setChatDetails(response?.data);
      } catch (e) {
        console.log(e);
        navigate("/chat");
      }
    })();
  }, [chatId, getContact, getToken, navigate]);

  // Set Chat User
  useEffect(() => {
    if (Object.keys(chatDetails).length === 0) {
      return;
    }
    const user = chatDetails?.user;
    const chatUser = chatDetails?.contactUser;
    if (!chatUser || !user) return;

    if (user.id === currUser.id) {
      setContactUser(chatUser);
    } else if (chatUser.id === currUser.id) {
      setContactUser(user);
    } else {
      setContactUser({});
    }
    setLoading(false);
  }, [chatDetails, currUser]);

  if (!chatId) return null;
  if (!chatDetails) return null;

  return (
    !loading && (
      <div className="h-full w-[926px]">
        <div className="flex flex-col px-6 h-full gap-6">
          <ChatWindowTitle contactUser={contactUser} />
          <div className="flex-grow h-full">
            <ChatsWindowBody
              contactDetails={chatDetails}
              messages={messages}
              setMessages={setMessages}
              messageUpdateReason={messageUpdateReason}
            />
          </div>
          <MessageInputField
            messages={messages}
            setMessages={setMessages}
            contactId={chatId}
            messageUpdateReason={messageUpdateReason}
          />
        </div>
      </div>
    )
  );
}
