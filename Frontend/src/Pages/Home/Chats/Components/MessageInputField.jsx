import { useContext, useState } from "react";
import AppContext from "../../../../Context/AppContext";
import APIContext from "../../../../Context/APIContext";
import AuthContext from "../../../../Context/AuthContext";

export default function MessageInputField({
  contactId,
  setMessages,
  messageUpdateReason,
}) {
  const { sendMessage } = useContext(APIContext);
  const { getToken } = useContext(AuthContext);
  const [chatContent, setChatContent] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await sendMessage({
        contactId,
        content: chatContent,
        token: getToken(),
      });
      setMessages((prev) => [...prev, response.data]);
      setChatContent("");
      messageUpdateReason.current = "new";
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="px-24">
        <div className="join w-full bg-neutral-100 rounded-xl items-center px-2 py-1">
          <div className="w-full">
            <label className="input bg-transparent focus:outline-0 focus-within:shadow-none focus:shadow-none  border-0 focus-within:outline-0 validator join-item w-full">
              <input
                type="text"
                placeholder="Type a message..."
                name="message-content"
                required
                value={chatContent}
                onChange={(e) => setChatContent(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
          <button className="btn btn-primary min-w-[5.25rem] h-fit w-fit join-item text-sm items-center justify-center rounded-full py-1.5 px-4">
            <span className="self-center text-sm font-normal max-h-min">
              Send
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
