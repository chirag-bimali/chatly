import { Link } from "react-router-dom";
import Logo from "../assets/logo.svg?react";
import DefaultUserProfile from "../assets/default-user-profile.svg?react";
import SettingsIcon from "../assets/settings-icon.svg?react";
import LogoutIcon from "../assets/logout-icon.svg?react";
import { useState, useContext, useEffect, useRef } from "react";
import AppContext from "../Context/AppContext";
import UserProfileMenu from "./UserProfileMenu";

export default function TopBar({ showProfile }) {
  const { globalContextMenu, setGlobalContextMenu } = useContext(AppContext);
  const [contextMenu, setContextMenu] = useState({
    visible: false, // Should the menu be shown?
    x: 0, // X position on screen
    y: 0, // Y position on screen
  });
  const profileBtnRef = useRef(null);
  useEffect(() => {
    if (!globalContextMenu) {
      setContextMenu({
        visible: false, // Should the menu be shown?
        x: 0, // X position on screen
        y: 0, // Y position on screen
      });
    }
  }, [globalContextMenu]);


  return (
    <div className="w-full bg-base py-3 px-10 flex justify-between">
      <Link to="/chat" className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Logo className="fill-base-content h-6" />
          <p className="text-2xl font-normal text-base-content">Chatly</p>
        </div>
      </Link>
      <div
        className={"rounded-full bg-black h-10 relative cursor-pointer"}
        id="profile-btn"
        onClick={(e) => {
          e.preventDefault();
          if (globalContextMenu) {
            setGlobalContextMenu(false);
            return;
          }
          if (e.target.closest("#profile-btn") !== null) {
            setContextMenu({
              visible: true,
              x: Math.min(window.innerWidth - profileBtnRef.right, 0),
              y: e.clientY,
            });
            setGlobalContextMenu(true);
            e.stopPropagation();
          }
        }}
      >
        <DefaultUserProfile className={showProfile ? "block" : "hidden"} />
        <ul className="text-sm w-fit">
          <UserProfileMenu contextMenu={contextMenu} />
        </ul>
      </div>
    </div>
  );
}
