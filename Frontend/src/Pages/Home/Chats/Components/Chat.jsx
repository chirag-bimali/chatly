import { useContext, useEffect, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import MessageContextMenu from "./MessageContextMenu";

export default function Chat({ isLeft, imgSrc, name, message }) {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
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
  return (
    <div className={`chat ${isLeft ? "chat-start" : "chat-end"}`}>
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
        {name ? name : "Noobie"}
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
        {message ? message : "Sent you a message"}
        <MessageContextMenu contextMenu={contextMenu} />
      </div>
    </div>
  );
}
