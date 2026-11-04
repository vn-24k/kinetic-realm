"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export interface SmoothCursorProps {
  color?: string;
  glowColor?: string;
  dotSize?: number;
  outerRingSize?: number;
}

/**
 * 21st.dev style physics-based interactive cursor.
 * Features:
 * - Spring physics tracking via Motion Values
 * - Hover state expansion on interactive elements (buttons, links, [data-cursor="pointer"])
 * - Outer lagging ring + inner high-precision core dot
 * - Click pulse micro-interaction
 */
export function SmoothCursor({
  color = "#a855f7", // violet-500
  glowColor = "rgba(168, 85, 247, 0.4)",
  dotSize = 6,
  outerRingSize = 34,
}: SmoothCursorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Exact pointer position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for trailing motion
  const springConfig = { damping: 28, stiffness: 380, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only activate custom cursor on devices that support hover (non-touch)
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    document.body.classList.add("custom-cursor-active");

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.dataset.cursor === "pointer";

      setIsHovered(Boolean(isInteractive));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Spring Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-violet-500/40"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: isHovered ? `0 0 20px ${glowColor}` : "none",
        }}
        animate={{
          width: isHovered ? outerRingSize * 1.6 : outerRingSize,
          height: isHovered ? outerRingSize * 1.6 : outerRingSize,
          scale: isClicked ? 0.85 : 1,
          backgroundColor: isHovered
            ? "rgba(168, 85, 247, 0.12)"
            : "rgba(168, 85, 247, 0.04)",
          borderColor: isHovered
            ? "rgba(168, 85, 247, 0.75)"
            : "rgba(168, 85, 247, 0.35)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />

      {/* Center Precision Point */}
      <motion.div
        className="fixed top-0 left-0 rounded-full"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
        animate={{
          scale: isClicked ? 1.4 : isHovered ? 0.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
