import { PersonDetailResponse } from "@/domain/person/person.types";
import { getPersonDetailsService } from "../service/person.service";

/**
 * Controller handling Person detail and filmography requests
 */
export const getPersonDetailController = async (
  personId: string
): Promise<PersonDetailResponse | null> => {
  const data = await getPersonDetailsService(personId);
  if (!data) return null;
  return {
    data,
  };
};
