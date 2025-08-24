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
        "hover:bg-base-200 cursor-pointer flex items-center pr-6 bg-base-100 " +
        (disabled ? " opacity-50 cursor-not-allowed" : "")
      }
      disabled={disabled}
      onClick={disabled ? null : onClick}
    >
      <span className="px-4 py-3 flex items-center justify-center fill-base-content">
        {<Icon className="h-4 w-4" />}
      </span>
      <p>{label}</p>
    </li>
  );
}
