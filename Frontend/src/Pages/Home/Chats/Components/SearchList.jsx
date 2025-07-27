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
  const { getToken, getUser } = useContext(AuthContext);
  const currUser = getUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    (async function () {
      try {
        if (!search) {
          return;
        }
        var response = await searchUsers({
          query: search,
          page: 1,
          pageSize: 10,
          token: getToken(),
        });

        setUsers(response.data);
        setTimeout(() => {
          setLoading(false);
        }, 250);
      } catch (e) {
        setUsers([]);
        console.log(e);
      }
    })();
  }, [search, searchUsers, getToken]);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    );

  return (
    <div className="overflow-y-auto flex-1">
      {users.length !== 0 &&
        users
          ?.filter((data) => currUser.id !== data.id)
          ?.map((data) => {
            return (
              <User userName={data.userName} key={data.id} userId={data.id} />
            );
          })}
    </div>
  );
}
