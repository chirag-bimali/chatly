import { useContext, useState } from "react";
import DefaultUserProfile from "../../../assets/default-user-profile.svg?react";
import AuthContext from "../../../Context/AuthContext";
import AppContext from "../../../Context/AppContext";
import APIContext from "../../../Context/APIContext";
import { toast } from "react-hot-toast";
import ProfileImage from "../../../Components/ProfilePicture";
import { useNavigate } from "react-router-dom";

function InputField({
  legend,
  placeholder,
  message,
  type,
  value,
  onChange,
  required,
}) {
  return (
    <fieldset className="fieldset w-fit prose prose-p:m-0">
      <div>
        <p className="label opacity-100 text-error">{message ? message : ""}</p>
        <legend className="fieldset-legend text-base-content text-base font-normal pt-0">
          {legend}
        </legend>
      </div>
      <input
        type={type}
        className="input input-content input-lg rounded-xl text-base bg-transparent dark:text-content w-80"
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange}
        autoComplete="off"
      />
    </fieldset>
  );
}
export default function Settings() {
  const navigate = useNavigate();
  const { saveUser, saveToken } = useContext(AuthContext);
  const {
    changeName,
    changeProfilePic,
    changeEmail,
    changePassword,
    deleteAccount,
    API_ROUTE,
  } = useContext(APIContext);
  const { token, currUser, setCurrUser, setToken } = useContext(AppContext);

  const [newUserName, setNewUserName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  const [newUserNameError, setNewUserNameError] = useState("");

  const handleEditProfile = async (e) => {
    try {
      e.preventDefault();
      setNewUserNameError("");

      if (!newUserName && !newDisplayName && !newProfilePic) {
        return;
      }
      if (
        newUserName !== currUser.userName ||
        newDisplayName !== currUser.displayName
      ) {
        const response = await changeName({
          userName:
            newUserName !== currUser.userName && newUserName
              ? newUserName
              : null,
          displayName:
            newDisplayName !== currUser.displayName && newDisplayName
              ? newDisplayName
              : null,
          token,
        });
        saveUser(response.data);
        setCurrUser(response.data);
        toast.success("Names updated successfully");
        setNewUserName("");
        setNewDisplayName("");
      }

      if (newProfilePic) {
        console.log(newProfilePic);
        const response = await changeProfilePic({
          image: newProfilePic,
          token,
        });
        toast.success(
          response?.message || "Profile Picture updated successfully"
        );
        setNewProfilePic(null);
      }
    } catch (e) {
      if (e?.response?.status === 409) {
        setNewUserNameError(e?.response?.data?.message);
        toast.error(e?.response?.data?.message);
        return;
      }
      toast.error("Error!");
    }
  };
  const handleEmailChange = async (e) => {
    console.log("Email change initiated");
    try {
      e.preventDefault();
      if (!newEmail || !password) {
        toast.error("Email and Password are required");
        return;
      }
      await changeEmail({
        newEmail: newEmail,
        password,
        token,
      });
      saveUser({ ...currUser, email: newEmail });
      setCurrUser((prev) => ({ ...prev, email: newEmail }));
      setNewUserName("");
      setNewEmail("");
      setPassword("");
      toast.success("Email updated successfully");
    } catch (e) {
      if (e?.response?.status === 409) {
        toast.error(e?.response?.data?.message);
        return;
      }
      if (e?.response?.status === 401) {
        toast.error(e?.response?.data?.message);
        return;
      }
      toast.error("Something went wrong");
    }
  };

  const handlePasswordChange = async (e) => {
    try {
      e.preventDefault();
      if (!newPassword || !oldPassword) {
        toast.error("New Password and Old Password are required");
        return;
      }
      // Call API to change password
      // Assuming changePassword is a function in APIContext
      const response = await changePassword({
        newPassword,
        oldPassword,
        token,
      });
      toast.success("Password updated successfully");
      setNewPassword("");
      setOldPassword("");
    } catch (e) {
      if (e?.response?.status === 409) {
        toast.error(e?.response?.data?.message);
        return;
      }
      if (e?.response?.status === 401) {
        console.error(e);
        toast.error(e?.response?.data?.message);
        return;
      }

      toast.error("Something went wrong");
    }
  };

  return (
    <div className="px-6 py-12 overflow-y-auto">
      <div className="w-8/12 mx-auto">
        <div className="prose prose-p:text-3xl prose-p:font-semibold prose-p:mb-8">
          <p>Settings</p>
        </div>
        <div className=" flex flex-col gap-8">
          <form className="border-b pb-6 w-fit" onSubmit={handleEditProfile}>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Edit Profile</p>
            </div>
            <InputField
              legend="Username"
              placeholder={`@${currUser?.userName || "username"}`}
              type={"text"}
              value={newUserName}
              setValue={setNewUserName}
              onChange={(e) => {
                setNewUserName(e.target.value);
                if (e.target.value.length < 3) {
                  setNewUserNameError(
                    "Username must be at least 3 characters long"
                  );
                } else {
                  setNewUserNameError("");
                }
              }}
              message={newUserNameError}
            />
            <InputField
              legend="Display Name"
              placeholder={currUser?.displayName || "John Doe"}
              type={"text"}
              value={newDisplayName}
              onChange={(e) => {
                setNewDisplayName(e.target.value);
              }}
            />

            <div>
              <fieldset className="w-full fieldset prose prose-p:m-0">
                <div>
                  <p className="label opacity-100 text-error"></p>
                  <legend className="fieldset-legend text-base-content w-fit text-base font-normal pt-0">
                    Profile Picture
                  </legend>
                </div>

                <div className="flex gap-12 items-center">
                  <div className="border-4 border-base-300 rounded-full h-15 w-15 flex items-center justify-center">
                    <ProfileImage
                      className="h-15 w-15 rounded-full"
                      userId={currUser?.id}
                      uploadedImage={newProfilePic}
                    />
                  </div>

                  <label
                    htmlFor="profilePic"
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    Choose Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profilePic"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewProfilePic(file);
                      }
                    }}
                  />
                </div>
              </fieldset>
            </div>

            <button className="btn rounded-xl mt-8">Save Changes</button>
          </form>

          <form className="border-b pb-6 w-fit" onSubmit={handleEmailChange}>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Change Email</p>
            </div>
            <InputField
              legend="Email"
              placeholder={currUser?.email || "you@example.com"}
              type={"email"}
              required={true}
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
              }}
              // message={newEmailError}
            />
            <InputField
              legend="Password"
              placeholder="••••••••"
              type={"password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <button className="btn rounded-xl mt-8">Change Email</button>
          </form>

          <form className="border-b pb-6 w-fit" onSubmit={handlePasswordChange}>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Change Password</p>
            </div>
            <InputField
              legend="New Password"
              placeholder="••••••••"
              type={"password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
            <InputField
              legend="Password"
              placeholder="••••••••"
              type={"password"}
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
              }}
            />
            <button className="btn rounded-xl mt-8">Change Password</button>
          </form>

          <div>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Change Theme</p>
            </div>
            <div className="flex gap-6">
              <button
                data-theme="system"
                className="btn btn-outline rounded-xl mt-8"
                onClick={async () => {
                  await changeName({
                    themeName: "system",
                    token: token,
                  });
                  saveUser({ ...currUser, theme: "system"});
                  setCurrUser((prev) => ({ ...prev, theme: "system" }));
                  toast.success("Theme changed to System");
                }}
              >
                System
              </button>
              <button
                data-theme="light"
                className="btn btn-outline rounded-xl mt-8"
                onClick={async () => {
                  await changeName({
                    themeName: "light",
                    token: token,
                  });
                  saveUser({ ...currUser, theme: "light"});
                  setCurrUser((prev) => ({ ...prev, theme: "light" }));
                  toast.success("Theme changed to Light");
                }}
              >
                Light Theme
              </button>
              <button
                data-theme="dark"
                onClick={async () => {
                  await changeName({
                    themeName: "dark",
                    token: token,
                  });
                  saveUser({ ...currUser, theme: "dark"});
                  setCurrUser((prev) => ({ ...prev, theme: "dark" }));
                  toast.success("Theme changed to Dark");
                }}
                className="btn btn-outline rounded-xl dark:text-base-300 mt-8"
              >
                Dark Theme
              </button>
            </div>
          </div>
          <div>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Delete Account</p>
            </div>
            <div className="flex gap-6">
              <button
                className="btn btn-error rounded-xl dark:text-base-300 mt-8"
                onClick={async () => {
                  // Handle account deletion logic here
                  try {
                    await deleteAccount({ token });

                    setCurrUser(null);
                    setToken(null);

                    saveUser(null);
                    saveToken(null);
                    toast.success("Account deleted successfully");
                    navigate("/login", { replace: true });
                  } catch (e) {
                    console.error(e);
                    if (e?.response?.status === 401) {
                      toast.error(
                        "You are not authorized to delete the account"
                      );
                      return;
                    }
                    toast.error("Error deleting account");
                  }
                }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
