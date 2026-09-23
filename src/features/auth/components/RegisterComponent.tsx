"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import toast from "react-hot-toast";

import { requestSignUp } from "../api/auth.api";
import GoogleLoginButton from "./GoogleLoginButton";

interface RegisterComponentProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function RegisterComponent({
  onCancel,
  onSuccess,
}: RegisterComponentProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters for OAuth errors
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "oauth_failed") {
        toast.error("Google sign up failed. Please try again.");
      }
    }
  }, []);

  // Form validation checks
  const isUsernameValid = username.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid =
    confirmPassword.length >= 6 && confirmPassword === password;

  const isFormValid =
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    agreeTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    try {
      await requestSignUp({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      // Reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/verify");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      toast.error(msg);
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
                style={{ width: "auto", height: "auto" }}
                className="object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-wider text-white font-logo select-none leading-none">
              ZEFLIX
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-zinc-400 font-custom2">
            Register to enjoy your movie time
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

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Username Field */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="username"
            className="text-xs sm:text-[13px] font-semibold text-zinc-300 tracking-wide font-custom2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="irvanwibowo"
            className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
            autoComplete="username"
            required
          />
        </div>

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
              placeholder="••••••••••••"
              className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
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

        {/* Confirm Password Field */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs sm:text-[13px] font-semibold text-zinc-300 tracking-wide font-custom2"
          >
            Confirm password
          </label>
          <div className="relative w-full">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border ${agreeTerms
                  ? "bg-[#2ca566] border-[#2ca566] text-white"
                  : "border-zinc-600 bg-[#090b10] group-hover:border-zinc-400"
                }`}
            >
              {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-[11px] sm:text-xs text-zinc-400 font-custom2 select-none leading-tight">
              I agree to our{" "}
              <Link
                href="/privacy"
                onClick={(e) => e.stopPropagation()}
                className="text-emerald-400 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                onClick={(e) => e.stopPropagation()}
                className="text-emerald-400 hover:underline"
              >
                Term & Conditions
              </Link>
            </span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`font-custom1 w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
              isFormValid && !isLoading
                ? "bg-[#489d6e] hover:bg-[#3b875d] active:scale-[0.98] text-white shadow-lg shadow-emerald-950/40 cursor-pointer"
                : "bg-[#181c26] text-zinc-500 border border-white/5 cursor-not-allowed select-none opacity-60 shadow-none"
            }`}
          >
            {isLoading ? "Creating account..." : "Create account"}
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

        {/* Already have an account footer */}
        <div className="pt-2 text-center">
          <p className="text-xs sm:text-[13px] text-zinc-400 font-custom2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
