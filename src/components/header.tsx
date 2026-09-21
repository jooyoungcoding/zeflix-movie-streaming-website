"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  User,
  SquarePen,
  Bookmark,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/libs/supabase";
import {
  getUserProfile,
  getCurrentUser,
  requestLogout,
} from "@/features/auth/api/auth.api";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Discover", href: "/discover" },
  { name: "New release", href: "/new-release" },
  { name: "Forum", href: "/forum" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user_id, avatar_url, username, display_name, email, clearAuth } =
    useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Sync profile & session details using API
  useEffect(() => {
    let isMounted = true;
    const fetchSessionOrProfile = async () => {
      try {
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

        if (user_id) {
          const data = await getUserProfile(user_id);
          if (isMounted && data) {
            useAuthStore.getState().setAuth({
              user_id: data.profile_id,
              profile_id: data.profile_id,
              avatar_url: data.avatar_url,
              username: data.username,
              display_name: data.display_name,
              email: data.email,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile/session:", err);
      }
    };

    fetchSessionOrProfile();
    return () => {
      isMounted = false;
    };
  }, [user_id]);

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
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        if (!searchQuery) {
          setIsSearchOpen(false);
        }
      }

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 150);
      }
      return !prev;
    });
  };

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
      className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center transition-colors duration-300 ${isScrolled
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
              className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
              priority
            />
          </div>
          <span
            className={`text-2xl sm:text-[28px] font-bold tracking-wider text-white select-none leading-none shrink-0 whitespace-nowrap transition-all duration-300 ease-out ${isSearchOpen
              ? "max-w-0 opacity-0 ml-0 overflow-hidden sm:max-w-[140px] sm:opacity-100 sm:ml-2.5 sm:overflow-visible"
              : "max-w-[140px] opacity-100 ml-2.5 sm:ml-3 overflow-visible"
              }`}
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
                className={`text-base uppercase tracking-wider transition-all duration-200 relative py-1 ${isActive
                  ? "text-white font-bold"
                  : "text-zinc-300/80 hover:text-white"
                  }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/90 to-transparent rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Animated Search, Login/Avatar Dropdown, Theme Toggle Switch) */}
        <div
          className="flex items-center justify-end gap-2 sm:gap-3.5 flex-1 md:flex-initial shrink-0"
          style={{ fontFamily: "'MyFont1', sans-serif" }}
        >
          {/* Smooth Animated Search Bar */}
          <div
            ref={searchContainerRef}
            className={`relative flex items-center h-9 transition-all duration-300 ease-out overflow-hidden ${isSearchOpen
              ? "flex-1 max-w-[280px] sm:max-w-none sm:w-64 sm:flex-initial bg-[#151821]/95 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-full px-2.5 backdrop-blur-md"
              : "w-9 flex-none bg-transparent border border-transparent rounded-full px-0 justify-center"
              }`}
          >
            <button
              type="button"
              onClick={handleSearchToggle}
              className={`w-9 h-9 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${isSearchOpen
                ? "w-7 h-7 text-zinc-400 hover:text-white"
                : "text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5 stroke-[2.2] transition-transform duration-300 hover:scale-110" />
            </button>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-500 font-sans h-full transition-all duration-300 leading-none min-w-0 ${isSearchOpen
                ? "w-full opacity-100 ml-1.5 pr-1"
                : "w-0 max-w-0 opacity-0 pointer-events-none p-0 border-0 ml-0 overflow-hidden"
                }`}
            />

            <button
              type="button"
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                } else {
                  setIsSearchOpen(false);
                }
              }}
              className={`h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${isSearchOpen
                ? "w-6 opacity-100 scale-100 pointer-events-auto"
                : "w-0 max-w-0 min-w-0 opacity-0 scale-75 pointer-events-none p-0 overflow-hidden"
                }`}
              aria-label="Clear or close search"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* Login or User Avatar with Profile Dropdown */}
          {user_id ? (
            <div className="relative hidden sm:block" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={`inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#1c1f26] border transition-all duration-200 active:scale-95 overflow-hidden group shrink-0 cursor-pointer ${isProfileOpen
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
                className={`absolute right-0 top-[calc(100%+12px)] w-64 bg-[#191b22]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 py-2 z-50 transition-all duration-200 origin-top-right select-none font-custom2 ${isProfileOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                style={{ fontFamily: "'MyFont3', sans-serif" }}
              >
                {/* Header with Avatar, Name, Email */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#232734] border border-white/10 flex items-center justify-center">
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
                    <span className="text-[15px] font-bold text-white leading-tight truncate">
                      {display_name || username || "Irvan Wibowo"}
                    </span>
                    <span className="text-xs text-zinc-400 truncate mt-0.5 leading-normal opacity-90">
                      {email || "irvanwibowo@studio.com"}
                    </span>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="px-2 py-1.5 flex flex-col gap-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <SquarePen className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0 stroke-[2]" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/watchlist"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <Bookmark className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0 stroke-[2]" />
                    <span>Watchlist</span>
                  </Link>

                  <Link
                    href="/download"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <Download className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0 stroke-[2]" />
                    <span>Download</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0 stroke-[2]" />
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
              className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm uppercase tracking-wider text-zinc-200 bg-[#1c1f26]/85 hover:bg-[#282d37] hover:text-white border border-white/10 shadow-sm transition-all duration-200 active:scale-95"
            >
              Login
            </Link>
          )}

          {/* Sliding Dark / Light Mode Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition-colors duration-300 cursor-pointer select-none focus:outline-none shrink-0 ${isDark
              ? "bg-[#161922] border border-white/15 shadow-inner"
              : "bg-zinc-200 border border-zinc-300 shadow-inner"
              }`}
            aria-label="Toggle Dark/Light Mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {/* Background Static Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
              <Sun
                className={`w-3.5 h-3.5 transition-opacity duration-300 ${!isDark ? "opacity-0" : "text-amber-400/70"
                  }`}
              />
              <Moon
                className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? "opacity-0" : "text-zinc-600"
                  }`}
              />
            </div>

            {/* Sliding Thumb Knob */}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transform transition-transform duration-300 ease-out ${isDark
                ? "translate-x-7 bg-black text-white border border-zinc-700"
                : "translate-x-0 bg-white text-zinc-900 border border-zinc-200"
                }`}
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 fill-current text-white" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              )}
            </span>
          </button>

          {/* Mobile Animated Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer relative"
            aria-label="Toggle Navigation Menu"
          >
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen
                ? "rotate-45 translate-y-2 bg-white"
                : "translate-y-0"
                }`}
            />
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-all duration-200 ease-in-out ${isMobileMenuOpen
                ? "opacity-0 translate-x-2"
                : "opacity-100 translate-x-0"
                }`}
            />
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen
                ? "-rotate-45 -translate-y-2 bg-white"
                : "translate-y-0"
                }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 top-[68px] bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMobileMenuOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Mobile Animated Drawer Menu */}
      <div
        className={`md:hidden absolute top-[68px] left-0 right-0 z-50 bg-[#0a0d14]/95 backdrop-blur-2xl border-b border-white/10 px-6 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen
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
                className={`text-base uppercase tracking-wider py-2.5 px-3.5 rounded-xl transition-all duration-200 ${isActive
                  ? "text-white font-bold bg-white/10 shadow-inner"
                  : "text-zinc-300 hover:text-white hover:bg-white/5"
                  } ${isMobileMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-3 opacity-0"
                  }`}
                style={{
                  transitionDelay: isMobileMenuOpen
                    ? `${idx * 40}ms`
                    : "0ms",
                }}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Mobile User Profile Section */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5 sm:hidden font-custom2" style={{ fontFamily: "'MyFont3', sans-serif" }}>
            {user_id ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#222632] flex items-center justify-center">
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
                      <User className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate">
                      {display_name || username || "Irvan Wibowo"}
                    </span>
                    <span className="text-xs text-zinc-400 truncate opacity-90">
                      {email || "irvanwibowo@studio.com"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <SquarePen className="w-4 h-4 text-zinc-400" />
                    <span>Edit account</span>
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                    <span>Watchlist</span>
                  </Link>
                  <Link
                    href="/download"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
                  >
                    <Download className="w-4 h-4 text-zinc-400" />
                    <span>Download</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-[#1c1f26] hover:text-white hover:bg-[#282d37]"
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
                className="w-full text-center py-2.5 rounded-xl text-sm uppercase tracking-wider text-zinc-200 bg-[#1c1f26] hover:bg-[#282d37] hover:text-white border border-white/10 transition-colors shadow-sm"
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

