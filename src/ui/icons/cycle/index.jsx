<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1rem"
  height="1rem"
  fill="var(--sf-accent-main)"
  viewBox="0 0 16 16"
></svg>;

export default function CycleIcon({
  className = "w-[1.15rem] h-[1.15rem] fill-[#676A70]",
}) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.667 14.001a.667.667 0 01-.59.662L6 14.668H2.667a.667.667 0 01-.078-1.33l.078-.004H4.14L2.885 11.93C1.6 10.577 1.064 8.632 1.463 6.774c.401-1.863 1.688-3.386 3.415-4.029a.667.667 0 11.465 1.25c-1.295.482-2.27 1.635-2.576 3.06-.295 1.37.07 2.8.977 3.838l.121.133 1.468 1.642v-2c0-.342.258-.624.59-.663L6 10.001c.342 0 .624.257.662.589l.005.078V14zm7.87-4.773c-.401 1.863-1.688 3.386-3.415 4.029a.667.667 0 01-.465-1.25c1.295-.482 2.27-1.636 2.576-3.06.295-1.37-.07-2.8-.977-3.838l-.121-.133-1.468-1.644v2.002a.667.667 0 01-.59.662L10 6.001a.667.667 0 01-.662-.589l-.005-.078V2.001c0-.342.258-.624.59-.662L10 1.334h3.333a.667.667 0 01.078 1.33l-.078.004h-1.472l1.254 1.404c1.287 1.353 1.821 3.297 1.422 5.156z"
      ></path>
    </svg>
  );
}
