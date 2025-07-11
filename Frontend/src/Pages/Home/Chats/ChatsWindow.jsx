"use strict";
import MessageInputField from "./Components/MessageInputField";
import NoChatSelection from "./Components/NoChatSelection";
import ChatWindowTitle from "./Components/ChatWindowTitle";
import ChatsWindowBody from "./Components/ChatsWindowBody";
import { useContext, useEffect, useRef, useState } from "react";
import APIContext from "../../../Context/APIContext";
import AuthContext from "../../../Context/AuthContext";

import { useNavigate, useParams } from "react-router-dom";

export default function ChatsWindow() {
  const { chatId, userId } = useParams();
  const { getToken, getUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draftMode, setDraftMode] = useState(true);

  const { getContact, getUserById, createContact, blockUser } =
    useContext(APIContext);
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
    if (!draftMode) return;

    try {
      let response = await createContact({
        contactUserId: contactUserDetails.id,
        token: getToken(),
      });
      console.log(response.data);
      navigate(`/chat/${response.data.id}`);
    } catch (e) {
      console.error(e);
    }
  }
  async function handleBlock() {
    try {
      if (chatDetails.id) {
        const blockResponse = await blockUser({
          contactId: chatDetails.id,
          token: getToken(),
        });
        console.log(blockResponse);
        //
      } else {
        // create contact
        console.log(contactUserDetails);
        var createResponse = await createContact({
          contactUserId: contactUserDetails.id,
          token: getToken(),
        });
        setChatDetails(createResponse.data);

        const blockResponse = await blockUser({
          contactId: createResponse.data.id,
          token: getToken(),
        });
        console.log(blockResponse);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return (
    !loading && (
      <div className="h-full w-[926px]">
        <div className="flex flex-col px-6 h-full gap-6">
          <ChatWindowTitle
            chatDetails={chatDetails}
            draftMode={draftMode}
            contactUserDetails={contactUserDetails}
          />
          <div className="flex-grow h-full">
            <ChatsWindowBody
              contactDetails={chatDetails}
              messages={messages}
              setMessages={setMessages}
              messageUpdateReason={messageUpdateReason}
              contactUserDetails={contactUserDetails}
            />
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
            {chatDetails.status === "Blocked" && (
              <div className="absolute w-full bottom-full py-8">
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full prose prose-p:text-xs">
                    <p className="text-center">You are blocked.</p>
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
        </div>
      </div>
    )
  );
}
