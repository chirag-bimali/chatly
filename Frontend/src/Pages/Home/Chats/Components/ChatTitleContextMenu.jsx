import ChatTitleContextMenuOption from "./ChatTitleContextMenuOption";

import MailOpen from "../../../../assets/mail-open.svg?react";
import Delete from "../../../../assets/delete-icon.svg?react";
import History from "../../../../assets/history.svg?react";
import Mute from "../../../../assets/mute-icon.svg?react";
import Pin from "../../../../assets/pin-icon.svg?react";
import Archive from "../../../../assets/archive-icon.svg?react";
import Window from "../../../../assets/window-icon.svg?react";
import BlockUser from "../../../../assets/block-user-icon.svg?react";
import UnBlockUser from "../../../../assets/unblock-user-icon.svg?react";
import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import APIContext from "../../../../Context/APIContext";

export default function ChatTitleContextMenu({
  contextMenu,
  contactUserDetails,
  chatDetails,
  setChatDetails,
}) {
  const elRef = useRef(null);
  const { currUser, token } = useContext(AppContext);
  const { changeContactStatus } = useContext(APIContext);
  const [width, setWindth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (elRef.current) {
      setWindth(elRef.current.offsetWidth);
      setHeight(elRef.current.offsetHeight);
    }
  }, [contextMenu]);
  if (!contextMenu.visible) return null;

  const windowWidth = window.innerWidth; // e.g. 1920 (pixels)
  const windowHeight = window.innerHeight; // e.g. 1080 (pixels)
  // If the menu goes past the right edge, move it left
  let posX = contextMenu.x;
  if (contextMenu.x + width > windowWidth) {
    posX = posX - width;
  }

  // If the menu goes past the bottom edge, move it up
  let posY = contextMenu.y;
  if (posY + height > windowHeight) {
    posY = posY - height;
  }
  console.log(posX, posY, width, height, windowWidth, windowHeight);

  return (
    <div
      ref={elRef}
      className="fixed bg-neutral-200 rounded shadow-md z-50"
      style={{ top: posY, left: posX }}
    >
      <ChatTitleContextMenuOption
        icon={Window}
        label="New Window"
        onClick={() => {
          window.open(`/chat/${chatDetails.id}`, "_blank");
        }}
      />
      <ChatTitleContextMenuOption
        icon={
          chatDetails.status !== "Blocked"
            ? BlockUser
            : chatDetails.actorId === currUser.id
            ? UnBlockUser
            : BlockUser
        }
        label={
          chatDetails.status !== "Blocked"
            ? "Block User"
            : chatDetails.actorId === currUser.id
            ? "Unblock User"
            : "Block User"
        }
        onClick={async () => {
          if (chatDetails.status !== "Blocked") {
            await changeContactStatus({
              contactId: chatDetails.id,
              status: "Blocked",
              token: token,
            });
            setChatDetails({
              ...chatDetails,
              status: "Blocked",
            });
          } else {
            await changeContactStatus({
              contactId: chatDetails.id,
              status: "None",
              token: token,
            });
            setChatDetails({
              ...chatDetails,
              status: "None",
            });
          }
        }}
        disabled={
          chatDetails.status === "Blocked" &&
          chatDetails.actorId !== currUser.id
        }
      />
    </div>
  );
}
