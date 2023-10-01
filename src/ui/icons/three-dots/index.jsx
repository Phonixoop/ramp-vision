export default function ThreeDotsIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 50 173"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="25" cy="25.5" rx="23" ry="23" className="fill-atysa-800" />
      <ellipse cx="25" cy="86.5" rx="23" ry="23" className="fill-atysa-main" />
      <ellipse cx="25" cy="147.5" rx="23" ry="23" className="fill-atysa-800" />
    </svg>
  );
}
