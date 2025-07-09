import { useContext, useEffect, useRef, useState } from "react";
import Chat from "./Chat";

import MessageContextMenu from "./MessageContextMenu";
import AppContext from "../../../../Context/AppContext";
import APIContext from "../../../../Context/APIContext";
import AuthContext from "../../../../Context/AuthContext";

export default function ChatsWindowBody({ contactDetails }) {
  const chatContainerRef = useRef(null);

  const { getMessages } = useContext(APIContext);
  const { getToken, getUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loadedPage, setLoadedPage] = useState(1);
  const [pageSize, _] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [oldScrollHeight, setOldScrollHeight] = useState();

  const currUser = getUser();

  useEffect(() => {
    if (contactDetails) {
      setMessages([]);
      setLoadedPage(1);
      setLoading(true);
    }
  }, [contactDetails]);

  useEffect(() => {
    (async function () {
      try {
        const contactId = contactDetails?.id;
        const response = await getMessages({
          contactId,
          token: getToken(),
          pageSize: pageSize,
          page: loadedPage,
        });
        setTotalMessages(response.totalCount);
        if (loadedPage === 1) {
          setMessages(response.data);
        } else {
          setMessages((prev) => {
            return [...response.data, ...prev];
          });
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [contactDetails, getMessages, getToken, pageSize, loadedPage]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      if (loadedPage === 1) {
        el.scrollTop = el.scrollHeight;
      } else {
        const newScrollHeight = el.scrollHeight;
        requestAnimationFrame(() => {
          el.scrollTop = (newScrollHeight - oldScrollHeight);
        });
      }
    }
  }, [messages, loadedPage, oldScrollHeight]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    const handleScroll = async () => {
      if (
        chatContainer.scrollTop === 0 &&
        !loading &&
        messages.length < totalMessages
      ) {
        setOldScrollHeight(chatContainer.scrollHeight);
        setLoading(true);
        setLoadedPage((prev) => prev + 1);
      }
    };
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, messages, totalMessages]);

  console.log(messages);
  return (
    <div className="h-[460px] overflow-y-scroll" ref={chatContainerRef}>
      {messages.map((e) => {
        return (
          <Chat
            key={e.id}
            isLeft={e.senderId !== currUser.id}
            message={e.content}
          />
        );
      })}
    </div>
  );
}
