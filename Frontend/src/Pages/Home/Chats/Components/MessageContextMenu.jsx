import MessageContextMenuOption from "./MessageContextMenuOption";

import CopyIcon from "../../../../assets/copy-icon.svg?react";
import DeleteIcon from "../../../../assets/delete-icon.svg?react";
import ForwardIcon from "../../../../assets/forward-icon.svg?react";
import ReplyIcon from "../../../../assets/reply-icon.svg?react";
import AppProvider from "../../../../Providers/AppProvider";
import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../../../Context/AppContext";

export default function MessageContextMenu({ contextMenu, message }) {
  const { replyIdRef, setReplyModeOn, setForwardModeOn, forwardIdRef } =
    useContext(AppContext);
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

  if (!contextMenu.visible) return null;

  return (
    <div
      className="fixed bg-neutral-200 rounded shadow-md z-50"
      ref={elRef}
      style={{
        top: posY,
        left: posX,
      }}
    >
      <MessageContextMenuOption
        icon={ReplyIcon}
        label={"Reply"}
        onClick={(e) => {
          const el = e.target.closest(".chat");
          replyIdRef.current = el.dataset.messageId;
          setReplyModeOn(true);
        }}
      />
      <MessageContextMenuOption
        icon={CopyIcon}
        label={"Copy"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(message.content);
          } catch (e) {
            console.log(e);
          }
        }}
      />
      <MessageContextMenuOption
        icon={ForwardIcon}
        label={"Forward"}
        onClick={(e) => {
          const el = e.target.closest(".chat");
          forwardIdRef.current = el.dataset.messageId;
          setForwardModeOn(true);
        }}
      />
    </div>
  );
}
