"use strict";
import MessageInputField from "./Components/MessageInputField";
import NoChatSelection from "./Components/NoChatSelection";
import ChatWindowTitle from "./Components/ChatWindowTitle";
import ChatsWindowBody from "./Components/ChatsWindowBody";
import { useContext, useEffect, useRef, useState } from "react";
import APIContext from "../../../Context/APIContext";
import AuthContext from "../../../Context/AuthContext";

import { useNavigate, useParams } from "react-router-dom";
import ForwardMessageUserList from "./Components/ForwardMessageUserList";
import AppContext from "../../../Context/AppContext";

export default function ChatsWindow() {
  const { chatId, userId } = useParams();
  const { getToken, getUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draftMode, setDraftMode] = useState(true);

  const currUser = getUser();

  const { getContact, getUserById, createContact, changeContactStatus } =
    useContext(APIContext);
  const { forwardModeOn } = useContext(AppContext);
  const [chatDetails, setChatDetails] = useState({});
  const [contactUserDetails, setContactUserDetails] = useState({});
  const messageUpdateReason = useRef("initial");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setChatDetails({});
      setDraftMode(false);
      setLoading(true);
      return;
    }
    setDraftMode(true);
    setLoading(true);
    // 1. check if the contact exists for the user
    (async function () {
      let wasContactFound = false;
      try {
        const response = await getContact({
          userId: userId,
          token: getToken(),
        });
        navigate(`/chat/${response.data.id}`);
        setDraftMode(false);
        wasContactFound = true;
      } catch (e) {
        wasContactFound = false;
      }
      try {
        if (wasContactFound) return;
        const response = await getUserById({ userId, token: getToken() });
        setContactUserDetails(response.data);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    })();

    // if yes then route to the /contactId
    // 2. if load the user
    // 3. set user details
  }, [userId, getToken, getContact, navigate, getUserById]);

  // Load Contact
  useEffect(() => {
    if (draftMode) return;
    setChatDetails({});
    if (!chatId) return;
    (async function () {
      try {
        setLoading(true);
        const response = await getContact({
          contactId: chatId,
          token: getToken(),
        });
        setChatDetails(response?.data);
        const currUser = getUser();
        setContactUserDetails(
          response?.data.userId === currUser.id
            ? response.data.contactUser
            : response.data.user
        );
        setTimeout(() => {
          setLoading(false);
        }, 100);
      } catch (e) {
        console.log(e);
        navigate("/chat");
      }
    })();
  }, [chatId, getContact, getToken, navigate, draftMode, getUser]);

  async function handleAddToContact() {
    try {
      if (!chatDetails.id) {
        // Create
        const response = await createContact({
          contactUserId: contactUserDetails.id,
          token: getToken(),
        });
        // Make Pending
        changeContactStatus({
          contactId: response.data.id,
          status: "Pending",
          token: getToken(),
        });

        setChatDetails(response.data);
        navigate(`/chat/${response.data.id}`);
        return;
      }

      // Make Accepted
      if (
        chatDetails.status === "Pending" &&
        chatDetails.actorId === contactUserDetails.id
      ) {
        const response = await changeContactStatus({
          contactId: chatDetails.id,
          status: "Accepted",
          token: getToken(),
        });
        setChatDetails(response.data);
        return;
      }
      // Make pending
      const response = await changeContactStatus({
        contactId: chatDetails.id,
        status: "Pending",
        token: getToken(),
      });
      setChatDetails(response.data);
    } catch (e) {
      console.error(e);
    }
  }
  async function handleBlock() {
    try {
      if (!chatDetails.id) {
        // Create Contact
        const response = await createContact({
          contactUserId: contactUserDetails.id,
          token: getToken(),
        });
        // Make Blocked
        changeContactStatus({
          contactId: response.data.id,
          status: "Blocked",
          token: getToken(),
        });

        setChatDetails(response.data);
        navigate(`/chat/${response.data.id}`);
        return;
      }

      // Make Blocked
      if (chatDetails.status !== "Blocked") {
        const response = await changeContactStatus({
          contactId: chatDetails.id,
          status: "Blocked",
          token: getToken(),
        });
        setChatDetails(response.data);
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return (
    !loading && (
      <>
        <ChatWindowTitle
          chatDetails={chatDetails}
          draftMode={draftMode}
          contactUserDetails={contactUserDetails}
        />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <ChatsWindowBody
            contactDetails={chatDetails}
            messages={messages}
            setMessages={setMessages}
            messageUpdateReason={messageUpdateReason}
            contactUserDetails={contactUserDetails}
          />
          {forwardModeOn && (
            <div className="absolute top-0 left-0 h-full w-full">
              <ForwardMessageUserList />
            </div>
          )}
        </div>

        <div className="relative">
          {draftMode && (
            <div className="absolute w-full bottom-full py-8">
              <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full prose prose-p:text-4xl prose-p:font-bold mb-5">
                  <p className="text-center">Say Hi 👋👋</p>
                </div>
                <div className="w-full prose prose-p:text-xs">
                  <p className="text-center">
                    Start chatting by adding user to contact
                  </p>
                </div>
                <div className="w-full flex gap-12 items-center justify-center">
                  <button
                    className="btn btn-sm btn-error btn-outline w-52"
                    onClick={(e) => handleBlock(e)}
                  >
                    Block
                  </button>
                  <button
                    className="btn btn-sm btn-accent btn-outline w-52"
                    onClick={(e) => handleAddToContact(e)}
                  >
                    Add to Contact
                  </button>
                </div>
              </div>
            </div>
          )}
          {(chatDetails?.status === "None" ||
            (chatDetails?.status === "Pending" &&
              chatDetails?.actorId !== currUser.id)) && (
            <div className="absolute w-full bottom-full py-8">
              <div className="w-full flex flex-col items-center gap-4">
                {draftMode && (
                  <div className="w-full prose prose-p:text-4xl prose-p:font-bold mb-5">
                    <p className="text-center">Say Hi 👋👋</p>
                  </div>
                )}
                <div className="w-full prose prose-p:text-xs">
                  <p className="text-center">
                    Start chatting by adding user to contact
                  </p>
                </div>
                <div className="w-full flex gap-12 items-center justify-center">
                  <button
                    className="btn btn-sm btn-error btn-outline w-52"
                    onClick={(e) => handleBlock(e)}
                  >
                    Block
                  </button>
                  <button
                    className="btn btn-sm btn-accent btn-outline w-52"
                    onClick={(e) => handleAddToContact(e)}
                  >
                    Add to Contact
                  </button>
                </div>
              </div>
            </div>
          )}

          {chatDetails?.status === "Blocked" && (
            <div className="absolute w-full bottom-full py-8">
              <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full prose prose-p:text-xs">
                  <p className="text-center">
                    {chatDetails?.actorId === contactUserDetails.id
                      ? "You have been blocked"
                      : "You blocked this contact"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <MessageInputField
            draftMode={draftMode}
            contactUserDetails={contactUserDetails}
            messages={messages}
            setMessages={setMessages}
            chatDetails={chatDetails}
            messageUpdateReason={messageUpdateReason}
          />
        </div>
      </>
    )
  );
}
