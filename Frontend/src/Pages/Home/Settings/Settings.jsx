// import DefaultUserProfile from "assets/default-user-profile.svg?react";

import DefaultUserProfile from "../../../assets/default-user-profile.svg?react";

function InputField({ legend, placeholder, message, type }) {
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
      />
    </fieldset>
  );
}
export default function Settings() {
  return (
    <div className="px-6 py-12 overflow-y-auto">
      <div className="w-8/12 mx-auto">
        <div className="prose prose-p:text-3xl prose-p:font-semibold prose-p:mb-8">
          <p>Settings</p>
        </div>
        <div className=" flex flex-col gap-8">
          <form>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Edit Profile</p>
            </div>
            <InputField
              legend="Username"
              placeholder="@username"
              type={"text"}
            />
            <InputField
              legend="Email"
              placeholder="johndoe@mail.com"
              type={"text"}
            />
            <InputField
              legend="Display Name"
              placeholder="John Doe"
              type={"text"}
            />
            <div>
              <fieldset className="w-full fieldset prose prose-p:m-0">
                <div>
                  <p className="label opacity-100 text-error"></p>
                  <lagend className="fieldset-legend text-base-content w-fit text-base font-normal pt-0">
                    Profile Picture
                  </lagend>
                </div>

                <div className="flex gap-12 items-center">
                  <div className="w-fit">
                    <DefaultUserProfile className="h-12 w-12" />
                  </div>

                  <label
                    htmlFor="profilePic"
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    Choose Profile Picture
                  </label>
                  <input type="file" className="hidden" id="profilePic" />
                </div>
              </fieldset>
            </div>

            <button className="btn rounded-xl mt-8">Save Changes</button>
          </form>
          <div>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Change Theme</p>
            </div>
            <div className="flex gap-6">
              <button className="btn btn-outline rounded-xl mt-8">
                Light Theme
              </button>
              <button className="btn btn-outline rounded-xl dark:text-base-300 mt-8">
                Dark Theme
              </button>
            </div>
          </div>
          <div>
            <div className="prose prose-p:text-lg prose-p:font-normal">
              <p>Delete Account</p>
            </div>
            <div className="flex gap-6">
              <button className="btn btn-error rounded-xl dark:text-base-300 mt-8">
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
