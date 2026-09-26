import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    season: string;
  }>;
}

// Legacy redirect: /watch/tv/sentai/[id]/[episode] -> /watch/tv/sentai/[id]/1/[episode]
export default async function SentaiTvWatchRedirect({ params }: PageProps) {
  const { id, season } = await params;
  redirect(`/watch/tv/sentai/${id}/1/${season}`);
}