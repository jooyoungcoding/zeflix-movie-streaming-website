"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { requestGoogleLogin } from "@/features/auth/api/auth.api";

interface GoogleLoginButtonProps {
  className?: string;
  text?: string;
}

export default function GoogleLoginButton({
  className = "",
  text = "Continue with Google",
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const url = await requestGoogleLogin();
      window.location.href = url;
    } catch (error: any) {
      console.error("Google login failed:", error);
      toast.error(error.message || "Failed to initialize Google login");
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 rounded-xl font-semibold text-sm text-zinc-200 hover:text-white bg-[#141720] hover:bg-[#1f2432] border border-white/10 shadow-sm transition-all duration-200 active:scale-[0.98] font-custom1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ fontFamily: "'MyFont2', sans-serif" }}
    >
      <Image
        src="/Images/google.png"
        alt="Google"
        width={20}
        height={20}
        className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0"
      />
      <span>{isLoading ? "Redirecting..." : text}</span>
    </button>
  );
}
