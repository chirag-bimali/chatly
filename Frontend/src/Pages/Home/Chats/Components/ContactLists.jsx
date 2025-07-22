import NoContactDisplay from "./NoContactDisplay";
import MailOpen from "../../../../assets/mail-open.svg?react";
import Delete from "../../../../assets/delete-icon.svg?react";
import History from "../../../../assets/history.svg?react";
import Mute from "../../../../assets/mute-icon.svg?react";
import Pin from "../../../../assets/pin-icon.svg?react";
import Archive from "../../../../assets/archive-icon.svg?react";
import Window from "../../../../assets/window-icon.svg?react";
import Contact from "./Contact";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import APIContext from "../../../../Context/APIContext";
import AuthContext from "../../../../Context/AuthContext";
import AuthenticationError from "../../../../Exceptions/AuthenticationError";
import ContactContextMenu from "./ContactContextMenu";
import AppContext from "../../../../Context/AppContext";

export default function ContactLists() {
  const { getContacts } = useContext(APIContext);
  const { globalContextMenu, setGlobalContextMenu } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [currUser, setCurrUser] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const { getToken, getUser } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!globalContextMenu) {
      setContextMenu({
        visible: false,
        x: 0,
        y: 0,
      });
    }
  }, [globalContextMenu]);

  useEffect(() => {
    (async function () {
      try {
        let response = await getContacts({
          page: 1,
          pageSize: 10000,
          token: getToken(),
        });
        setContacts(response.data);
        setLoading(false);
        setCurrUser(getUser());
      } catch (e) {
        if (e instanceof AuthenticationError) {
          navigate("/login");
        }
        setLoading(false);
      }
    })();
  }, [getContacts, getToken, navigate]);

  const containerRef = useRef(null);
  if (contacts?.length === 0 && !loading) return <NoContactDisplay />;
  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    );

  return (
    !loading && (
      <div
        className="overflow-y-auto flex-1"
        ref={containerRef}
        onContextMenu={(e) => {
          if (globalContextMenu) {
            setGlobalContextMenu(false);
            return;
          }
          e.preventDefault();
          if (e.target.closest(".contact") !== null) {
            setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
            setGlobalContextMenu(true);
            e.stopPropagation();
          }
        }}
      >
        {contacts.map((data) => {
          let contactUser;
          if (data.contactId == currUser.id) {
            contactUser = data.user;
          } else contactUser = data.contactUser;

          return (
            <Contact
              isActive={true}
              key={data.id}
              contactId={data.id}
              contactName={contactUser.displayName}
            />
          );
        })}

        <ContactContextMenu contextMenu={contextMenu} />
      </div>
    )
  );
}
