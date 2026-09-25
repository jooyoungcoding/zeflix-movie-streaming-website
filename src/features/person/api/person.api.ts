import {
  PersonFilmographyData,
  PersonDetailResponse,
} from "@/domain/person/person.types";

/**
 * Client API for fetching person profile and normalized filmography
 */
export async function fetchPersonDetail(
  personId: string
): Promise<PersonFilmographyData> {
  const res = await fetch(`/api/person/${personId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("PERSON_NOT_FOUND");
    }
    throw new Error(`Failed to fetch person detail: ${res.status}`);
  }

  const json: PersonDetailResponse = await res.json();
  return json.data;
}
