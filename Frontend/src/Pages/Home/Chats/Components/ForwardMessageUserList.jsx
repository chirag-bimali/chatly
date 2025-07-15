import DefaultUserProfile from "../../../../assets/default-user-profile.svg";
import Search from "../../../../assets/search.svg?react";
import ForwardMessageUser from "./ForwardMessageUser";
import CloseIcon from "../../../../assets/close-icon.svg?react";
export default function ForwardMessageUserList() {
  return (
    <div className="flex items-start justify-between gap-3.5 flex-col w-8/12 h-fit py-6 mx-auto bg-neutral-50 px-12 relative">
      <div className="flex items-center w-full gap-6">
        <label className="input opacity-50 rounded-xl px-4 py-2 h-fit w-full space-x-0.5">
          <Search className="h-6" />
          <input
            type="search"
            required
            placeholder="Search users..."
            className="bg-transparent  text-base placeholder-base-content"
            onChange={() => {}}
          />
        </label>
        <button className="btn btn-ghost rounded-full p-4 w-fit h-fit" type="reset">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <fieldset className="fieldset !flex flex-col rounded-box w-full p-4 h-fit overflow-hidden border-t rounded-none">
        <legend className="fieldset-legend px-2">Forward message</legend>
        <div className="flex gap-4 flex-col w-full h-80 overflow-y-auto pr-12">
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
          <ForwardMessageUser />
        </div>
      </fieldset>
    </div>
  );
}
