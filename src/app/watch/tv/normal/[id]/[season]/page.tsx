import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    season: string;
  }>;
}

// Legacy redirect: /watch/tv/normal/[id]/[episode] -> /watch/tv/normal/[id]/1/[episode]
export default async function NormalTvWatchRedirect({ params }: PageProps) {
  const { id, season } = await params;
  redirect(`/watch/tv/normal/${id}/1/${season}`);
}