import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
    Film,
    Tv,
    ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "About Us | Zeflix",
    description:
        "Discover the story behind Zeflix, our mission to deliver the ultimate cinematic streaming experience, and the passionate team bringing global cinema closer to you.",
};

const STATS = [
    {
        number: "900K+",
        label: "Movies & TV Series",
        description: "Extensive catalog from global studios",
    },
    {
        number: "180+",
        label: "Countries & Regions",
        description: "Worldwide release tracking & content",
    },
    {
        number: "100%",
        label: "Free & Accessible",
        description: "Entertainment crafted for everyone",
    },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#07090e] text-white pb-24 overflow-hidden">
            {/* 1. HERO BANNER */}
            <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden min-h-[420px] sm:min-h-[500px] flex items-center">
                {/* Background Artwork Backdrop */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="relative h-full w-full opacity-40 sm:opacity-50">
                        <Image
                            src="/Images/release2.jpg"
                            alt="Zeflix Cinema World"
                            fill
                            className="object-cover object-center scale-105"
                            priority
                            sizes="100vw"
                        />
                    </div>
                    {/* Cinematic Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/20 to-transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="max-w-3xl space-y-4 sm:space-y-6">
                        {/* Pill Badge with Logo */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wider uppercase font-custom2">
                            <div className="relative w-7 h-7 shrink-0">
                                <Image
                                    src="/Logo/Logo.png"
                                    alt="Zeflix Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span>About Zeflix</span>
                        </div>

                        {/* Title with font-custom2 */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-custom2 drop-shadow-lg">
                            Reimagining The Way You Experience Cinema
                        </h1>

                        {/* Content description with regular font */}
                        <p className="text-zinc-300 text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
                            Zeflix was created with a single mission: to provide film lovers
                            with a modern, high-speed, and immersive platform to discover,
                            explore, and stream the world’s finest movies and television series.
                        </p>

                        {/* Quick Action Buttons (No Shadow) */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href="/discover"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm sm:text-base font-custom2 transition-all cursor-pointer"
                            >
                                <span>Explore</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/release"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm sm:text-base font-custom2 border border-white/10 transition-all cursor-pointer backdrop-blur-sm"
                            >
                                <span>View Release</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. STATS SECTION */}
            <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 z-20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="p-5 sm:p-6 rounded-2xl bg-[#0f1218]/90 border border-white/10 backdrop-blur-md shadow-xl hover:border-emerald-500/40 transition-all group"
                        >
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-emerald-400 font-custom2 tracking-tight group-hover:scale-105 transition-transform duration-300">
                                {stat.number}
                            </div>
                            <div className="text-sm sm:text-base font-semibold text-white mt-1">
                                {stat.label}
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal leading-relaxed">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. OUR STORY SECTION */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
                    {/* Left Text Block */}
                    <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-400 uppercase tracking-widest font-custom2">
                            <span>Behind The Screen</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white font-custom2 leading-tight">
                            Our Journey & Passion For Great Stories
                        </h2>

                        <div className="space-y-4 text-zinc-300 text-sm sm:text-base font-normal leading-relaxed">
                            <p>
                                In an era where digital content is scattered across dozens of
                                walled platforms, finding something truly great to watch has become
                                more frustrating than ever. Zeflix started as a visionary project
                                to simplify and elevate that experience.
                            </p>
                            <p>
                                We gathered the best film databases, streaming infrastructures,
                                and intuitive design principles to craft a cinematic portal.
                                Whether you want to discover legendary film classics, catch up on
                                weekly episodes of popular series, or keep an eye on upcoming
                                releases worldwide, Zeflix brings everything into one unified,
                                responsive, and aesthetic interface.
                            </p>
                            <p>
                                Every day, our platform handles real-time movie metadata, reviews,
                                video player servers, and personalized user lists—ensuring you
                                spend less time searching and more time enjoying the magic of
                                motion pictures.
                            </p>
                        </div>

                        {/* Highlights List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0f1218] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                                    <Film className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white font-custom2">
                                        Comprehensive Library
                                    </h4>
                                    <p className="text-xs text-zinc-400 font-normal mt-0.5">
                                        Synced with international film databases.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0f1218] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                                    <Tv className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white font-custom2">
                                        Multi-Device Support
                                    </h4>
                                    <p className="text-xs text-zinc-400 font-normal mt-0.5">
                                        Seamless across mobile, tablet, and desktop.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual Card */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f1218] aspect-[4/5] sm:aspect-[3/4] max-w-md">
                            <Image
                                src="/Images/release1.jpg"
                                alt="Cinema Visual"
                                fill
                                className="object-cover object-center brightness-75 hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-2">
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold font-custom2 uppercase tracking-wide">
                                    Cinema First
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white font-custom2">
                                    Crafted for Cinephiles
                                </h3>
                                <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                                    Every feature, gradient, and animation is designed to put the
                                    movie at the center of attention.
                                </p>
                            </div>
                        </div>

                        {/* Ambient Backlight */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                    </div>
                </div>
            </section>
        </main>
    );
}
