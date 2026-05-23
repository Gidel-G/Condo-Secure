import React from "react";

export function CitylineFooter() {
  return (
    <div className="w-full relative overflow-hidden h-[120px] md:h-[150px] select-none pointer-events-none mt-auto">
      <svg 
        className="w-full h-full absolute bottom-0 left-0" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Repeating City Skyline Pattern */}
          <pattern 
            id="cityline-pattern" 
            width="238" 
            height="150" 
            patternUnits="userSpaceOnUse"
          >
            {/* Tall Purple House */}
            {/* Left Roof half (slightly lighter shade or same theme color) */}
            <path d="M 0 50 L 45 15 L 45 50 Z" fill="#1d0a45" opacity="0.95" />
            {/* Right Roof half (darker corporate shade) */}
            <path d="M 45 15 L 90 50 L 45 50 Z" fill="#13062E" />
            {/* Purple Body */}
            <rect x="0" y="50" width="90" height="100" fill="#13062E" />
            
            {/* Purple House Windows */}
            {/* Top Round Window */}
            <circle cx="45" cy="35" r="7.5" fill="#FFFFFF" />
            {/* Windows Left Column */}
            <rect x="15" y="62" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            <rect x="15" y="82" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            <rect x="15" y="102" width="12" height="12" rx="1.5" fill="#FFFFFF" opacity="0.2" /> {/* Subtle window dark variant like in image */}
            <rect x="15" y="122" width="12" height="12" rx="1.5" fill="#FFFFFF" />

            {/* Windows Center Column (Top 3, bottom is door) */}
            <rect x="39" y="62" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            <rect x="39" y="82" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            <rect x="39" y="102" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            {/* Door */}
            <rect x="36" y="122" width="18" height="28" rx="2" fill="#FFFFFF" />

            {/* Windows Right Column */}
            <rect x="63" y="62" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            <rect x="63" y="82" width="12" height="12" rx="1.5" fill="#FFFFFF" opacity="0.3" /> {/* Dark window */}
            <rect x="63" y="102" width="12" height="12" rx="1.5" fill="#FFFFFF" />
            <rect x="63" y="122" width="12" height="12" rx="1.5" fill="#FFFFFF" opacity="0.1" /> {/* Dark window */}

            {/* Medium Grey Building */}
            <rect x="90" y="75" width="46" height="75" fill="#E2E2E9" />
            {/* Windows (1 column, 3 rows, color matched to dark purple) */}
            <rect x="108" y="88" width="10" height="10" rx="1" fill="#13062E" />
            <rect x="108" y="108" width="10" height="10" rx="1" fill="#13062E" />
            <rect x="108" y="128" width="10" height="10" rx="1" fill="#13062E" />

            {/* White Building with Gable Roof */}
            {/* Roof */}
            <path d="M 136 75 L 159 50 L 182 75 Z" fill="#FFFFFF" />
            {/* Body */}
            <rect x="136" y="75" width="46" height="75" fill="#FFFFFF" />
            {/* Circle Window */}
            <circle cx="159" cy="65" r="5" fill="#13062E" />
            {/* Windows (1 column, 3 rows, color matched) */}
            <rect x="154" y="88" width="10" height="10" rx="1" fill="#13062E" />
            <rect x="154" y="108" width="10" height="10" rx="1" fill="#13062E" />
            <rect x="154" y="128" width="10" height="10" rx="1" fill="#13062E" />

            {/* Lower Grey Building */}
            <rect x="182" y="93" width="56" height="57" fill="#E2E2E9" />
            {/* Windows (1 column, 2 rows) */}
            <rect x="205" y="105" width="10" height="10" rx="1" fill="#13062E" />
            <rect x="205" y="123" width="10" height="10" rx="1" fill="#13062E" />
          </pattern>
        </defs>
        
        {/* Draw the repeating pattern */}
        <rect width="100%" height="150" fill="url(#cityline-pattern)" />
      </svg>
    </div>
  );
}
