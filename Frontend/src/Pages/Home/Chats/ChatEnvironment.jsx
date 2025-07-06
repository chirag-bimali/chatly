import { useContext, useEffect, useState } from "react";
import Search from "../../../assets/search.svg?react";
import ChatWindow from "./ChatsWindow";
import ContactLists from "./Components/ContactLists";
import APIContext from "../../../Context/APIContext";
import AuthContext from "../../../Context/AuthContext";
import BadRequest from "../../../Exceptions/BadRequest";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import AuthenticationError from "../../../Exceptions/AuthenticationError";
import NoChatSelection from "./Components/NoChatSelection";
import SearchList from "./Components/SearchList";
export default function ChatEnvironment() {
  // only loads contact onetime
  const { getContacts } = useContext(APIContext);
  const { getToken } = useContext(AuthContext);
  const [searchMode, setSearchMode] = useState(false);
  const [contacts, setContacts] = useState();
  const [search, setSearch] = useState("");

  useEffect(() => {
    console.log(getToken());
    (async function () {
      let temp = await getContacts(1, 10, getToken());
      console.log(temp);
      setContacts();
    })();
  }, []);
  console.log(contacts);

  async function handleSearch(e) {
    if (!e.target.value) {
      setSearchMode(false);
      return;
    }
    setSearch(e.target.value);
    setSearchMode(true);
  }
  return (
    <div className="px-6 py-5 flex justify-between">
      <div className="flex flex-col min-w-80 w-full gap-8 flex-1/5 max-w-1/4">
        <div>
          <label className="input opacity-50 rounded-xl px-4 py-2 h-fit w-full space-x-0.5">
            <Search className="h-6" />
            <input
              type="search"
              required
              placeholder="Search users..."
              className="bg-transparent  text-base placeholder-base-content"
              onChange={(e) => handleSearch(e)}
            />
          </label>
        </div>
        <div className="flex-1">
          {!searchMode &&  <ContactLists />}
          {searchMode && (
            <div className="flex-1 max-h-[512px] overflow-y-auto ">
              <SearchList search={search} />
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow">
        <ChatWindow  />
      </div>
    </div>
  );
}
