"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, LogIn, UserPlus } from "lucide-react";
import { useAuthModalStore } from "@/store/auth-modal.store";

export default function AuthRequiredModal() {
  const router = useRouter();
  const { isOpen, title, description, closeModal } = useAuthModalStore();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
    }, 200);
  };

  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path);
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
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Main Modal Card */}
      <div
        className={`relative w-full max-w-md bg-[#0c0f17] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(220,38,38,0.15)] overflow-hidden text-center flex flex-col items-center justify-center transition-all duration-300 transform ${
          isClosing
            ? "scale-95 translate-y-3 opacity-0"
            : "scale-100 translate-y-0 opacity-100"
        }`}
      >
        {/* Subtle Ambient Red Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Image */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <Image
              src="/Logo/Logo.png"
              alt="Zeflix Logo"
              width={72}
              height={72}
              priority
              className="object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.45)]"
            />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-custom1 text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="font-custom1 text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => handleNavigate("/login")}
            className="font-custom2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Continue</span>
          </button>

          <button
            onClick={() => handleNavigate("/register")}
            className="font-custom2 w-full py-3 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
          </button>
        </div>

        {/* Footer text */}
        <p className="font-custom1 text-[11px] text-zinc-500 mt-5">
          Takes less than a minute • No credit card required
        </p>
      </div>
    </div>
  );
}
