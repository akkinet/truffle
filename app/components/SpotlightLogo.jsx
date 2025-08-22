"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/public/Logo.svg";

export default function SpotlightLogo() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMouse = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    container?.addEventListener("mousemove", updateMouse);

    return () => {
      container?.removeEventListener("mousemove", updateMouse);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full max-w-[500px] md:max-w-[700px] h-[150px] md:h-[200px] overflow-hidden mx-auto"
    >
      <Image
        src={Logo}
        alt="Logo"
        fill
        className="object-contain opacity-20 brightness-20 pointer-events-none"
      />
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, white 0%, transparent 80%)`,
          maskImage: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, white 0%, transparent 80%)`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          pointerEvents: "none",
        }}
      >
        <Image
          src={Logo}
          alt="Logo"
          fill
          className="object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}
