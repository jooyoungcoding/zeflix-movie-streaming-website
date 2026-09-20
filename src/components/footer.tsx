"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on login, register, verify and not-found pages
    if (
        pathname === "/verify" ||
        pathname === "/not-found" ||
        pathname === "/404"
    ) {
        return null;
    }

    return (
        <footer className="w-full bg-black border-t border-white/[0.08] text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12 flex flex-col space-y-8 sm:space-y-10">
                {/* Brand Top Section */}
                <div className="flex flex-col space-y-2">
                    <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 group shrink-0">
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                            <Image
                                src="/Logo/Logo.png"
                                alt="ZEFLIX Logo"
                                width={40}
                                height={40}
                                className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
                            />
                        </div>
                        <span className="text-2xl sm:text-[28px] font-bold tracking-wider text-white font-logo select-none leading-none">
                            ZEFLIX
                        </span>
                    </Link>
                    <p className="text-zinc-400 text-sm sm:text-base font-normal font-custom2">
                        Movies and Series for your next watch.
                    </p>
                </div>

                {/* 3 Columns Navigation Links Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 max-w-3xl pt-2">
                    {/* Column 1: Explore */}
                    <div className="flex flex-col space-y-3.5">
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-wide font-custom2">
                            Explore
                        </h4>
                        <ul className="flex flex-col space-y-2.5 font-custom1 text-sm text-zinc-400">
                            <li>
                                <Link
                                    href="/movies"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Movies
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/series"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Series
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/countries"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Countries
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/genres"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Genres
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Support */}
                    <div className="flex flex-col space-y-3.5">
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-wide font-custom2">
                            Support
                        </h4>
                        <ul className="flex flex-col space-y-2.5 font-custom1 text-sm text-zinc-400">
                            <li>
                                <Link
                                    href="/help"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Zeflix */}
                    <div className="flex flex-col space-y-3.5">
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-wide font-custom2">
                            Zeflix
                        </h4>
                        <ul className="flex flex-col space-y-2.5 font-custom1 text-sm text-zinc-400">
                            <li>
                                <Link
                                    href="/about"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-white/10" />

                {/* Bottom Bar */}
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-zinc-400">
                        {/* Copyright */}
                        <p className="font-medium font-custom1">2026 ZEFLIX</p>

                        {/* Social Follow */}
                        <div className="flex items-center gap-3 font-custom1">
                            <span className="text-zinc-400">Follow us:</span>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center transition-transform duration-200 hover:scale-110 opacity-80 hover:opacity-100 cursor-pointer"
                                    aria-label="Facebook"
                                >
                                    <Image
                                        src="/Images/facebook.png"
                                        alt="Facebook"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 object-contain"
                                    />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center transition-transform duration-200 hover:scale-110 opacity-80 hover:opacity-100 cursor-pointer"
                                    aria-label="Instagram"
                                >
                                    <Image
                                        src="/Images/instagram.png"
                                        alt="Instagram"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 object-contain"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* TMDB Attribution */}
                    <p className="text-xs text-zinc-500 font-custom1">
                        Movie data & images provided by TMDB
                    </p>
                </div>
            </div>
        </footer>
    );
}
