import { useContext, useEffect, useState } from "react";
import Search from "../../../../assets/search.svg?react";
import TrippleDots from "../../../../assets/tripple-dots.svg?react";
import { formatDistanceToNow, parseISO } from "date-fns";
import AuthContext from "../../../../Context/AuthContext";
import AppContext from "../../../../Context/AppContext";
import ChatTitleContextMenu from "./ChatTitleContextMenu";

export default function ChatWindowTitle({ contactUserDetails, chatDetails, setChatDetails }) {
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

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="prose prose-p:text-4xl prose-p:mb-3 prose-p:font-semibold">
          <p>{contactUserDetails?.displayName}</p>
        </div>
        <div className="prose prose-p:text-sm prose-p:text-neutral-400">
          <p>
            {formatDistanceToNow(parseISO(contactUserDetails.lastSeen), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <div className="flex gap-4 self-start">
        <button className="btn shadow-none border-none w-fit h-fit p-2.5 bg-neutral-100 rounded-full">
          <Search className="h-5 w-5" />
        </button>
        <div
          className="relative h-fit w-fit"
          id="context-menu-button"
          onClick={(e) => {
            console.log("Context Menu clicked");
            e.preventDefault();
            if (globalContextMenu) {
              setGlobalContextMenu(false);
              return;
            }
            if (e.target.closest("#context-menu-button") !== null) {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
              setGlobalContextMenu(true);
              e.stopPropagation();
            }
          }}
        >
          <button className="btn relative shadow-none border-none w-fit h-fit p-2.5 bg-neutral-100 rounded-full">
            <TrippleDots className="h-5 w-5 fill-base-content" />
          </button>
          <ChatTitleContextMenu
            contactUserDetails={contactUserDetails}
            chatDetails={chatDetails}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            setChatDetails={setChatDetails}
          />
        </div>
      </div>
    </div>
  );
}
