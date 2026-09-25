/**
 * Centralized Anime ID Mapper Service
 *
 * Maps TMDB Anime IDs & Titles to MyAnimeList (MAL) IDs required by Yenime.
 *
 * Architecture:
 * 1. Fast O(1) in-memory registry for popular anime franchises.
 * 2. Dynamic, lightweight AniList GraphQL resolver for unmapped titles / multi-seasons.
 * 3. In-memory LRU/map cache to prevent duplicate external requests.
 * 4. Graceful null return if unmapped, allowing instant fallback to VidLink.
 */

// Well-known TMDB TV/Movie ID -> MAL Anime ID Map
const TMDB_TO_MAL_REGISTRY: Record<number, number> = {
  // Classics & Long-Running
  37854: 21,      // One Piece -> MAL 21
  46260: 20,      // Naruto -> MAL 20
  31910: 1735,    // Naruto Shippuden -> MAL 1735
  30984: 269,     // Bleach -> MAL 269
  209867: 52299,  // Solo Leveling -> MAL 52299
  12609: 223,     // Dragon Ball -> MAL 223
  12971: 813,     // Dragon Ball Z -> MAL 813
  60625: 30694,   // Dragon Ball Super -> MAL 30694
  13916: 1535,    // Death Note -> MAL 1535
  31845: 5114,    // Fullmetal Alchemist: Brotherhood -> MAL 5114
  42: 121,        // Fullmetal Alchemist (2003) -> MAL 121
  46298: 11061,   // Hunter x Hunter (2011) -> MAL 11061
  34524: 136,     // Hunter x Hunter (1999) -> MAL 136
  65930: 31964,   // My Hero Academia -> MAL 31964
  4087: 1,        // Cowboy Bebop -> MAL 1
  30960: 392,     // Yu Yu Hakusho -> MAL 392
  60572: 527,     // Pokémon -> MAL 527

  // Modern Hits
  1429: 16498,    // Attack on Titan S1 -> MAL 16498
  85937: 38000,   // Demon Slayer: Kimetsu no Yaiba -> MAL 38000
  95479: 40748,   // Jujutsu Kaisen S1 -> MAL 40748
  114410: 44511,  // Chainsaw Man -> MAL 44511
  120089: 50273,  // SPY x FAMILY -> MAL 50273
  208241: 52991,  // Frieren: Beyond Journey's End -> MAL 52991
  203737: 52034,  // Oshi no Ko -> MAL 52034
  83585: 37521,   // Vinland Saga S1 -> MAL 37521
  67070: 32182,   // Mob Psycho 100 S1 -> MAL 32182
  63926: 30276,   // One-Punch Man S1 -> MAL 30276
  61374: 22319,   // Tokyo Ghoul -> MAL 22319
  45782: 11757,   // Sword Art Online S1 -> MAL 11757
  39483: 9253,    // Steins;Gate -> MAL 9253
  71914: 37430,   // That Time I Got Reincarnated as a Slime S1 -> MAL 37430
  94664: 39535,   // Mushoku Tensei: Jobless Reincarnation S1 -> MAL 39535
  87739: 35790,   // The Rising of the Shield Hero S1 -> MAL 35790
  65942: 31240,   // Re:ZERO S1 -> MAL 31240
  66732: 38691,   // Dr. STONE S1 -> MAL 38691
  80752: 38671,   // Fire Force S1 -> MAL 38671
  75214: 34572,   // Black Clover -> MAL 34572
  68129: 23755,   // The Seven Deadly Sins -> MAL 23755
  79501: 37779,   // The Promised Neverland S1 -> MAL 37779
  88040: 42249,   // Tokyo Revengers S1 -> MAL 42249
  93405: 20583,   // Haikyu!! S1 -> MAL 20583
  67178: 14719,   // JoJo's Bizarre Adventure (2012) -> MAL 14719
  85994: 29803,   // Overlord S1 -> MAL 29803
  68349: 30831,   // KonoSuba S1 -> MAL 30831
  80564: 30,      // Neon Genesis Evangelion -> MAL 30
  43814: 1575,    // Code Geass: Lelouch of the Rebellion -> MAL 1575
  88062: 49596,   // Blue Lock -> MAL 49596
  105248: 42310,  // Cyberpunk: Edgerunners -> MAL 42310
  100088: 48316,  // The Eminence in Shadow S1 -> MAL 48316
  106454: 46569,  // Hell's Paradise -> MAL 46569
  215070: 52588,  // Kaiju No. 8 -> MAL 52588
  205324: 57334,  // Dandadan -> MAL 57334

  // Notable Anime Movies (TMDB Movie IDs)
  372058: 32281,  // Your Name. -> MAL 32281
  568124: 38826,  // Weathering with You -> MAL 38826
  916224: 50594,  // Suzume -> MAL 50594
  378064: 28851,  // A Silent Voice -> MAL 28851
  128: 164,       // Princess Mononoke -> MAL 164
  129: 199,       // Spirited Away -> MAL 199
  4935: 431,      // Howl's Moving Castle -> MAL 431
  8392: 523,      // My Neighbor Totoro -> MAL 523
  149871: 16662,  // The Wind Rises -> MAL 16662
  635302: 40456,  // Demon Slayer: Mugen Train -> MAL 40456
  823625: 48569,  // Jujutsu Kaisen 0 -> MAL 48569
  900667: 50410,  // One Piece Film Red -> MAL 50410
  533514: 37987,  // Violet Evergarden: The Movie -> MAL 37987
  10515: 513,     // Castle in the Sky -> MAL 513
  83533: 12355,   // Wolf Children -> MAL 12355
  15370: 2236,    // The Girl Who Leapt Through Time -> MAL 2236
  10494: 437,     // Perfect Blue -> MAL 437
};

// Runtime memory cache: search key -> mal_id
const runtimeMalCache = new Map<string, number | null>();

/**
 * Resolves MyAnimeList (MAL) ID for a given anime title / TMDB ID / Season
 */
export async function resolveAnimeMalId(
  tmdbId: string | number,
  title?: string,
  seasonNumber: number = 1
): Promise<number | null> {
  const numericTmdbId =
    typeof tmdbId === "number" ? tmdbId : parseInt(String(tmdbId).trim(), 10);

  // 1. If Season 1 and present in direct TMDB registry, return immediately O(1)
  if (seasonNumber <= 1 && !isNaN(numericTmdbId) && TMDB_TO_MAL_REGISTRY[numericTmdbId]) {
    return TMDB_TO_MAL_REGISTRY[numericTmdbId];
  }

  // 2. Build search query for title lookup
  const cleanTitle = (title || "").trim();
  if (!cleanTitle) {
    // If no title provided but we have TMDB ID registered, use base MAL ID
    if (!isNaN(numericTmdbId) && TMDB_TO_MAL_REGISTRY[numericTmdbId]) {
      return TMDB_TO_MAL_REGISTRY[numericTmdbId];
    }
    return null;
  }

  // Search query includes season qualifier if > 1 to match MAL's per-season entries
  const searchQuery =
    seasonNumber > 1 ? `${cleanTitle} Season ${seasonNumber}` : cleanTitle;

  const cacheKey = `${numericTmdbId || cleanTitle}__s${seasonNumber}`.toLowerCase();
  if (runtimeMalCache.has(cacheKey)) {
    return runtimeMalCache.get(cacheKey) ?? null;
  }

  // 3. Dynamic lookup via AniList GraphQL
  try {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          idMal
        }
      }
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { search: searchQuery } }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const malId = data?.data?.Media?.idMal;
      if (typeof malId === "number" && malId > 0) {
        runtimeMalCache.set(cacheKey, malId);
        return malId;
      }
    }
  } catch {
    // Non-fatal, fallback to base registry or null
  }

  // 4. Fallback to base Season 1 MAL ID if multi-season lookup didn't yield a separate entry
  if (!isNaN(numericTmdbId) && TMDB_TO_MAL_REGISTRY[numericTmdbId]) {
    const fallbackId = TMDB_TO_MAL_REGISTRY[numericTmdbId];
    runtimeMalCache.set(cacheKey, fallbackId);
    return fallbackId;
  }

  runtimeMalCache.set(cacheKey, null);
  return null;
}
