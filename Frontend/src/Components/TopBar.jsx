import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.svg?react";
import DefaultUserProfile from "../assets/default-user-profile.svg?react";
import SettingsIcon from "../assets/settings-icon.svg?react";
import LogoutIcon from "../assets/logout-icon.svg?react";
import { useState, useContext, useEffect } from "react";
import AppContext from "../Context/AppContext";
import UserProfileMenu from "./UserProfileMenu";
import AuthContext from "../Context/AuthContext";
import ProfileImage from "./ProfilePicture";

export default function TopBar({ showProfile }) {
  const { globalContextMenu, setGlobalContextMenu, currUser, API_ROUTE } =
    useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState({
    visible: false, // Should the menu be shown?
    x: 0, // X position on screen
    y: 0, // Y position on screen
  });


  useEffect(() => {
    try {
      if (!currUser) {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      navigate("/login");
    }
  }, [navigate, currUser]);

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
    !loading && (
      <div className="w-full bg-base py-3 px-10 flex justify-between">
        <Link to="/chat" className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Logo className="fill-base-content h-6" />
            <p className="text-2xl font-normal text-base-content">Chatly</p>
          </div>
        </Link>
        <div
          className={"flex items-center justify-center gap-4 cursor-pointer"}
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
                x: e.clientX,
                y: e.clientY,
              });
              setGlobalContextMenu(true);
              e.stopPropagation();
            }
          }}
        >
          <div className="rounded-full h-10 relative cursor-pointer flex items-center">
            <p>{currUser?.userName}</p>
          </div>
          <div className="relative">
            <div className="h-15 w-15 rounded-full overflow-hidden flex items-center justify-center">
              <ProfileImage
                className="h-10 w-10 rounded-full"
                userId={currUser?.id}
              />
            </div>
            <UserProfileMenu contextMenu={contextMenu} />
          </div>
        </div>
      </div>
    )
  );
}
