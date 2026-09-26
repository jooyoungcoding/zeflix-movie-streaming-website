import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    season: string;
  }>;
}

// Legacy redirect: /watch/tv/anime/[id]/[episode] -> /watch/tv/anime/[id]/1/[episode]
export default async function AnimeTvWatchRedirect({ params }: PageProps) {
  const { id, season } = await params;
  redirect(`/watch/tv/anime/${id}/1/${season}`);
}