"use client";

import React from "react";

interface CircularHeartbeatLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * ECG Heartbeat Pulse Loading Animation
 * From Uiverse.io by milley69
 */
export default function CircularHeartbeatLoader({
  className = "",
  size = "md",
}: CircularHeartbeatLoaderProps) {
  const sizeScale = {
    sm: "scale-90",
    md: "scale-100 sm:scale-110",
    lg: "scale-125 sm:scale-150",
  }[size];

  return (
    <div
      role="status"
      aria-label="Loading video"
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      <span className="sr-only">Loading video</span>

      {/* From Uiverse.io by milley69 */}
      <div className={`loading ${sizeScale} transition-transform`}>
        <svg
          width="64px"
          height="48px"
          viewBox="0 0 64 48"
          style={{ overflow: "visible" }}
        >
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="back"
          />
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="front"
          />
        </svg>
      </div>
    </div>
  );
}
