import UserProfileMenuItem from "./UserProfileMenuItems";
import SettingsIcon from "../assets/settings-icon.svg?react";
import LogoutIcon from "../assets/logout-icon.svg?react";

export default function UserProfileMenu({ contextMenu }) {
  if (!contextMenu.visible) return null;

  return (
    <div
      className="absolute bg-neutral-200 rounded shadow-md z-50"
      style={{
        right: contextMenu.x,
        top: contextMenu.y,
      }}
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
