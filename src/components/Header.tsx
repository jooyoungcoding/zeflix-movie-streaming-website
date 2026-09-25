"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  SquarePen,
  Bookmark,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/libs/supabase";
import {
  getCurrentUser,
  getUserProfile,
  requestLogout,
} from "@/features/auth/api/auth.api";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Discover", href: "/discover" },
  { name: "View release", href: "/release" },
  { name: "About Us", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user_id, avatar_url, username, display_name, email, clearAuth } =
    useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  // Sync profile & session details using API
  useEffect(() => {
    let isMounted = true;
    const fetchSessionOrProfile = async () => {
      try {
        // Exchange PKCE code if redirected from verification or OAuth directly to the current page (skip on /verify to prevent race condition)
        if (pathname !== "/verify" && typeof window !== "undefined" && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          if (code) {
            try {
              await supabase.auth.exchangeCodeForSession(code);
              const cleanUrl = window.location.pathname + (window.location.hash || "");
              window.history.replaceState({}, document.title, cleanUrl);
            } catch {
              // Silently ignore if code was already exchanged
            }
          }
        }

        // Always check server session first to get latest Google avatar/metadata
        const sessionData = await getCurrentUser();
        if (isMounted && sessionData?.user) {
          useAuthStore.getState().setAuth({
            user_id: sessionData.user.id,
            profile_id: sessionData.profile?.profile_id || sessionData.user.id,
            avatar_url: sessionData.profile?.avatar_url || null,
            username: sessionData.profile?.username || null,
            display_name: sessionData.profile?.display_name || null,
            email: sessionData.profile?.email || sessionData.user.email || null,
          });
          return;
        }

        // Fallback: check client-side supabase session if server cookies are delayed
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted && session?.user) {
          const profile = await getUserProfile(session.user.id).catch(() => null);
          useAuthStore.getState().setAuth({
            user_id: session.user.id,
            profile_id: profile?.profile_id || session.user.id,
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
            username: profile?.username || session.user.user_metadata?.username || null,
            display_name: profile?.display_name || session.user.user_metadata?.full_name || null,
            email: profile?.email || session.user.email || null,
          });
          return;
        }

        // Only clear if neither server nor client has any session
        if (isMounted && !sessionData?.user && !session?.user && user_id) {
          clearAuth();
        }
      } catch (err) {
        // Silent fallback for unauthenticated visitors or canceled requests during navigation
        if (err instanceof Error && err.name !== "AbortError") {
          // Session unavailable, keep visitor in guest state
        }
      }
    };

    fetchSessionOrProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      if (event === "SIGNED_IN" && currentSession?.user) {
        const profile = await getUserProfile(currentSession.user.id).catch(() => null);
        useAuthStore.getState().setAuth({
          user_id: currentSession.user.id,
          profile_id: profile?.profile_id || currentSession.user.id,
          avatar_url: profile?.avatar_url || currentSession.user.user_metadata?.avatar_url || null,
          username: profile?.username || currentSession.user.user_metadata?.username || null,
          display_name: profile?.display_name || currentSession.user.user_metadata?.full_name || null,
          email: profile?.email || currentSession.user.email || null,
        });
      } else if (event === "SIGNED_OUT") {
        clearAuth();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user_id, clearAuth]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    try {
      await requestLogout();
    } catch (err) {
      console.error("Server sign out error:", err);
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Client sign out error:", err);
    }

    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
  };

  // Hide header on login, register, verify and not-found pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify" ||
    pathname === "/not-found" ||
    pathname === "/404"
  ) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center transition-all duration-300 ${
        isScrolled
          ? "bg-[#07090e]/90 backdrop-blur-md shadow-lg shadow-black/50 border-b border-white/5"
          : "bg-gradient-to-b from-black/85 via-black/45 to-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Brand Logo & Title (Using MyFont) */}
        <Link href="/" className="flex items-center group shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
            <Image
              src="/Logo/Logo.png"
              alt="ZEFLIX Logo"
              width={44}
              height={44}
              style={{ width: "auto", height: "auto" }}
              className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
              priority
            />
          </div>
          <span
            className="text-2xl sm:text-[28px] font-bold tracking-wider select-none leading-none shrink-0 whitespace-nowrap ml-2.5 sm:ml-3 transition-colors text-white"
            style={{ fontFamily: "'MyFont', sans-serif" }}
          >
            ZEFLIX
          </span>
        </Link>

        {/* Center: Navigation Links (Using MyFont1) */}
        <nav
          className="hidden md:flex items-center gap-7 lg:gap-9 shrink-0"
          style={{ fontFamily: "'MyFont1', sans-serif" }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base uppercase tracking-wider transition-all duration-200 relative py-1 ${
                  isActive
                    ? "text-white font-bold"
                    : "text-zinc-300/80 hover:text-white"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Animated Search, Login/Avatar Dropdown) */}
        <div
          className="flex items-center justify-end gap-2 sm:gap-3.5 flex-1 md:flex-initial shrink-0"
          style={{ fontFamily: "'MyFont1', sans-serif" }}
        >
          {/* Direct Search Link */}
          <Link
            href="/search"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              pathname === "/search"
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-zinc-300 hover:text-white hover:bg-white/10"
            }`}
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[2.2] transition-transform duration-200 hover:scale-110" />
          </Link>

          {/* Notifications Bell */}
          <div className="relative" ref={notificationsMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileOpen(false);
              }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer shrink-0"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2] transition-transform duration-200 hover:scale-110" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#07090e]" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div
              className={`absolute right-0 top-[calc(100%+12px)] w-80 max-w-[calc(100vw-32px)] backdrop-blur-2xl border rounded-2xl shadow-2xl py-3 z-50 transition-all duration-200 origin-top-right select-none font-custom2 bg-[#191b22]/95 border-white/10 shadow-black/80 text-white ${
                isNotificationsOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
              style={{ fontFamily: "'MyFont3', sans-serif" }}
            >
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wide">
                    Notifications
                  </span>
                  {hasUnread && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      New
                    </span>
                  )}
                </div>
                {hasUnread && (
                  <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Mark as read
                  </button>
                )}
              </div>

              <div className="py-2 px-2 flex flex-col gap-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                <div className="p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                      New Releases Available
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      Catch the latest movies and trending series updated this week on Zeflix.
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-0.5">Just now</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                      Welcome to Zeflix ✨
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      Stream thousands of blockbuster movies and TV shows in crystal HD.
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-0.5">1 day ago</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 px-4 border-t border-white/5 text-center">
                <Link
                  href="/release"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  View All Releases →
                </Link>
              </div>
            </div>
          </div>

          {/* Login or User Avatar with Profile Dropdown */}
          {user_id ? (
            <div className="relative hidden sm:block" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={`inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#1c1f26] border transition-all duration-200 active:scale-95 overflow-hidden group shrink-0 cursor-pointer ${
                  isProfileOpen
                    ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40"
                    : "border-white/10 hover:border-emerald-500/60 shadow-sm"
                }`}
                aria-expanded={isProfileOpen}
                aria-label="User Profile Menu"
              >
                {avatar_url ? (
                  <Image
                    src={avatar_url}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                )}
              </button>

              {/* Dropdown Card */}
              <div
                className={`absolute right-0 top-[calc(100%+12px)] w-64 backdrop-blur-2xl border rounded-2xl shadow-2xl py-2 z-50 transition-all duration-200 origin-top-right select-none font-custom2 bg-[#191b22]/95 border-white/10 shadow-black/80 text-white ${
                  isProfileOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
                style={{ fontFamily: "'MyFont3', sans-serif" }}
              >
                {/* Header with Avatar, Name, Email */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border flex items-center justify-center bg-[#232734] border-white/10">
                    {avatar_url ? (
                      <Image
                        src={avatar_url}
                        alt="User Avatar"
                        width={44}
                        height={44}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 overflow-hidden text-left">
                    <span className="text-[15px] font-bold leading-tight truncate text-white">
                      {display_name || username || "Irvan Wibowo"}
                    </span>
                    <span className="text-xs truncate mt-0.5 leading-normal opacity-90 text-zinc-400">
                      {email || "irvanwibowo@studio.com"}
                    </span>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="px-2 py-1.5 flex flex-col gap-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 group text-zinc-200 hover:text-white hover:bg-white/[0.08]"
                  >
                    <SquarePen className="w-5 h-5 transition-colors shrink-0 stroke-[2] text-zinc-400 group-hover:text-white" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/watchlist"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 group text-zinc-200 hover:text-white hover:bg-white/[0.08]"
                  >
                    <Bookmark className="w-5 h-5 transition-colors shrink-0 stroke-[2] text-zinc-400 group-hover:text-white" />
                    <span>Watchlist</span>
                  </Link>

                  <Link
                    href="/history"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 group text-zinc-200 hover:text-white hover:bg-white/[0.08]"
                  >
                    <History className="w-5 h-5 transition-colors shrink-0 stroke-[2] text-zinc-400 group-hover:text-white" />
                    <span>History</span>
                  </Link>


                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 group text-zinc-200 hover:text-white hover:bg-white/[0.08]"
                  >
                    <Settings className="w-5 h-5 transition-colors shrink-0 stroke-[2] text-zinc-400 group-hover:text-white" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="px-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-bold text-[#f87171] hover:text-[#fb7185] hover:bg-rose-500/10 transition-all duration-150 group cursor-pointer text-left"
                  >
                    <LogOut className="w-5 h-5 text-[#f87171] group-hover:text-[#fb7185] transition-colors shrink-0 stroke-[2]" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 text-zinc-200 bg-[#1c1f26]/85 hover:bg-[#282d37] hover:text-white border border-white/10 shadow-sm"
            >
              Login
            </Link>
          )}

          {/* Mobile Animated Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-300 cursor-pointer relative text-zinc-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle Navigation Menu"
          >
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : "translate-y-0"
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-all duration-200 ease-in-out ${
                isMobileMenuOpen ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : "translate-y-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 top-[68px] bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Animated Drawer Menu */}
      <div
        className={`md:hidden absolute top-[68px] left-0 right-0 z-50 backdrop-blur-2xl border-b px-6 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl bg-[#0a0d14]/95 border-white/10 ${
          isMobileMenuOpen
            ? "max-h-[520px] opacity-100 py-5 translate-y-0 pointer-events-auto"
            : "max-h-0 opacity-0 py-0 -translate-y-3 pointer-events-none border-transparent"
        }`}
        style={{ fontFamily: "'MyFont1', sans-serif" }}
      >
        <nav className="flex flex-col gap-3.5">
          {navItems.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base uppercase tracking-wider py-2.5 px-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-white font-bold bg-white/10 shadow-inner"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                } ${
                  isMobileMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-3 opacity-0"
                }`}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${idx * 40}ms` : "0ms",
                }}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Mobile User Profile Section */}
          <div
            className="pt-3 border-t flex flex-col gap-2.5 sm:hidden font-custom2 border-white/10"
            style={{ fontFamily: "'MyFont3', sans-serif" }}
          >
            {user_id ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border bg-white/5 border-white/10">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#222632]">
                    {avatar_url ? (
                      <Image
                        src={avatar_url}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate text-white">
                      {display_name || username || "Irvan Wibowo"}
                    </span>
                    <span className="text-xs truncate opacity-90 text-zinc-400">
                      {email || "irvanwibowo@studio.com"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <SquarePen className="w-4 h-4 text-zinc-400" />
                    <span>Edit account</span>
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                    <span>Watchlist</span>
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <History className="w-4 h-4 text-zinc-400" />
                    <span>History</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-[#f87171] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm uppercase tracking-wider transition-colors text-zinc-200 bg-[#1c1f26] hover:bg-[#282d37] hover:text-white border border-white/10 shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
