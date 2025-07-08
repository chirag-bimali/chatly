import { useContext, useEffect, useRef, useState } from "react";
import Chat from "./Chat";

import MessageContextMenu from "./MessageContextMenu";
import AppContext from "../../../../Context/AppContext";

export default function ChatsWindowBody() {
  const containerRef = useRef(null);

  // reset context menu if set to globel is true

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  return (
    <div className="h-[460px] overflow-y-scroll" ref={containerRef}>
      <Chat isLeft={true} message={"Hello man!😒"} />
    </div>
  );
}
