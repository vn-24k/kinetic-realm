"use client";

import React from "react";

interface NoiseGrainProps {
  opacity?: number;
}

export function NoiseGrain({ opacity = 0.03 }: NoiseGrainProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay"
      style={{ opacity }}
    >
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
