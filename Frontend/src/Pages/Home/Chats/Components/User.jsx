import { Link } from "react-router-dom";
import DefaultUserProfile from "../../../../assets/default-user-profile.svg";
export default function User({ userName, userId }) {
  const lastMessage = "Hello";
  const lastMessageTime = "10:10";
  const profileImageUrl = "";

  // lastMessage,
  // lastMessageTime,
  // profileImageUrl,

  // check does contact exits
  // if yes -> route to that chat
  // if no -> ...
  return (
    <Link
      to={`/chat/draft/${userId}`}
      className={`contact btn border-none dark:shadow-none h-fit w-full px-1 block rounded-xl `}
    >
      <div className="flex items-start px-2 py-4 justify-between gap-3.5 prose prose-p:font-normal">
        <img
          src={profileImageUrl ? profileImageUrl : DefaultUserProfile}
          alt={userName + " profile picture"}
          className="mb-0 self-center"
        />
        <div className="flex-grow">
          <div className="prose prose-p:text-base prose-p:text-neutral-950 dark:prose-p:text-neutral-50 prose-p:text-left">
            <p>{userName ? userName : "Noobie"}</p>
          </div>
          <div className="prose prose-p:text-sm prose-p:text-neutral-500 prose-p:text-left">
            <p>{lastMessage ? lastMessage : "Message"}</p>
          </div>
        </div>
        <div className="self-start mt-1">
          <div className="prose prose-p:text-xs prose-h1:text-right">
            <p>{lastMessageTime ? lastMessageTime : "10:00 AM"}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
