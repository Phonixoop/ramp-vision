import React from "react";

function BasketIcon({ className = "w-6 h-6 stroke-[1]" }) {
  return (
    <svg viewBox="0 0 49.68 50" className={className}>
      <defs>
        <style></style>
      </defs>
      <title>Basket</title>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Basket">
          <path
            className="fill-atysa-800"
            d="M43.26 9H26.74a2.5 2.5 0 0 0 0 5h16.52a1.41 1.41 0 0 1 1.4 1.66l-3.79 18.17A1.41 1.41 0 0 1 39.48 35h-16.2a1.41 1.41 0 0 1-1.39-1.17L16.36 2a2.48 2.48 0 0 0-2.44-2H2.5A2.5 2.5 0 0 0 .08 3.12 2.56 2.56 0 0 0 2.62 5h9.26L17 34.68A6.42 6.42 0 0 0 23.28 40h16.2a6.42 6.42 0 0 0 6.32-5.32l3.79-18.18A6.42 6.42 0 0 0 43.26 9z"
          />
          <path
            className="fill-atysa-800"
            d="M36.38 23a2.5 2.5 0 0 0 0-5h-8a2.5 2.5 0 1 0 0 5z"
          />
          <g>
            <circle className="fill-atysa-800" cx="24.38" cy="46.5" r="3.5" />
            <circle className="fill-atysa-800" cx="38.38" cy="46.5" r="3.5" />
            <path
              className="fill-atysa-main"
              d="M36.88 28.5a2.5 2.5 0 0 0-2.5-2.5h-5a2.5 2.5 0 1 0 0 5h5a2.5 2.5 0 0 0 2.5-2.5z"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export default BasketIcon;
