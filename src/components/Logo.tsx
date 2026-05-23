import React from "react";
import { cn } from "@/src/lib/utils";

interface LogoProps {
  variant?: "horizontal" | "vertical" | "iconOnly";
  className?: string;
  iconSize?: number;
}

export function Logo({ variant = "horizontal", className, iconSize = 40 }: LogoProps) {
  // SVG component representing the shield and the 3 buildings
  const LogoIcon = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* External Shield */}
      <path 
        d="M35 30 C35 30 120 22 205 30 C220 31 222 125 222 135 C222 185 150 222 120 228 C90 222 18 185 18 135 C18 125 20 31 35 30 Z" 
        stroke="#13062E" 
        strokeWidth="18" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Left Building */}
      <rect x="52" y="90" width="31" height="60" rx="3" fill="#13062E" />
      {/* Left Building Windows (2 cols, 3 rows) */}
      <rect x="58" y="96" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="70" y="96" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="58" y="112" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="70" y="112" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="58" y="128" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="70" y="128" width="7" height="7" rx="1" fill="#FFFFFF" />

      {/* Middle Building (Taller) */}
      <rect x="91" y="65" width="41" height="85" rx="3" fill="#13062E" />
      {/* Middle Building Windows (2 cols, 4 rows) */}
      <rect x="99" y="73" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="113" y="73" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="99" y="91" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="113" y="91" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="99" y="109" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="113" y="109" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="99" y="127" width="9" height="9" rx="1.5" fill="#FFFFFF" />
      <rect x="113" y="127" width="9" height="9" rx="1.5" fill="#FFFFFF" />

      {/* Right Building */}
      <rect x="140" y="90" width="31" height="60" rx="3" fill="#13062E" />
      {/* Right Building Windows (2 cols, 3 rows) */}
      <rect x="146" y="96" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="158" y="96" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="146" y="112" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="158" y="112" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="146" y="128" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="158" y="128" width="7" height="7" rx="1" fill="#FFFFFF" />
    </svg>
  );

  if (variant === "iconOnly") {
    return <LogoIcon />;
  }

  return (
    <div className={cn("flex items-center", variant === "vertical" ? "flex-col text-center" : "flex-row text-left gap-3.5", className)}>
      <LogoIcon />
      <div className={cn("font-medium select-none text-[#13062E]", variant === "vertical" ? "mt-4" : "")}>
        <span className={cn("font-black tracking-tight italic", variant === "vertical" ? "text-3xl" : "text-xl")}>
          Condo
        </span>
        <span className={cn("font-bold tracking-tight italic", variant === "vertical" ? "text-3xl" : "text-xl")}>
          Secure
        </span>
      </div>
    </div>
  );
}
