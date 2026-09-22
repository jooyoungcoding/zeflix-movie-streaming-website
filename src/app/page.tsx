import HeroSlider from "@/components/HeroSlider";
import WelcomeModal from "@/components/WelcomeModal";
import JustRelease from "@/components/JustRelease";
import PopularOfWeek from "@/components/PopularOfWeek";
import FeaturedInZeflix from "@/components/FeaturedInZeflix";
import MoviesSection from "@/components/MoviesSection";
import SeriesSection from "@/components/SeriesSection";
import BrowseByCountry from "@/components/BrowseByCountry";
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden pb-20">
      {/* Welcome Space Popup */}
      <WelcomeModal />

      {/* Hero Section Carousel (5 Movies Slider) */}
      <HeroSlider />

      {/* Just Release Section */}
      <JustRelease />

      {/* Popular of the week Section */}
      <PopularOfWeek />

      {/* Featured in Zeflix Section */}
      <FeaturedInZeflix />

      {/* Movies Section */}
      <MoviesSection />

      {/* Series Section */}
      <SeriesSection />

      {/* Browse By Country Section */}
      <BrowseByCountry />
    </main>
  );
}
