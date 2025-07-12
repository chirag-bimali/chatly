import { useContext, useEffect, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import MessageContextMenu from "./MessageContextMenu";
import AuthContext from "../../../../Context/AuthContext";

export default function Chat({
  imgSrc,
  message,
  contactDetails,
  contactUserDetails,
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
  const contactUser = contactUserDetails;

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
        {message.senderId === currUser.id ? "" : ""}
      </div>
      <div
        className="chat-bubble bg-slate-300 text-base-content px-3"
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
        <div>
          <div
            className={`px-2 py-2 bg-slate-400 flex flex-col mb-1 ${
              message.senderId === currUser.id
                ? "rounded-r-sm border-l-4"
                : " rounded-l-sm border-r-4"
            }`}
          >
            <p className="text-xs text-slate-300 font-medium">John doe</p>
            <p className="text-xs text-slate-800">Hello this is chirag bimali</p>
          </div>
          <p className="text-sm text-slate-600">
            {message?.content ? message?.content : "Sent you a message"}
          </p>
          <div>
            <p className={`text-xs opacity-40 ${message.senderId === currUser.id ? "text-left" : "text-right"}`}>10:00 PM</p>
          </div>
        </div>
        <MessageContextMenu contextMenu={contextMenu} />
      </div>
    </div>
  );
}
