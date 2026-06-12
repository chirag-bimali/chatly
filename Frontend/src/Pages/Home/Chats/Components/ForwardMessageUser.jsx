import { useContext, useState } from "react";
import AuthContext from "../../../../Context/AuthContext";
import AppContext from "../../../../Context/AppContext";
import ProfileImage from "../../../../Components/ProfilePicture";
export default function ForwardMessageUser({ contact }) {
  const { getUser } = useContext(AuthContext);
  const { setForwardContacts } = useContext(AppContext);
  const currUser = getUser();
  const [isChecked, setIsChecked] = useState(false);

  const contactUserDetails =
    contact?.userId === currUser.id ? contact?.contactUser : contact?.user;

  async function handleSelect() {
    if (isChecked) {
      setForwardContacts((prev) => prev.filter((id) => id !== contact.id));
      setIsChecked(false);
    } else {
      setForwardContacts((prev) => {
        return [...prev, contact.id];
      });
      setIsChecked(true);
    }
  }

  return (
    <label className="label flex justify-between items-start">
      <div className="flex gap-4">
        <div className="h-6 w-6">
          <ProfileImage
            userId={contactUserDetails?.id}
            className={"w-full h-full"}
          />
        </div>
        <div className="grow">
          <div className="">
            <p className="text-base-content text-sm font-medium">
              {contactUserDetails.displayName}
            </p>
          </div>
        </div>
      </div>
      <input
        type="checkbox"
        className="checkbox"
        checked={isChecked}
        onChange={() => handleSelect()}
        value={contact?.id}
      />
    </label>
  );
}
