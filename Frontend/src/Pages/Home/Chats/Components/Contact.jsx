import { Link, useLocation } from "react-router-dom";
import DefaultUserProfile from "../../../../assets/default-user-profile.svg";
import APIContext from "../../../../Context/APIContext";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../../Context/AuthContext";
import AppContext from "../../../../Context/AppContext";
import ContactContextMenu from "./ContactContextMenu";
export default function Contact({
  contactName,
  contactId,
  lastMessageTime,
  profileImageUrl,
}) {
  let location = useLocation();
  const { getMessages } = useContext(APIContext);
  const { getToken } = useContext(AuthContext);
  const { latestMessage } = useContext(AppContext);
  const [lastMessage, setLastMessage] = useState("");

  const { globalContextMenu, setGlobalContextMenu } = useContext(AppContext);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!globalContextMenu) {
      setContextMenu({
        visible: false,
        x: 0,
        y: 0,
      });
    }
  }, [globalContextMenu]);

  useState(() => {
    (async function () {
      const response = await getMessages({
        contactId: contactId,
        token: getToken(),
        skip: 0,
        take: 1,
      });
      setLastMessage(response.data[0]?.content);
    })();
  }, [getMessages, getToken]);

  useEffect(() => {
    if (latestMessage[0]?.contactId === contactId) {
      setLastMessage(latestMessage[0]?.content);
    }
  }, [latestMessage, contactId]);

  const isActive = location.pathname === `/chat/${contactId}`;
  return (
    <div
      className="relative"
      onContextMenu={(e) => {
        if (globalContextMenu) {
          setGlobalContextMenu(false);
          return;
        }
        if (e.target.closest(".contact") !== null) {
          e.preventDefault();
          setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
          setGlobalContextMenu(true);
          e.stopPropagation();
        }
      }}
    >
      <Link
        to={`/chat/${contactId}`}
        className={`contact btn border-none dark:shadow-none h-fit w-full px-1 block rounded-xl ${
          isActive ? " bg-base-200" : " bg-base-100"
        }`}
      >
        <div className="flex items-start px-2 py-4 justify-between gap-3.5 prose prose-p:font-normal">
          <img
            src={profileImageUrl ? profileImageUrl : DefaultUserProfile}
            alt={contactName + " profile picture"}
            className="mb-0 self-center"
          />
          <div className="flex-grow">
            <div className="prose prose-p:text-base prose-p:text-neutral-950 dark:prose-p:text-neutral-50 prose-p:text-left">
              <p>{contactName ? contactName : "Nobiee Nobiee"}</p>
            </div>
            <div className="prose prose-p:text-sm prose-p:text-neutral-500 prose-p:text-left">
              <p>{lastMessage ? lastMessage : ""}</p>
            </div>
          </div>
          <div className="self-start mt-1">
            <div className="prose prose-p:text-xs prose-h1:text-right">
              <p>{lastMessageTime ? lastMessageTime : "10:00 AM"}</p>
            </div>
          </div>
        </div>
      </Link>
      <ContactContextMenu contextMenu={contextMenu} contactId={contactId} />
    </div>
  );
}
