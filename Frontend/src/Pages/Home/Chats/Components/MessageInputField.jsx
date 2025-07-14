import { useContext, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import APIContext from "../../../../Context/APIContext";
import AuthContext from "../../../../Context/AuthContext";
import CloseIcon from "../../../../assets/close-icon.svg?react";

export default function MessageInputField({
  chatDetails,
  messages,
  setMessages,
  contactUserDetails,
  messageUpdateReason,
  draftMode,
}) {
  const { replyModeOn, setReplyModeOn, replyIdRef } = useContext(AppContext);
  const { sendMessage } = useContext(APIContext);
  const { getToken, getUser } = useContext(AuthContext);
  const [chatContent, setChatContent] = useState("");
  const contactId = chatDetails.id;
  const currUser = getUser();

  const disable =
    draftMode ||
    chatDetails?.status === "Blocked" ||
    (chatDetails?.status === "Pending" &&
      contactUserDetails.id === chatDetails.actorId);

  async function handleSubmit(e) {
    if (disable) return;
    e.preventDefault();
    try {
      const response = await sendMessage({
        contactId,
        replyMessageId: replyModeOn ? replyIdRef.current : null,
        content: chatContent,
        token: getToken(),
      });
      console.log(response);
      setMessages((prev) => [...prev, response.data]);
      setChatContent("");
      if (replyModeOn) setReplyModeOn(false);
      messageUpdateReason.current = "new";
    } catch (e) {
      console.error(e);
    }
  }

  const replyMessage = messages.find((m) => m.id === replyIdRef.current);
  const replyUser =
    replyMessage?.senderId === currUser.id ? currUser : contactUserDetails;

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="px-24 h-fit">
        <div className="w-full  bg-neutral-100 rounded-xl items-center px-2 py-1 relative">
          {/* Reply Message Area */}
          {replyModeOn && (
            <div className="w-full z-30 bg-slate-600 px-4 py-2 rounded-xl rounded-b-none">
              <div className="mb-2 flex  justify-between items-center">
                <p className="text-xs text-slate-300">Replying to</p>
                <button
                  className="btn btn-ghost p-1 w-fit h-fit rounded-full text-slate-300 hover:text-slate-800"
                  type="reset"
                  onClick={() => {
                    setReplyModeOn(false);
                    replyIdRef.current = "";
                  }}
                >
                  <CloseIcon className="h-6 w-6 " />
                </button>
              </div>
              <div className="bg-slate-400 px-4 py-2 rounded-sm border-l-4 rounded-l-none rounded-b-none w-fit">
                <p className="text-xs text-slate-300 font-medium mb-2">
                  {replyUser.displayName}
                </p>
                <p className="text-xs text-slate-800">{replyMessage.content}</p>
              </div>
            </div>
          )}
          <div className="flex mt-1">
            <div className="w-full">
              <label className="input bg-transparent focus:outline-0 focus-within:shadow-none focus:shadow-none  border-0 focus-within:outline-0 validator join-item w-full">
                <input
                  type="text"
                  placeholder="Type a message..."
                  name="message-content"
                  required
                  value={chatContent}
                  disabled={disable}
                  onChange={(e) => setChatContent(e.target.value)}
                  autoComplete="off"
                />
              </label>
            </div>
            <button
              className={`btn btn-primary min-w-[5.25rem] h-fit w-fit join-item text-sm items-center justify-center rounded-full py-1.5 px-4`}
              disabled={disable}
            >
              <span className="self-center text-sm font-normal max-h-min">
                Send
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
