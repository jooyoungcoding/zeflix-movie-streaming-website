export interface PersonProfile {
  id: string;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  avatar: string;
  knownForDepartment: string;
  gender: number;
}

export interface PersonCredit {
  id: string;
  title: string;
  character: string;
  mediaType: "movie" | "tv";
  releaseDate: string;
  year: number | null;
  month: number | null; // 0 - 11
  day: number | null;
  monthName: string;
  poster: string;
  backdrop: string;
  rating: number;
  voteCount: number;
  popularity: number;
  status: "COMING SOON" | "RELEASED";
  isUpcoming: boolean;
  isRecentlyReleased: boolean;
}

export interface FilmographyMonthGroup {
  year: number;
  month: number;
  monthName: string;
  credits: PersonCredit[];
}

export interface FilmographyYearGroup {
  year: number;
  months: FilmographyMonthGroup[];
}

export interface PersonFilmographyData {
  person: PersonProfile;
  knownFor: PersonCredit[];
  allCredits: PersonCredit[];
  upcoming: FilmographyYearGroup[];
  recentlyReleased: FilmographyYearGroup[];
  fullFilmography: FilmographyYearGroup[];
  unknownDateCredits: PersonCredit[];
  totalCredits: number;
}

export interface PersonDetailResponse {
  data: PersonFilmographyData;
}
