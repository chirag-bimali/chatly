export default function ChatTitleContextMenuOption({
  icon,
  label,
  onClick,
  disabled,
}) {
  const Icon = icon;
  return (
    <li
      className={
        "hover:bg-gray-100 cursor-pointer flex items-center pr-6 " +
        (disabled ? " opacity-50 cursor-not-allowed" : "")
      }
      disabled={disabled}
      onClick={disabled ? null : onClick}
    >
      <span className="px-4 py-3 flex items-center justify-center">
        {<Icon className="h-4 w-4" />}
      </span>
      <p>{label}</p>
    </li>
  );
}
