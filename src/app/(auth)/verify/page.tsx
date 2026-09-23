"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail, Loader2, AlertCircle, ArrowRight, LogIn } from "lucide-react";
import type { User, EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/libs/supabase";
import { useAuthStore } from "@/store/auth.store";
import { getCurrentUser } from "@/features/auth/api/auth.api";

type VerifyStatus = "checking" | "verified" | "verified_need_login" | "waiting" | "error";

interface AuthUserLike {
    id: string;
    email?: string | null;
    user_metadata?: {
        profile_id?: string;
        avatar_url?: string;
        picture?: string;
        username?: string;
        user_name?: string;
        display_name?: string;
        full_name?: string;
        name?: string;
        email?: string;
    };
}

export default function VerifyEmailPage() {
    const router = useRouter();
    const [status, setStatus] = useState<VerifyStatus>("checking");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [countdown, setCountdown] = useState<number>(3);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const handleSuccess = async (user?: User | AuthUserLike | null) => {
            if (hasTriggeredRef.current) return;
            hasTriggeredRef.current = true;

            if (user?.id) {
                const userEmail = user.email || null;
                const metadata = user.user_metadata || null;

                useAuthStore.getState().setAuth({
                    user_id: user.id,
                    profile_id: metadata?.profile_id || user.id,
                    avatar_url: metadata?.avatar_url || metadata?.picture || null,
                    username: metadata?.username || metadata?.user_name || null,
                    display_name: metadata?.display_name || metadata?.full_name || metadata?.name || null,
                    email: metadata?.email || userEmail || null,
                });
            }

            // Sync with server session
            try {
                const serverSession = await getCurrentUser();
                if (serverSession?.user && isMounted) {
                    useAuthStore.getState().setAuth({
                        user_id: serverSession.user.id,
                        profile_id: serverSession.profile?.profile_id || serverSession.user.id,
                        avatar_url: serverSession.profile?.avatar_url || null,
                        username: serverSession.profile?.username || null,
                        display_name: serverSession.profile?.display_name || null,
                        email: serverSession.profile?.email || serverSession.user.email || null,
                    });
                }
            } catch {
                // Continue with client session
            }

            if (!isMounted) return;
            setStatus("verified");
        };

        const handleAuthVerification = async () => {
            const hash = typeof window !== "undefined" ? window.location.hash : "";
            const search = typeof window !== "undefined" ? window.location.search : "";
            const params = new URLSearchParams(search || hash.replace(/^#/, "?"));
            const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

            // 1. Check if error parameters are present
            const error = params.get("error");
            const errorDescription = params.get("error_description");
            if (error || errorDescription) {
                if (!isMounted) return;
                setStatus("error");
                setErrorMessage(
                    errorDescription || error || "Verification link is invalid or has expired."
                );
                return;
            }

            // 2. Token hash & type flow (Email Confirmation)
            const tokenHash = params.get("token_hash");
            const otpType = params.get("type");
            if (tokenHash && otpType) {
                try {
                    const { data, error: otpError } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: otpType as EmailOtpType,
                    });
                    if (!otpError && (data?.user || data?.session?.user)) {
                        await handleSuccess(data.user || data.session?.user);
                        return;
                    }
                } catch {
                    // Fall through to other checks
                }
            }

            // 3. PKCE code exchange flow
            const code = params.get("code");
            if (code) {
                try {
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (!exchangeError && (data?.user || data?.session?.user)) {
                        await handleSuccess(data.user || data.session?.user);
                        return;
                    }

                    // If code verifier is missing (e.g. opened in different browser/app),
                    // the email was already verified by Supabase on the click!
                    if (
                        exchangeError &&
                        (exchangeError.message.toLowerCase().includes("code verifier") ||
                         exchangeError.message.toLowerCase().includes("both auth code and code verifier"))
                    ) {
                        if (!isMounted) return;
                        setStatus("verified_need_login");
                        return;
                    }
                } catch (err: unknown) {
                    if (
                        err instanceof Error &&
                        (err.message.toLowerCase().includes("code verifier") ||
                         err.message.toLowerCase().includes("both auth code and code verifier"))
                    ) {
                        if (!isMounted) return;
                        setStatus("verified_need_login");
                        return;
                    }
                }
            }

            // 4. Hash tokens flow (access_token & refresh_token)
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            if (accessToken && refreshToken) {
                try {
                    const { data, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (!sessionError && (data?.user || data?.session?.user)) {
                        await handleSuccess(data.user || data.session?.user);
                        return;
                    }
                } catch {
                    // Fall through to session check
                }
            }

            // 5. Active session check
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session?.user) {
                    await handleSuccess(session.user);
                    return;
                }
            } catch {
                // Ignore and rely on auth state listener or timeout
            }

            // 6. Listen for auth state change
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                if (!isMounted) return;
                if ((event === "SIGNED_IN" || event === "USER_UPDATED") && currentSession?.user) {
                    await handleSuccess(currentSession.user);
                }
            });

            // 7. Safety timeout: if still not resolved after 2.5 seconds
            const safetyTimer = setTimeout(async () => {
                if (isMounted && !hasTriggeredRef.current) {
                    const {
                        data: { session: finalSession },
                    } = await supabase.auth.getSession();

                    if (finalSession?.user) {
                        await handleSuccess(finalSession.user);
                    } else if (!hash && !search) {
                        setStatus("waiting");
                    } else {
                        setStatus("error");
                        setErrorMessage(
                            "Verification link is invalid, expired, or has already been used."
                        );
                    }
                }
            }, 2500);

            return () => {
                subscription.unsubscribe();
                clearTimeout(safetyTimer);
            };
        };

        handleAuthVerification();

        return () => {
            isMounted = false;
        };
    }, []);

    // Countdown and automatic redirect when verified
    useEffect(() => {
        if (status !== "verified") return;

        if (countdown <= 0) {
            router.push("/");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [status, countdown, router]);

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

                {/* State: Verified (Active session acquired) */}
                {status === "verified" && (
                    <div className="space-y-5">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-9 h-9 animate-bounce" />
                        </div>
                        <h1 className="text-2xl font-bold font-custom1 text-white">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-sm text-zinc-300 font-custom2 leading-relaxed">
                            Your account has been activated. Redirecting you to the home page in{" "}
                            <span className="text-emerald-400 font-bold">{countdown}s</span>...
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    router.push("/");
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2ca566] hover:bg-[#248a54] text-white font-custom1 font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-98"
                            >
                                <span>Start Watching Now</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* State: Verified on different device/browser (Needs direct login) */}
                {status === "verified_need_login" && (
                    <div className="space-y-5">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>
                        <h1 className="text-2xl font-bold font-custom1 text-white">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-sm text-zinc-300 font-custom2 leading-relaxed">
                            Your email has been confirmed. Please log in with your email and password to start enjoying movies.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/login"
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2ca566] hover:bg-[#248a54] text-white font-custom1 font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-98"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Log In to Your Account</span>
                            </Link>
                        </div>
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
