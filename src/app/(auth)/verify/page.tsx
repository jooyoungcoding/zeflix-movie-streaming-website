"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/libs/supabase";
import { useAuthStore } from "@/store/auth.store";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"checking" | "verified" | "waiting" | "error">("checking");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const hasTriggeredRef = React.useRef(false);

    useEffect(() => {
        let isMounted = true;

        const handleSuccess = (userId?: string) => {
            if (hasTriggeredRef.current) return;
            hasTriggeredRef.current = true;
            if (userId) {
                useAuthStore.getState().setAuth({
                    user_id: userId,
                    profile_id: userId,
                });
            }
            setStatus("verified");
            toast.success("Email verified successfully! Welcome to ZEFLIX.", {
                id: "verify-email-toast",
            });
            setTimeout(() => {
                router.push("/");
            }, 2000);
        };

        const handleAuthVerification = async () => {
            // 1. Check if there are error parameters in hash or query
            const hash = typeof window !== "undefined" ? window.location.hash : "";
            const search = typeof window !== "undefined" ? window.location.search : "";
            const params = new URLSearchParams(search || hash.replace(/^#/, "?"));

            const error = params.get("error");
            const errorDescription = params.get("error_description");

            if (error || errorDescription) {
                if (!isMounted) return;
                setStatus("error");
                setErrorMessage(
                    errorDescription || error || "Verification link is invalid or has expired."
                );
                toast.error("Email verification failed: " + (errorDescription || error), {
                    id: "verify-error-toast",
                });
                return;
            }

            // 2. Check current session
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                if (!isMounted) return;
                handleSuccess(session.user.id);
                return;
            }

            // 3. Listen to auth state changes in case token exchange is in progress
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                if (!isMounted) return;

                if (event === "SIGNED_IN" || currentSession?.user) {
                    handleSuccess(currentSession?.user?.id);
                }
            });

            // If no session after short check and no hash token, set to waiting mode
            const checkTimer = setTimeout(() => {
                if (isMounted && !hasTriggeredRef.current) {
                    if (!hash.includes("access_token") && !search.includes("code")) {
                        setStatus("waiting");
                    }
                }
            }, 1200);

            return () => {
                subscription.unsubscribe();
                clearTimeout(checkTimer);
            };
        };

        handleAuthVerification();

        return () => {
            isMounted = false;
        };
    }, [router]);

    return (
        <main className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-black relative overflow-hidden text-white">
            {/* Background radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(44,165,102,0.09),transparent_65%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md bg-[#12151c]/95 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-2">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <Image
                            src="/Logo/Logo.png"
                            alt="ZEFLIX Logo"
                            width={32}
                            height={32}
                            className="object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
                            priority
                        />
                    </div>
                    <span className="text-2xl font-bold tracking-wider text-white font-logo select-none">
                        ZEFLIX
                    </span>
                </div>

                {/* State: Checking */}
                {status === "checking" && (
                    <div className="py-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                        <h1 className="text-xl font-bold font-custom1 text-white">
                            Verifying your email...
                        </h1>
                        <p className="text-xs text-zinc-400 font-custom2">
                            Please wait a moment while we verify your account.
                        </p>
                    </div>
                )}

                {/* State: Verified */}
                {status === "verified" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-9 h-9 animate-bounce" />
                        </div>
                        <h1 className="text-2xl font-bold font-custom1 text-white">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-sm text-zinc-300 font-custom2 leading-relaxed">
                            Your account has been activated. Redirecting you to the home page...
                        </p>
                    </div>
                )}

                {/* State: Waiting (User just registered and needs to check inbox) */}
                {status === "waiting" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold font-custom1 text-white">
                            Check Your Email
                        </h1>
                        <p className="text-sm text-zinc-400 font-custom2 leading-relaxed">
                            We&apos;ve sent a confirmation link to your email address. Please click the link to activate your ZEFLIX account.
                        </p>
                        <div className="pt-3 flex flex-col gap-2.5">
                            <Link
                                href="/login"
                                className="w-full inline-block py-3 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] border border-white/10 text-white font-custom1 font-bold text-sm transition-all duration-200"
                            >
                                Back to Login
                            </Link>
                            <Link
                                href="/"
                                className="text-xs text-zinc-500 hover:text-zinc-300 font-custom2 transition-colors"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                )}

                {/* State: Error */}
                {status === "error" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold font-custom1 text-white">
                            Verification Failed
                        </h1>
                        <p className="text-sm text-zinc-400 font-custom2 leading-relaxed">
                            {errorMessage || "The confirmation link is invalid, expired, or has already been used."}
                        </p>
                        <div className="pt-3 flex flex-col gap-2.5">
                            <Link
                                href="/register"
                                className="w-full inline-block py-3 rounded-xl bg-[#489d6e] hover:bg-[#3b875d] text-white font-custom1 font-bold text-sm transition-all duration-200"
                            >
                                Try Registering Again
                            </Link>
                            <Link
                                href="/login"
                                className="text-xs text-zinc-400 hover:text-white font-custom2 transition-colors"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
