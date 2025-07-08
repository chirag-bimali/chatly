import MessageContextMenuOption from "./MessageContextMenuOption";

import CopyIcon from "../../../../assets/copy-icon.svg?react";
import DeleteIcon from "../../../../assets/delete-icon.svg?react";
import ForwardIcon from "../../../../assets/forward-icon.svg?react";
import ReplyIcon from "../../../../assets/reply-icon.svg?react";

export default function MessageContextMenu({ contextMenu }) {
  if (!contextMenu.visible) return null;

  return (
    <div
      className="fixed bg-neutral-200 rounded shadow-md z-50"
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
      }}
    >
      <MessageContextMenuOption
        icon={ReplyIcon}
        label={"Reply"}
        onClick={() => {}}
      />
      <MessageContextMenuOption
        icon={CopyIcon}
        label={"Copy"}
        onClick={() => {}}
      />
      <MessageContextMenuOption
        icon={ForwardIcon}
        label={"Forward"}
        onClick={() => {}}
      />
      <MessageContextMenuOption
        icon={DeleteIcon}
        label={"Delete"}
        onClick={() => {}}
      />
    </div>
  );
}
