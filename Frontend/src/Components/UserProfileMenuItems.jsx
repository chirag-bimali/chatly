export default function UserProfileMenuItem({ icon, label, onClick }) {
  const Icon = icon;
  return (
    <li
      className="hover:bg-gray-100 cursor-pointer flex items-center pr-6"
      onClick={onClick}
    >
      <span className="px-4 py-3 flex items-center justify-center">
        {<Icon className="h-4 w-4 fill-base-content" />}
      </span>
      <p>{label}</p>
    </li>
  );
}
