export default function ChevronUpIcon({
  className = "w-4 h-4 fill-none stroke-gray-900 stroke-2 ",
}) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 15.75l7.5-7.5 7.5 7.5"
      />
    </svg>
  );
}
