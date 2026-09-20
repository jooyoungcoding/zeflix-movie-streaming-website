"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { requestLogin } from "../api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import GoogleLoginButton from "./GoogleLoginButton";

interface LoginComponentProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function LoginComponent({
  onCancel,
  onSuccess,
}: LoginComponentProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters for OAuth errors
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "oauth_failed") {
        toast.error("Google authentication failed. Please try again.");
      }
    }
  }, []);

  // Form validation checks
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    try {
      const response = await requestLogin({
        email: email.trim(),
        password,
      });

      if (response.user?.id) {
        useAuthStore.getState().setAuth({
          user_id: response.user.id,
          profile_id: response.profile?.profile_id || response.user.id,
          avatar_url: response.profile?.avatar_url || null,
          username: response.profile?.username || null,
          display_name: response.profile?.display_name || null,
          email: response.profile?.email || response.user.email || email.trim(),
        });
      }

      toast.success(response.message || "Login successful! Welcome back.");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        {/* Brand & Subtitle */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <Image
                src="/Logo/Logo.png"
                alt="ZEFLIX Logo"
                width={32}
                height={32}
                className="object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-wider text-white font-logo select-none leading-none">
              ZEFLIX
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-zinc-400 font-custom2">
            Login to your account
          </p>
        </div>

        {/* Cancel Button */}
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="font-custom1 text-xs px-3.5 py-1.5 rounded-xl bg-[#1c202a] text-zinc-300 hover:text-white hover:bg-[#282e3c] border border-white/10 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/"
            className="font-custom1 text-xs px-3.5 py-1.5 rounded-xl bg-[#1c202a] text-zinc-300 hover:text-white hover:bg-[#282e3c] border border-white/10 transition-all duration-200 active:scale-95 shrink-0"
          >
            Cancel
          </Link>
        )}
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Email Field */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs sm:text-[13px] font-semibold text-zinc-300 tracking-wide font-custom2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="irvanwibowo@movie.com"
            className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
            autoComplete="email"
            required
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs sm:text-[13px] font-semibold text-zinc-300 tracking-wide font-custom2"
          >
            Password
          </label>
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="pt-0.5 text-center">
          <Link
            href="/forgot-password"
            className="text-xs sm:text-[13px] font-semibold text-emerald-400 hover:text-emerald-300 font-custom2 hover:underline transition-colors"
          >
            Forgot password
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`font-custom1 w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
              isFormValid && !isLoading
                ? "bg-[#489d6e] hover:bg-[#3b875d] active:scale-[0.98] text-white shadow-lg shadow-emerald-950/40 cursor-pointer"
                : "bg-[#181c26] text-zinc-500 border border-white/5 cursor-not-allowed select-none opacity-60 shadow-none"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-white/10" />
          <span
            className="text-[11px] sm:text-xs text-zinc-400 uppercase tracking-widest font-custom2 select-none"
            style={{ fontFamily: "'MyFont3', sans-serif" }}
          >
            OR
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Continue with Google Button */}
        <div>
          <GoogleLoginButton />
        </div>

        {/* Don't have an account footer */}
        <div className="pt-2 text-center">
          <p className="text-xs sm:text-[13px] text-zinc-400 font-custom2">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

