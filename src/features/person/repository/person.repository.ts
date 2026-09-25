import { getPersonDetailsFull } from "@/infrastructure/tmdb/tmdb.person";
import { TMDBPersonDetails } from "@/infrastructure/tmdb/tmdb.types";

/**
 * Fetches person information along with combined credits from TMDB
 */
export const findPersonWithCreditsFromTMDB = async (
  personId: string | number
): Promise<TMDBPersonDetails> => {
  return await getPersonDetailsFull(personId);
};
