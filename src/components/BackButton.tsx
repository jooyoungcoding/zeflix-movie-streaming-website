"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
  label?: string;
}

export default function BackButton({
  fallbackUrl = "/",
  className = "font-custom1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-lg cursor-pointer",
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      // In Next.js App Router, history.state.idx > 0 indicates there is a previous page in the app session
      const hasPreviousInApp =
        typeof window.history.state?.idx === "number"
          ? window.history.state.idx > 0
          : window.history.length > 1;

      if (hasPreviousInApp) {
        router.back();
      } else {
        router.push(fallbackUrl);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
      aria-label={label}
    >
      <ChevronLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
