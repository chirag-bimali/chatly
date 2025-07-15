import { useContext, useEffect, useState } from "react";
import Search from "../../../assets/search.svg?react";
import ChatWindow from "./ChatsWindow";
import ContactLists from "./Components/ContactLists";
import APIContext from "../../../Context/APIContext";
import AuthContext from "../../../Context/AuthContext";
import BadRequest from "../../../Exceptions/BadRequest";
import { Route, Routes } from "react-router-dom";
import AuthenticationError from "../../../Exceptions/AuthenticationError";
import NoChatSelection from "./Components/NoChatSelection";
import SearchList from "./Components/SearchList";
export default function ChatEnvironment() {
  // only loads contact onetime
  const [searchMode, setSearchMode] = useState(false);
  const [search, setSearch] = useState("");


  async function handleSearch(e) {
    if (!e.target.value) {
      setSearchMode(false);
      return;
    }
    setSearch(e.target.value);
    setSearchMode(true);
  }
  return (
    <div className="px-6 py-5 pb-0 flex justify-between flex-1 overflow-hidden">
      <div className="flex flex-col min-w-80 w-full gap-8 max-w-sm">
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
        {!searchMode && <ContactLists />}
        {searchMode && (
          // <div className="flex-1 max-h-[512px]">
          <SearchList search={search} />
          // </div>
        )}
      </div>
      <div className="flex flex-col px-6 flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
