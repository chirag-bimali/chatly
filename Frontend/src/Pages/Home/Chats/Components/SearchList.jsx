import NoContactDisplay from "./NoContactDisplay";
import MailOpen from "../../../../assets/mail-open.svg?react";
import Delete from "../../../../assets/delete-icon.svg?react";
import History from "../../../../assets/history.svg?react";
import Mute from "../../../../assets/mute-icon.svg?react";
import Pin from "../../../../assets/pin-icon.svg?react";
import Archive from "../../../../assets/archive-icon.svg?react";
import Window from "../../../../assets/window-icon.svg?react";
import Contact from "./Contact";
import { useContext, useEffect, useState } from "react";
import APIContext from "../../../../Context/APIContext";
import AuthContext from "../../../../Context/AuthContext";
import AuthenticationError from "../../../../Exceptions/AuthenticationError";
import User from "./User";

export default function SearchList({ search }) {
  const { searchUsers } = useContext(APIContext);
  const { getToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    (async function () {
      try {
        if (!search) {
          return;
        }
        var response = await searchUsers(search, 1, 10, getToken());

        setUsers(response.data);
      } catch (e) {
        setUsers([]);
        console.log(e);
      }
    })();
  }, [search, searchUsers, getToken]);

  return (
    <div>
      {users.length !== 0 &&
        users.map((data) => {
          return (
            <User userName={data.userName} key={data.id} userId={data.id} />
          );
        })}
    </div>
  );
}
