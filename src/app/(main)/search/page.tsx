import { Suspense } from "react";
import { Metadata } from "next";
import SearchContent from "@/components/SearchContent";

export const metadata: Metadata = {
  title: "Search Movies & TV Series | Zeflix",
  description:
    "Search your favorite movies, series, anime, and actors on Zeflix with instant results.",
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden pt-10 sm:pt-14 lg:pt-16 pb-24">
      <Suspense
        fallback={
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="h-10 w-48 bg-zinc-800/60 rounded-xl mb-8 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-2xl bg-zinc-800/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
