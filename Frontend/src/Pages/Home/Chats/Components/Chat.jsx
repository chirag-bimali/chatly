import { useContext, useEffect, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import MessageContextMenu from "./MessageContextMenu";
import AuthContext from "../../../../Context/AuthContext";

export default function Chat({
  isLeft,
  imgSrc,
  name,
  message,
  contactDetails,
}) {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const { getUser } = useContext(AuthContext);
  const { globalContextMenu, setGlobalContextMenu } = useContext(AppContext);
  useEffect(() => {
    if (!globalContextMenu) {
      setContextMenu({
        visible: false,
        x: 0,
        y: 0,
      });
    }
  }, [globalContextMenu]);
  const currUser = getUser();
  const contactUser =
    contactDetails?.user.id === currUser.id
      ? contactDetails.contactUser
      : contactDetails.user;
  console.log(currUser);
  console.log(contactUser);
  console.log(message.senderId, currUser.id);
  console.log(message.senderId === currUser.id);
  console.log("-------------------------------");

  return (
    <div
      className={`chat ${
        message.senderId === currUser.id ? "chat-end" : "chat-start"
      }`}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src={
              imgSrc
                ? imgSrc
                : "https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
            }
          />
        </div>
      </div>
      <div className="chat-header text-neutral-400">
        {message.senderId === currUser.id
          ? currUser.displayName
          : contactUser.displayName}
      </div>
      <div
        className="chat-bubble"
        onContextMenu={(e) => {
          if (globalContextMenu) {
            setGlobalContextMenu(false);
            return;
          }
          if (e.target.closest(".chat-bubble") !== null) {
            e.preventDefault();
            setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
            setGlobalContextMenu(true);
            e.stopPropagation();
          }
        }}
      >
        {message?.content ? message?.content : "Sent you a message"}
        <MessageContextMenu contextMenu={contextMenu} />
      </div>
    </div>
  );
}
