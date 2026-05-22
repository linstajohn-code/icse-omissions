"use client";

/**
 * FilmGrain — fixed canvas overlay that renders animated noise texture.
 *
 * Simulates celluloid film grain at ~12fps. Opacity is intentionally
 * subliminal — visible when you look for it, invisible otherwise.
 *
 * pointer-events-none + aria-hidden: completely transparent to users
 * and assistive technology.
 */
import { useEffect, useRef } from "react";

export function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    // ~12fps matches real film grain flicker rate
    const FRAME_INTERVAL = 1000 / 12;

    function resize() {
      if (!canvas) return;
      // Cap at 2× for retina without blowing up canvas size on 3× screens
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }

    function draw(timestamp: number) {
      if (!canvas || !ctx) return;
      animId = requestAnimationFrame(draw);

      if (timestamp - lastTime < FRAME_INTERVAL) return;
      lastTime = timestamp;

      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Monochromatic noise — each pixel gets random luminance
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i]     = v; // R
        data[i + 1] = v; // G
        data[i + 2] = v; // B
        data[i + 3] = 18; // Alpha ~7% — combined with CSS opacity = subliminal
      }

      ctx.putImageData(imageData, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 opacity-[0.035] mix-blend-overlay"
      style={{ willChange: "contents" }}
    />
  );
}
