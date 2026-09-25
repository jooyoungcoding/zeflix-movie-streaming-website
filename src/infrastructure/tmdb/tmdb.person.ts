import { fetchFromTMDB } from "./tmdb.client";
import { TMDBPersonDetails } from "./tmdb.types";

/**
 * Fetches person details including combined credits (movies and TV) in a single request
 */
export async function getPersonDetailsFull(
  personId: number | string
): Promise<TMDBPersonDetails> {
  return fetchFromTMDB<TMDBPersonDetails>(`/person/${personId}`, {
    append_to_response: "combined_credits",
    language: "en-US",
  });
}
