"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="fixed inset-0 z-[60] min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-y-auto text-white px-4 py-12 select-none">
      {/* Starfield Background */}
      <div
        className="absolute inset-0 bg-black bg-[url('/Images/stars.png')] bg-repeat bg-center opacity-90 pointer-events-none"
        style={{ backgroundSize: "600px 600px" }}
      />

      {/* Floating Background Planets */}
      {/* Top Small Planet */}
      <div className="absolute top-[10%] left-[36%] w-6 h-6 sm:w-8 sm:h-8 opacity-80 pointer-events-none">
        <Image
          src="/Images/planet-01.png"
          alt="Planet"
          width={32}
          height={32}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Bottom Left Medium Planet */}
      <div className="absolute bottom-[26%] left-[10%] sm:left-[12%] w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 opacity-85 pointer-events-none">
        <Image
          src="/Images/planet-01.png"
          alt="Planet"
          width={88}
          height={88}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Bottom Right Planet */}
      <div className="absolute bottom-[5%] right-[10%] sm:right-[14%] w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 opacity-85 pointer-events-none">
        <Image
          src="/Images/planet-01.png"
          alt="Planet"
          width={96}
          height={96}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl w-full">
        {/* 404 Graphic Composition */}
        <div className="relative flex items-center justify-center select-none mb-6 sm:mb-8">
          {/* Left '4' */}
          <div className="relative w-28 sm:w-36 md:w-44 h-36 sm:h-48 md:h-56 shrink-0 flex items-center justify-end -mr-4 sm:-mr-6 z-0">
            <Image
              src="/Images/4-left.png"
              alt="4"
              width={176}
              height={224}
              className="w-full h-auto object-contain pointer-events-none drop-shadow-md"
              priority
            />
          </div>

          {/* Center Planet '0' with Astronaut, Tether and Rocket */}
          <div className="relative w-32 sm:w-44 md:w-52 h-32 sm:h-44 md:h-52 shrink-0 flex items-center justify-center z-10">
            {/* Red Planet */}
            <div className="relative w-full h-full">
              <Image
                src="/Images/planet-01.png"
                alt="Planet"
                width={208}
                height={208}
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_25px_rgba(180,40,30,0.35)]"
                priority
              />
            </div>

            {/* Spaceman sitting on top of planet */}
            <div className="absolute -top-12 sm:-top-16 md:-top-20 left-1/2 -translate-x-[45%] w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 z-20 pointer-events-none">
              <Image
                src="/Images/spaceman.png"
                alt="Astronaut"
                width={128}
                height={128}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Tether Connecting Cord */}
            <div className="absolute -top-14 sm:-top-20 md:-top-24 left-[58%] sm:left-[60%] w-28 sm:w-40 md:w-48 h-16 sm:h-24 md:h-28 z-10 pointer-events-none">
              <Image
                src="/Images/tether.png"
                alt="Tether"
                width={192}
                height={112}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Flying Rocket */}
            <div className="absolute -top-20 sm:-top-28 md:-top-36 -right-16 sm:-right-24 md:-right-32 w-16 sm:w-22 md:w-28 h-16 sm:h-22 md:h-28 z-20 pointer-events-none">
              <Image
                src="/Images/Rocket.png"
                alt="Rocket"
                width={112}
                height={112}
                className="w-full h-full object-contain -rotate-12"
                priority
              />
            </div>
          </div>

          {/* Right '4' */}
          <div className="relative w-28 sm:w-36 md:w-44 h-36 sm:h-48 md:h-56 shrink-0 flex items-center justify-start -ml-4 sm:-ml-6 z-0">
            <Image
              src="/Images/4-right.png"
              alt="4"
              width={176}
              height={224}
              className="w-full h-auto object-contain pointer-events-none drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* Text Section (using font-custom2 / MyFont3) */}
        <div
          className="text-center space-y-2 mb-6 sm:mb-7 font-custom2"
          style={{ fontFamily: "'MyFont3', sans-serif" }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-white">
            OOPS!
          </h1>
          <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] text-zinc-300">
            PAGE NOT FOUND
          </p>
        </div>

        {/* 2 Buttons Section (using font-custom1 / MyFont2) */}
        <div
          className="flex items-center gap-3 sm:gap-4 font-custom1"
          style={{ fontFamily: "'MyFont2', sans-serif" }}
        >
          <Link
            href="/"
            className="px-5 py-1.5 sm:px-6 sm:py-2 rounded-md border border-white/40 hover:border-white text-xs sm:text-[13px] uppercase tracking-wider text-zinc-200 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95"
          >
            GO HOME
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-1.5 sm:px-6 sm:py-2 rounded-md border border-white/40 hover:border-white text-xs sm:text-[13px] uppercase tracking-wider text-zinc-200 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            GO BACK
          </button>
        </div>
      </div>
    </main>
  );
}

