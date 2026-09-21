"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

declare global {
  interface Window {
    __zeflix_welcome_shown?: boolean;
  }
}

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if modal has already been shown in this window lifecycle
    if (typeof window !== "undefined") {
      if (window.__zeflix_welcome_shown) {
        return;
      }
      // Mark as shown for this page load so SPA navigation (Back button) won't re-trigger it
      window.__zeflix_welcome_shown = true;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Dark Blurred Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Main Modal Card without hard border, with soft ambient cosmic shadow */}
      <div
        className={`relative w-full max-w-lg bg-[#07090e]/95 rounded-3xl p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.15)] overflow-hidden text-center flex flex-col items-center justify-center transition-all duration-300 transform ${
          isClosing ? "scale-95 translate-y-4 opacity-0" : "scale-100 translate-y-0 opacity-100"
        }`}
      >
        {/* Starfield & Cosmic Glow Background */}
        <div
          className="absolute inset-0 bg-[url('/Images/stars.png')] bg-repeat bg-center opacity-60 pointer-events-none"
          style={{ backgroundSize: "400px 400px" }}
        />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Space Elements Surrounding the Center */}
        {/* 1. Planet (Top-Left) */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-14 sm:w-18 h-14 sm:h-18 pointer-events-none select-none animate-float-slow opacity-85">
          <Image
            src="/Images/planet-01.png"
            alt="Planet"
            width={72}
            height={72}
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            priority
          />
        </div>

        {/* 2. Rocket (Top-Right) */}
        <div className="absolute top-5 right-14 sm:top-6 sm:right-16 w-12 sm:w-16 h-12 sm:h-16 pointer-events-none select-none animate-float-rocket opacity-90">
          <Image
            src="/Images/Rocket.png"
            alt="Rocket"
            width={64}
            height={64}
            className="w-full h-full object-contain -rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            priority
          />
        </div>

        {/* 3. Spaceman (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-16 sm:w-22 h-16 sm:h-22 pointer-events-none select-none animate-float-spaceman opacity-90">
          <Image
            src="/Images/spaceman.png"
            alt="Spaceman"
            width={88}
            height={88}
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(72,157,110,0.3)]"
            priority
          />
        </div>

        {/* Close Button (X) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-md"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 pt-2">
          {/* Logo & Brand Name in Center */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 drop-shadow-[0_4px_20px_rgba(255,255,255,0.25)]">
              <Image
                src="/Logo/Logo.png"
                alt="ZEFLIX Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <span
              className="text-3xl sm:text-4xl font-bold tracking-widest text-white select-none leading-none font-logo"
              style={{ fontFamily: "'MyFont', sans-serif" }}
            >
              ZEFLIX
            </span>
          </div>

          {/* Text Section (using font-custom2 / MyFont3) */}
          <div
            className="space-y-2 max-w-sm font-custom2"
            style={{ fontFamily: "'MyFont3', sans-serif" }}
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-white uppercase">
              WELCOME TO ZEFLIX
            </h2>
            <p className="text-xs sm:text-[13px] tracking-wide text-zinc-300 leading-relaxed">
              EXPLORE THE ULTIMATE STREAMING UNIVERSE OF MOVIES & TV SERIES.
            </p>
          </div>

          {/* Button Section (using font-custom1 / MyFont2 styled like not-found.tsx) */}
          <div
            className="pt-2 font-custom1"
            style={{ fontFamily: "'MyFont2', sans-serif" }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 sm:px-8 sm:py-2.5 rounded-md border border-white/40 hover:border-white text-xs sm:text-[13px] uppercase tracking-wider text-zinc-200 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg"
            >
              EXPLORE NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
