export default function EditIcon({
  className = "w-4 h-4 fill-none stroke-gray-900 stroke-2 ",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        className="stroke-atysa-700"
        d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"
      ></path>
      <polygon
        className="stroke-atysa-main"
        points="18 2 22 6 12 16 8 16 8 12 18 2"
      ></polygon>
    </svg>
  );
}
