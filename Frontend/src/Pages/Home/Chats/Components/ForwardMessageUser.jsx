import DefaultUserProfile from "../../../../assets/default-user-profile.svg";
export default function ForwardMessageUser() {
  return (
    <label className="label flex justify-between items-start">
      <div className="flex gap-4">
        <img
          src={DefaultUserProfile}
          alt={" profile picture"}
          className="m-0"
        />
        <div className="flex-grow">
          <div className="prose prose-p:text-base prose-p:text-neutral-950 dark:prose-p:text-neutral-50 prose-p:text-left">
            <p>Chirag Bimali</p>
          </div>
        </div>
      </div>
      <input type="checkbox" defaultChecked className="checkbox" />
    </label>
  );
}
