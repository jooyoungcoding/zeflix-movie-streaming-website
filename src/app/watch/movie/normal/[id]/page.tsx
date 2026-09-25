import SharedMovieWatchPage from "@/components/watch/SharedMovieWatchPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NormalMovieWatchPage({ params }: PageProps) {
  const { id } = await params;
  return <SharedMovieWatchPage id={id} category="normal" />;
}
