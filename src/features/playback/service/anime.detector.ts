/**
 * Centralized Anime Identification & Detection Service
 *
 * Requirements:
 * - Do NOT detect Anime solely by checking title text search like title.includes("Anime").
 * - Use reliable existing data:
 *   1. Centralized TMDB ID registry of popular and well-known Anime franchises
 *   2. TMDB/Zeflix metadata:
 *      - Genre: "Animation" (ID 16) or "Anime"
 *      - Origin Country: "JP" or "Japan"
 *      - Original Language: "ja"
 *      - Production Companies (Toei Animation, MAPPA, Ufotable, Bones, Madhouse, etc.)
 * - Zero unnecessary external API calls if metadata is already present.
 * - Respect Super Sentai priority: Super Sentai must NEVER be misclassified as Anime.
 */

import {
  isSuperSentaiSeries,
  SuperSentaiMetadataCandidate,
} from "./super-sentai.detector";

export interface AnimeMetadataCandidate {
  tmdbId?: string | number;
  title?: string;
  originalName?: string;
  genres?: string[] | Array<{ id?: number; name?: string }>;
  originCountry?: string[];
  originalLanguage?: string;
  productionCompanyIds?: number[];
  productionCompanies?: Array<{ id: number; name: string }>;
  [key: string]: unknown;
}

/**
 * High-Confidence TMDB TV & Movie Registry for Notable Japanese Anime Franchises.
 * Allows instant O(1) detection without parsing or additional requests.
 */
export const POPULAR_ANIME_TMDB_IDS = new Set<number>([
  // Legendary / Shonen Classics
  37854,  // One Piece
  46260,  // Naruto
  31910,  // Naruto: Shippuden
  30984,  // Bleach
  209867, // Solo Leveling
  12609,  // Dragon Ball
  12971,  // Dragon Ball Z
  60625,  // Dragon Ball Super
  13916,  // Death Note
  31845,  // Fullmetal Alchemist: Brotherhood
  42,     // Fullmetal Alchemist (2003)
  46298,  // Hunter x Hunter (2011)
  34524,  // Hunter x Hunter (1999)
  65930,  // My Hero Academia
  4087,   // Cowboy Bebop
  30960,  // Yu Yu Hakusho
  60572,  // Pokémon

  // Modern Blockbusters
  1429,   // Attack on Titan (Shingeki no Kyojin)
  85937,  // Demon Slayer: Kimetsu no Yaiba
  95479,  // Jujutsu Kaisen
  114410, // Chainsaw Man
  120089, // SPY x FAMILY
  208241, // Frieren: Beyond Journey's End (Sousou no Frieren)
  203737, // Oshi no Ko
  83585,  // Vinland Saga
  67070,  // Mob Psycho 100
  63926,  // One-Punch Man
  61374,  // Tokyo Ghoul
  45782,  // Sword Art Online
  39483,  // Steins;Gate
  71914,  // That Time I Got Reincarnated as a Slime
  94664,  // Mushoku Tensei: Jobless Reincarnation
  87739,  // The Rising of the Shield Hero
  65942,  // Re:ZERO -Starting Life in Another World-
  66732,  // Dr. STONE
  80752,  // Fire Force
  75214,  // Black Clover
  68129,  // The Seven Deadly Sins
  79501,  // The Promised Neverland
  88040,  // Tokyo Revengers
  93405,  // Haikyu!!
  67178,  // JoJo's Bizarre Adventure
  85994,  // Overlord
  68349,  // KonoSuba: God's Blessing on this Wonderful World!
  80564,  // Neon Genesis Evangelion
  43814,  // Code Geass: Lelouch of the Rebellion
  88062,  // Blue Lock
  105248, // Cyberpunk: Edgerunners
  100088, // The Eminence in Shadow
  106454, // Hell's Paradise (Jigokuraku)
  215070, // Kaiju No. 8
  205324, // Dandadan

  // Notable Anime Movies (TMDB Movie IDs)
  372058, // Your Name. (Kimi no Na wa.)
  568124, // Weathering with You
  916224, // Suzume
  378064, // A Silent Voice (Koe no Katachi)
  128,    // Princess Mononoke
  129,    // Spirited Away
  4935,   // Howl's Moving Castle
  8392,   // My Neighbor Totoro
  149871, // The Wind Rises
  508965, // Klaus (animation, but check JP origin)
  635302, // Demon Slayer: Mugen Train
  823625, // Jujutsu Kaisen 0
  900667, // One Piece Film Red
  533514, // Violet Evergarden: The Movie
  10515,  // Castle in the Sky
  83533,  // Wolf Children
  15370,  // The Girl Who Leapt Through Time
  10494,  // Perfect Blue
]);

// Animation Genre TMDB ID
const TMDB_ANIMATION_GENRE_ID = 16;

// Major Japanese Anime Studio TMDB Company IDs
const JAPANESE_ANIME_STUDIO_IDS = new Set<number>([
  3341,   // Toei Animation
  5542,   // Toei Animation Inc.
  103,    // Studio Ghibli
  2883,   // Kyoto Animation
  2849,   // Bones
  3034,   // Madhouse
  3363,   // Production I.G
  6346,   // MAPPA
  20076,  // Ufotable
  14115,  // Wit Studio
  1778,   // Sunrise
  21644,  // CloverWorks
  19316,  // A-1 Pictures
  529,    // TMS Entertainment
  7164,   // J.C.Staff
  9148,   // Pierrot
  11875,  // David Production
  79978,  // Studio Trigger
  9455,   // Shaft
  9456,   // Gainax
]);

/**
 * Centralized function to determine whether content is an Anime (Japanese Animation).
 * Evaluates without requiring ad-hoc API queries.
 */
export function isAnimeContent(
  tmdbId: string | number,
  metadata?: AnimeMetadataCandidate | null
): boolean {
  // 1. Guard: Super Sentai always takes priority and is never Anime
  const sentaiMetadata: SuperSentaiMetadataCandidate | undefined = metadata
    ? {
        ...metadata,
        genres: Array.isArray(metadata.genres)
          ? metadata.genres
              .map((g) => (typeof g === "string" ? g : g?.name))
              .filter((g): g is string => Boolean(g))
          : undefined,
      }
    : undefined;

  if (isSuperSentaiSeries(tmdbId, sentaiMetadata)) {
    return false;
  }

  const numericId =
    typeof tmdbId === "number" ? tmdbId : parseInt(String(tmdbId).trim(), 10);

  // 2. Direct TMDB ID match in known anime registry
  if (!isNaN(numericId) && POPULAR_ANIME_TMDB_IDS.has(numericId)) {
    return true;
  }

  if (!metadata) {
    return false;
  }

  // 3. Extract and normalize genres
  const rawGenres = metadata.genres || [];
  const normalizedGenreNames = rawGenres.map((g) => {
    if (typeof g === "string") return g.trim().toLowerCase();
    if (typeof g === "object" && g !== null && "name" in g) {
      return String(g.name).trim().toLowerCase();
    }
    return "";
  });

  const hasAnimationGenre =
    normalizedGenreNames.includes("animation") ||
    normalizedGenreNames.includes("anime") ||
    rawGenres.some(
      (g) => typeof g === "object" && g !== null && "id" in g && g.id === TMDB_ANIMATION_GENRE_ID
    );

  // If it's explicitly tagged as "Anime" genre, it's anime
  if (normalizedGenreNames.includes("anime")) {
    return true;
  }

  // 4. Origin country and language check
  const originCountries = (metadata.originCountry || []).map((c) =>
    String(c).trim().toUpperCase()
  );
  const isJapanOrigin =
    originCountries.includes("JP") ||
    originCountries.includes("JAPAN") ||
    metadata.originalLanguage?.toLowerCase() === "ja";

  // If it is Animation produced in Japan or Japanese language -> It is Anime
  if (hasAnimationGenre && isJapanOrigin) {
    return true;
  }

  // 5. Studio / Production company check
  const companyIds = metadata.productionCompanyIds || [];
  if (companyIds.some((id) => JAPANESE_ANIME_STUDIO_IDS.has(id))) {
    return true;
  }

  const companies = metadata.productionCompanies || [];
  if (companies.some((c) => JAPANESE_ANIME_STUDIO_IDS.has(c.id))) {
    return true;
  }

  return false;
}
