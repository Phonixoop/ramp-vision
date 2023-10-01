export default function CategoryIcon({
  className = "w-4 h-4 ",
  stroke = "stroke-atysa-main",
  fill = "fill-atysa-main",
}) {
  return (
    <svg className={className} viewBox="0 0 19 20">
      <g className={`fill-none  ${stroke}`} id="Icons" fillRule="evenodd">
        <g id="Rounded" transform="translate(-614.000000, -3124.000000)">
          <g id="Maps" transform="translate(100.000000, 3068.000000)">
            <g
              id="-Round-/-Maps-/-category"
              transform="translate(511.000000, 54.000000)"
            >
              <g>
                <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                <path
                  d="M11.15,3.4 C11.54,2.76 12.46,2.76 12.85,3.4 L16.56,9.48 C16.97,10.14 16.49,11 15.71,11 L8.28,11 C7.5,11 7.02,10.14 7.43,9.48 L11.15,3.4 Z M17.5,22 C15.0147186,22 13,19.9852814 13,17.5 C13,15.0147186 15.0147186,13 17.5,13 C19.9852814,13 22,15.0147186 22,17.5 C22,19.9852814 19.9852814,22 17.5,22 Z M4,21.5 C3.45,21.5 3,21.05 3,20.5 L3,14.5 C3,13.95 3.45,13.5 4,13.5 L10,13.5 C10.55,13.5 11,13.95 11,14.5 L11,20.5 C11,21.05 10.55,21.5 10,21.5 L4,21.5 Z"
                  id="🔹-Icon-Color"
                  className={fill}
                ></path>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
