export default function ContactContextMenuOption({ icon, label, onClick }) {
  const Icon = icon;
  return (
    <li
      className="hover:bg-base-100 bg-base-200 cursor-pointer flex items-center pr-6"
      onClick={onClick}
    >
      <span className="px-4 py-3 flex items-center justify-center fill-base-content">
        {<Icon className="h-4 w-4" />}
      </span>
      <p className="text-base-content">{label}</p>
    </li>
  );
}
