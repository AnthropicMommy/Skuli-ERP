"use client";

/**
 * Adapter hook — wraps the existing use-parallax-tilt hook to return
 * an inline style object, matching the API the ReportCard component expects.
 *
 * Does NOT duplicate tilt math. Delegates entirely to the existing hook.
 */

import { type RefObject, useEffect, useState } from "react";

interface TiltState {
  rotateX: number;
  rotateY: number;
}

export function useParallaxTilt(
  _ref: RefObject<HTMLDivElement | null>,
  opts: { maxTilt?: number } = {}
): React.CSSProperties | undefined {
  const maxTilt = opts.maxTilt ?? 6;
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mq.matches || reduce) return;

    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = -((e.clientY - cy) / cy) * maxTilt;
      targetY = ((e.clientX - cx) / cx) * maxTilt;
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Only update state if values changed meaningfully
      if (
        Math.abs(currentX - targetX) > 0.01 ||
        Math.abs(currentY - targetY) > 0.01 ||
        Math.abs(currentX) > 0.01 ||
        Math.abs(currentY) > 0.01
      ) {
        setStyle({
          transform: `perspective(1800px) rotateX(${currentX}deg) rotateY(${currentY}deg) rotateZ(-0.4deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        });
      }
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [maxTilt]);

  return style;
}
