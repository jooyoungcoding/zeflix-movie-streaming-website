import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPersonDetailsService } from "@/features/person/service/person.service";
import PersonDetailView from "@/components/person/PersonDetailView";

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
    const data = await getPersonDetailsService(id);
    if (data?.person) {
      return {
        title: `${data.person.name} | Zeflix`,
        description:
          data.person.biography?.slice(0, 160) ||
          `Explore movies and TV shows featuring ${data.person.name} on Zeflix.`,
        openGraph: {
          title: `${data.person.name} - Filmography | Zeflix`,
          description:
            data.person.biography?.slice(0, 160) ||
            `Explore movies and TV shows featuring ${data.person.name} on Zeflix.`,
          images: data.person.avatar ? [data.person.avatar] : [],
        },
      };
    }
    return {
      title: "Person Not Found | Zeflix",
    };
  } catch {
    return {
      title: "Cast & Crew | Zeflix",
    };
  }
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialData = await getPersonDetailsService(id);

  if (!initialData) {
    notFound();
  }

  return <PersonDetailView personId={id} initialData={initialData} />;
}
