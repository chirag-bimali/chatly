import MailOpen from "../../../../assets/mail-open.svg?react";
import Delete from "../../../../assets/delete-icon.svg?react";
import History from "../../../../assets/history.svg?react";
import Mute from "../../../../assets/mute-icon.svg?react";
import Pin from "../../../../assets/pin-icon.svg?react";
import Archive from "../../../../assets/archive-icon.svg?react";
import Window from "../../../../assets/window-icon.svg?react";

import ContactContextMenuOption from "./ContactContextMenuOption";
import { useEffect, useRef, useState } from "react";

export default function ContactContextMenu({ contextMenu, contactId }) {
  const elRef = useRef(null);
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

  if (!contextMenu.visible) {
    return null;
  }

  return (
    <div
      ref={elRef}
      className="fixed bg-neutral-200 rounded shadow-md z-50"
      style={{ top: posY, left: posX }}
    >
      <ul>
        <ContactContextMenuOption
          icon={Window}
          label={"Open in new tab"}
          onClick={() => {
            window.open(`/chat/${contactId}`, "_blank");
            console.log("Hello");
          }}
        />
        <ContactContextMenuOption
          icon={Archive}
          label={"Archive"}
          onClick={() => {}}
        />
        <ContactContextMenuOption icon={Pin} label={"Pin"} onClick={() => {}} />
        <ContactContextMenuOption
          icon={MailOpen}
          label={"Mark as read"}
          onClick={() => {}}
        />
        <ContactContextMenuOption
          icon={History}
          label={"Clear History"}
          onClick={(e) => {

          }}
        />
        <ContactContextMenuOption
          icon={Delete}
          label={"Delete chat"}
          onClick={() => {}}
        />
      </ul>
    </div>
  );
}
