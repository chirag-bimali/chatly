import MailOpen from "../../../../assets/mail-open.svg?react";
import Delete from "../../../../assets/delete-icon.svg?react";
import History from "../../../../assets/history.svg?react";
import Mute from "../../../../assets/mute-icon.svg?react";
import Pin from "../../../../assets/pin-icon.svg?react";
import Archive from "../../../../assets/archive-icon.svg?react";
import Window from "../../../../assets/window-icon.svg?react";

import ContactContextMenuOption from "./ContactContextMenuOption";

export default function ContactContextMenu({ contextMenu, contactId }) {
  if (!contextMenu.visible) {
    return null;
  }

  return (
    <div
      className="fixed bg-neutral-200 rounded shadow-md z-50"
      style={{ top: contextMenu.y, left: contextMenu.x }}
    >
      <ul>
        <ContactContextMenuOption
          icon={Window}
          label={"Open in new tab"}
          onClick={() => {
            window.open(`/chat/${contactId}`, "_blank");
            console.log("Hello")
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
          onClick={() => {}}
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
