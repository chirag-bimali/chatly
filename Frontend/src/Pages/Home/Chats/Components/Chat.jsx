import { useContext, useEffect, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import MessageContextMenu from "./MessageContextMenu";
import AuthContext from "../../../../Context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function Chat({ imgSrc, message }) {
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

  return (
    <div
      className={`chat ${
        message.senderId === currUser.id ? "chat-end" : "chat-start"
      }`}
      data-message-id={message.id}
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
          {/* Reply Message Area */}
          {message?.replyMessage?.id && (
            <div
              className={`px-2 py-2 bg-slate-400 flex flex-col mb-1 ${
                message.senderId === currUser.id
                  ? "rounded-r-sm border-l-4"
                  : " rounded-l-sm border-r-4"
              }`}
            >
              <p className="text-xs text-slate-300 font-medium">
                {message?.replyMessage?.previousSender?.displayName}
              </p>
              <p className="text-xs text-slate-800">
                {message?.replyMessage?.previousContent}
              </p>
            </div>
          )}
          
          {/* If message is forwarded */}
          {message?.forwardMessage?.id && (
            <p className="text-xs text-slate-500 font-medium mb-1">
              ⏩ Forwarded
            </p>
          )}

          {/* message content */}
          <p className="text-sm text-slate-600 mb-2">{message?.content}</p>

          {/* forward sub content */}
          {message?.forwardMessage?.id &&
            message?.forwardMessage?.subContent && (
              <div
                className={`px-2 py-2 bg-slate-400 flex flex-col mb-1 ${
                  message.senderId === currUser.id
                    ? "rounded-r-sm border-l-4"
                    : " rounded-l-sm border-r-4"
                }`}
              >
                <p className="text-sm">{message?.forwardMessage?.subContent}</p>
              </div>
            )}
          <div>
            <p
              className={`text-xs opacity-40 ${
                message.senderId === currUser.id ? "text-left" : "text-right"
              }`}
            >
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <MessageContextMenu contextMenu={contextMenu} />
      </div>
    </div>
  );
}
