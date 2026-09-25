import { findPersonWithCreditsFromTMDB } from "../repository/person.repository";
import {
  PersonProfile,
  PersonCredit,
  FilmographyYearGroup,
  FilmographyMonthGroup,
  PersonFilmographyData,
} from "@/domain/person/person.types";
import { TMDBNotFoundError } from "@/infrastructure/tmdb/tmdb.client";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Normalizes TMDB date string (YYYY-MM-DD) into year, month (0-11), day and month name
 */
export function parseReleaseDate(dateStr?: string | null): {
  year: number | null;
  month: number | null;
  day: number | null;
  monthName: string;
} {
  if (!dateStr || typeof dateStr !== "string") {
    return { year: null, month: null, day: null, monthName: "" };
  }

  const parts = dateStr.split("-");
  if (parts.length < 1) {
    return { year: null, month: null, day: null, monthName: "" };
  }

  const year = parseInt(parts[0], 10);
  if (isNaN(year) || year < 1880 || year > 2200) {
    return { year: null, month: null, day: null, monthName: "" };
  }

  const month = parts.length > 1 ? parseInt(parts[1], 10) - 1 : null;
  const validMonth =
    month !== null && !isNaN(month) && month >= 0 && month <= 11
      ? month
      : null;

  const day = parts.length > 2 ? parseInt(parts[2], 10) : null;
  const validDay =
    day !== null && !isNaN(day) && day >= 1 && day <= 31 ? day : null;

  return {
    year,
    month: validMonth,
    day: validDay,
    monthName: validMonth !== null ? MONTH_NAMES[validMonth] : "",
  };
}

/**
 * Groups a list of credits chronologically by Year (descending) and Month (descending)
 */
export function groupCreditsByYearAndMonth(
  credits: PersonCredit[]
): FilmographyYearGroup[] {
  const yearMap = new Map<number, Map<number, PersonCredit[]>>();

  credits.forEach((credit) => {
    if (credit.year === null) return;

    if (!yearMap.has(credit.year)) {
      yearMap.set(credit.year, new Map<number, PersonCredit[]>());
    }

    const monthMap = yearMap.get(credit.year)!;
    // For credits with year but no valid month, group under month -1
    const monthKey = credit.month !== null ? credit.month : -1;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }

    monthMap.get(monthKey)!.push(credit);
  });

  // Sort years descending (newest -> oldest)
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);

  return sortedYears.map((year) => {
    const monthMap = yearMap.get(year)!;
    // Sort months descending (11 down to 0, with -1 at bottom)
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);

    const monthGroups: FilmographyMonthGroup[] = sortedMonths.map((mKey) => {
      const monthCredits = monthMap.get(mKey)!;
      // Sort credits within month by releaseDate descending, or popularity
      monthCredits.sort((a, b) => {
        if (a.releaseDate && b.releaseDate) {
          const comp = b.releaseDate.localeCompare(a.releaseDate);
          if (comp !== 0) return comp;
        }
        return b.popularity - a.popularity;
      });

      return {
        year,
        month: mKey >= 0 ? mKey : 0,
        monthName: mKey >= 0 ? MONTH_NAMES[mKey] : "Release",
        credits: monthCredits,
      };
    });

    return {
      year,
      months: monthGroups,
    };
  });
}

/**
 * Fetches and orchestrates full Person profile and filmography data
 */
export async function getPersonDetailsService(
  personId: string
): Promise<PersonFilmographyData | null> {
  try {
    const raw = await findPersonWithCreditsFromTMDB(personId);
    if (!raw || !raw.id) return null;

    // 1. Person Profile
    const person: PersonProfile = {
      id: String(raw.id),
      name: raw.name || "Unknown",
      biography: raw.biography ? raw.biography.trim() : "",
      birthday: raw.birthday || null,
      deathday: raw.deathday || null,
      placeOfBirth: raw.place_of_birth || null,
      avatar: raw.profile_path
        ? `https://image.tmdb.org/t/p/h632${raw.profile_path}`
        : "",
      knownForDepartment: raw.known_for_department || "Acting",
      gender: raw.gender || 0,
    };

    // 2. Credits extraction: Prioritize acting credits (cast)
    const rawCast = raw.combined_credits?.cast || [];
    const rawCrew = raw.combined_credits?.crew || [];

    // Filter out clutter (Self, archive footage, uncredited cameos, etc.)
    const clutterRegex =
      /^(self|himself|herself|themself|archive footage|archival footage)$/i;

    const filteredCast = rawCast.filter((c) => {
      // Must be movie or tv
      if (c.media_type !== "movie" && c.media_type !== "tv") return false;
      const char = (c.character || "").trim();
      if (clutterRegex.test(char)) return false;
      return true;
    });

    // If no cast credits exist (e.g. Director/Writer), fallback to directing/writing crew credits
    const sourceCredits =
      filteredCast.length > 0
        ? filteredCast
        : rawCrew.filter(
            (c) =>
              (c.media_type === "movie" || c.media_type === "tv") &&
              (c.department === "Directing" || c.department === "Writing")
          );

    // Deduplicate by ID and media_type
    const seen = new Set<string>();
    const deduplicated: typeof sourceCredits = [];

    sourceCredits.forEach((item) => {
      const key = `${item.media_type}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];

    // Normalize credits
    const allCredits: PersonCredit[] = deduplicated.map((c) => {
      const releaseDate = (c.release_date || c.first_air_date || "").trim();
      const parsed = parseReleaseDate(releaseDate);

      const isUpcoming = Boolean(releaseDate && releaseDate > todayStr);
      const isRecentlyReleased = Boolean(
        releaseDate &&
          releaseDate <= todayStr &&
          releaseDate >= oneYearAgoStr
      );

      const status: "COMING SOON" | "RELEASED" = isUpcoming
        ? "COMING SOON"
        : "RELEASED";

      const title = c.title || c.name || "Untitled";
      const character = (c.character || c.department || "").trim();

      return {
        id: String(c.id),
        title,
        character,
        mediaType: c.media_type,
        releaseDate,
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        monthName: parsed.monthName,
        poster: c.poster_path
          ? `https://image.tmdb.org/t/p/w500${c.poster_path}`
          : "",
        backdrop: c.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${c.backdrop_path}`
          : "",
        rating: c.vote_average ? Number(c.vote_average.toFixed(1)) : 0,
        voteCount: c.vote_count || 0,
        popularity: c.popularity || 0,
        status,
        isUpcoming,
        isRecentlyReleased,
      };
    });

    // 3. Known For: Representative credits with posters, sorted by popularity / voteCount
    const knownForCandidates = allCredits.filter(
      (c) => c.poster && c.title && c.title !== "Untitled"
    );

    knownForCandidates.sort((a, b) => {
      // Balance popularity with vote count
      const scoreA = a.popularity + (a.voteCount > 50 ? 50 : a.voteCount);
      const scoreB = b.popularity + (b.voteCount > 50 ? 50 : b.voteCount);
      return scoreB - scoreA;
    });

    const knownFor = knownForCandidates.slice(0, 10);

    // 4. Upcoming group
    const upcomingCredits = allCredits.filter((c) => c.isUpcoming);
    const upcoming = groupCreditsByYearAndMonth(upcomingCredits);

    // 5. Recently Released group
    const recentlyReleasedCredits = allCredits.filter(
      (c) => c.isRecentlyReleased
    );
    const recentlyReleased = groupCreditsByYearAndMonth(recentlyReleasedCredits);

    // 6. Full Filmography (all credits with valid date, sorted newest -> oldest)
    const validDateCredits = allCredits.filter((c) => c.year !== null);
    const fullFilmography = groupCreditsByYearAndMonth(validDateCredits);

    // 7. Unknown Date credits
    const unknownDateCredits = allCredits.filter((c) => c.year === null);

    return {
      person,
      knownFor,
      allCredits,
      upcoming,
      recentlyReleased,
      fullFilmography,
      unknownDateCredits,
      totalCredits: allCredits.length,
    };
  } catch (error) {
    if (error instanceof TMDBNotFoundError) {
      return null;
    }
    console.error(`[PersonService] Failed to load person ${personId}:`, error);
    throw error;
  }
}
