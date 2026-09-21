import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import {
  getMovieDetailService,
  getTVSeriesDetailService,
} from "@/features/movie/service/movie.service";
import MovieDetailView from "@/components/detail/MovieDetailView";

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
    const movie = await getMovieDetailService(id);
    if (movie) {
      return {
        title: `${movie.title} (${movie.year || ""}) | Zeflix`,
        description: movie.description || "Stream on Zeflix",
        openGraph: {
          title: movie.title,
          description: movie.description,
          images: movie.backdrop ? [movie.backdrop] : [],
        },
      };
    }
    const tv = await getTVSeriesDetailService(id);
    if (tv) {
      return {
        title: `${tv.title} (${tv.year || ""}) | Zeflix`,
        description: tv.description || "Stream on Zeflix",
      };
    }
    return {
      title: "Movie Not Found | Zeflix",
    };
  } catch {
    return {
      title: "Movie | Zeflix",
    };
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const movie = await getMovieDetailService(id);

  if (!movie) {
    // Check if this ID is actually a TV Series and redirect gracefully!
    const tv = await getTVSeriesDetailService(id);
    if (tv) {
      redirect(`/tv/${id}`);
    }
    notFound();
  }

  return <MovieDetailView movie={movie} />;
}
