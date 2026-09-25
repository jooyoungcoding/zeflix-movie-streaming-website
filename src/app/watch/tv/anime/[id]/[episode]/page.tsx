import SharedTvWatchPage from "@/components/watch/SharedTvWatchPage";

interface PageProps {
  params: Promise<{
    id: string;
    episode: string;
  }>;
}

export default async function AnimeTvWatchPage({ params }: PageProps) {
  const { id, episode } = await params;
  return <SharedTvWatchPage id={id} episode={episode} category="anime" />;
}
