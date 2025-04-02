
import React from "react";
import { cn } from "@/lib/utils";

interface OrunlinkLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  color?: string;
}

const OrunlinkLogo: React.FC<OrunlinkLogoProps> = ({
  className,
  size = 40,
  showText = true,
  color = "#0A3142", // Dark blue color from the logo
}) => {
  const width = typeof size === "number" ? `${size}px` : size;
  const height = typeof size === "number" ? `${size}px` : size;
  const textSize = typeof size === "number" ? Math.floor(size * 0.8) : size;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cloud outline */}
        <path
          d="M335 160C335 160 365 180 365 220C365 260 335 280 335 280L65 280C65 280 35 260 35 220C35 180 65 160 65 160C65 120 95 100 135 100C145 60 185 40 225 40C265 40 305 60 315 100C315 100 335 100 335 160Z"
          stroke={color}
          strokeWidth="24"
          fill="transparent"
        />
        {/* Lightning bolt */}
        <path
          d="M238 100L145 210H205L162 300L255 190H195L238 100Z"
          fill={color}
        />
      </svg>
      
      {showText && (
        <div 
          className="font-bold mt-1"
          style={{ 
            fontSize: textSize,
            color: color
          }}
        >
          Orunlink
        </div>
      )}
    </div>
  );
};

export default OrunlinkLogo;
