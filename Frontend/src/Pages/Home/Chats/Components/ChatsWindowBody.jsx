import { useContext, useEffect, useRef, useState } from "react";
import Chat from "./Chat";

import MessageContextMenu from "./MessageContextMenu";
import AppContext from "../../../../Context/AppContext";
import APIContext from "../../../../Context/APIContext";
import AuthContext from "../../../../Context/AuthContext";

export default function ChatsWindowBody({
  contactDetails,
  messages,
  setMessages,
  messageUpdateReason,
}) {
  const chatContainerRef = useRef(null);

  const { getMessages } = useContext(APIContext);
  const { getToken, getUser } = useContext(AuthContext);
  const [skip, setSkip] = useState(0);
  const [pageSize, _] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevScrollTopRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  const currUser = getUser();

  useEffect(() => {
    if (contactDetails) {
      setMessages([]);
      setSkip(0);
      setLoading(true);
    }
  }, [contactDetails, setMessages]);

  useEffect(() => {
    (async function () {
      try {
        const contactId = contactDetails?.id;
        const response = await getMessages({
          contactId,
          token: getToken(),
          skip: skip,
          take: pageSize,
        });
        setTotalMessages(response.totalCount);
        if (skip < pageSize) {
          setMessages(response.data);
          messageUpdateReason.current = "initial";
        } else {
          setTimeout(() => {
            setMessages((prev) => {
              return [...response.data, ...prev];
            });
          }, 0);
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [
    contactDetails,
    getMessages,
    getToken,
    pageSize,
    setMessages,
    skip,
    messageUpdateReason,
  ]);

  useEffect(() => {
    const el = chatContainerRef.current;

    if (el && !loading) {
      if (messageUpdateReason.current === "initial") {
        setTimeout(() => {
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
          });
        }, 100);
      } else if (messageUpdateReason.current === "pagination") {
        requestAnimationFrame(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeightRef.current;
        });
      } else if (messageUpdateReason.current === "new") {
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight;
          requestAnimationFrame(() => {
            el.scrollTop = newScrollHeight;
          });
        }, 0);
      }
    }
  }, [messageUpdateReason, messages, loading]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    const handleScroll = async () => {
      if (
        chatContainer.scrollTop === 0 &&
        !loading &&
        messages.length < totalMessages
      ) {
        setLoading(true);
        setSkip((prev) => prev + pageSize);
        prevScrollTopRef.current = chatContainer.scrollTop;
        prevScrollHeightRef.current = chatContainer.scrollHeight;
        messageUpdateReason.current = "pagination";
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
  }, [loading, messages, totalMessages, pageSize, messageUpdateReason]);

  return (
    <div className="h-[460px] overflow-y-scroll" ref={chatContainerRef}>
      {messages.map((e) => {
        return (
          <Chat
            key={e.id}
            isLeft={e.senderId !== currUser.id}
            contactDetails={contactDetails}
            message={e}
          />
        );
      })}
    </div>
  );
}
