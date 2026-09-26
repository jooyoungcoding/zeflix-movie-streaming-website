import SharedTvWatchPage from "@/components/watch/SharedTvWatchPage";

interface PageProps {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
}

export default async function SentaiTvWatchPage({ params }: PageProps) {
  const { id, season, episode } = await params;
  return <SharedTvWatchPage id={id} season={season} episode={episode} category="sentai" />;
}