import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TVWatchDefaultPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/watch/tv/${id}/1/1`);
}
