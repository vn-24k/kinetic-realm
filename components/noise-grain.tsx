"use client";

import React from "react";

export function NoiseGrain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.18] mix-blend-overlay">
      <svg className="w-full h-full">
        <filter id="shadowNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#shadowNoise)" />
      </svg>
    </div>
  );
}
