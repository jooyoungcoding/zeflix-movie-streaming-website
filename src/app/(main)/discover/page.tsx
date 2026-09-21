import { Suspense } from "react";
import { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import PopularOfWeek from "@/components/PopularOfWeek";
import BrowseSection from "@/components/BrowseSection";

export const metadata: Metadata = {
  title: "Discover Movies & TV Series | Zeflix",
  description:
    "Explore trending, upcoming movies and top popular TV shows of the week on Zeflix.",
};

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden pb-20">
      {/* Hero Section Carousel */}
      <HeroSlider />

      {/* Popular of the Week Section */}
      <div className="pt-4">
        <PopularOfWeek />
      </div>

      {/* Main Browse Movies & TV Series Grid Section */}
      <div className="pt-6">
        <Suspense fallback={<div className="w-full h-96 animate-pulse bg-zinc-900/30 rounded-2xl" />}>
          <BrowseSection />
        </Suspense>
      </div>
    </main>
  );
}

