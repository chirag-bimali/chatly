import UserProfileMenuItem from "./UserProfileMenuItems";
import SettingsIcon from "../assets/settings-icon.svg?react";
import LogoutIcon from "../assets/logout-icon.svg?react";
import { useEffect, useRef, useState } from "react";

export default function UserProfileMenu({ contextMenu }) {
  const menuRef = useRef(null);
  const [width, setWindth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (menuRef.current) {
      setWindth(menuRef.current.offsetWidth);
      setHeight(menuRef.current.offsetHeight);
    }
  }, [contextMenu]);
  if (!contextMenu.visible) return null;

  const windowWidth = window.innerWidth; // e.g. 1920 (pixels)
  const windowHeight = window.innerHeight; // e.g. 1080 (pixels)
  // If the menu goes past the right edge, move it left
  let posX = contextMenu.x;
  if (contextMenu.x + width > windowWidth) {
    posX = posX - width;
  }

  // If the menu goes past the bottom edge, move it up
  let posY = contextMenu.y;
  if (posY + height > windowHeight) {
    posY = posY - height;
  }

  console.log(contextMenu);
  return (
    <div
      className="fixed bg-neutral-200 rounded shadow-md z-50"
      id="context-menu"
      style={{
        left: posX,
        top: posY,
      }}
      ref={menuRef}
    >
      <UserProfileMenuItem
        icon={SettingsIcon}
        label={"Setting"}
        onClick={() => {}}
        data={{ route: "/settings" }}
      />
      <UserProfileMenuItem
        icon={LogoutIcon}
        label={"Logout"}
        onClick={() => {}}
        data={{ route: "/login" }}
      />
    </div>
  );
}
