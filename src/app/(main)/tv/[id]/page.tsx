import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import {
  getTVSeriesDetailService,
  getMovieDetailService,
} from "@/features/movie/service/movie.service";
import TVSeriesDetailView from "@/components/detail/TVSeriesDetailView";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const tv = await getTVSeriesDetailService(id);
    if (tv) {
      return {
        title: `${tv.title} (${tv.year || ""}) | Zeflix`,
        description: tv.description || "Stream on Zeflix",
        openGraph: {
          title: tv.title,
          description: tv.description,
          images: tv.backdrop ? [tv.backdrop] : [],
        },
      };
    }
    const movie = await getMovieDetailService(id);
    if (movie) {
      return {
        title: `${movie.title} (${movie.year || ""}) | Zeflix`,
        description: movie.description || "Stream on Zeflix",
      };
    }
    return {
      title: "TV Series Not Found | Zeflix",
    };
  } catch {
    return {
      title: "TV Series | Zeflix",
    };
  }
}

export default async function TVSeriesDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tv = await getTVSeriesDetailService(id);

  if (!tv) {
    // Check if this ID is actually a Movie and redirect gracefully!
    const movie = await getMovieDetailService(id);
    if (movie) {
      redirect(`/movies/${id}`);
    }
    notFound();
  }

  return <TVSeriesDetailView tv={tv} />;
}
