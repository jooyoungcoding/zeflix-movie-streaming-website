import assert from "node:assert";
import {
  determineWatchCategory,
  buildWatchUrl,
  buildNextEpisodeUrl,
} from "../service/watch-routing.service";
import { PlaybackRouter } from "../service/playback.router";
import { defaultPlaybackService } from "../service/playback.service";

async function runTests() {
  console.log("=== Running Watch URL Routing & Provider Tests ===\n");

  // 1. Test Category Determination
  console.log("1. Testing Category Determination...");

  // Super Sentai TV
  const sentaiTvCat = determineWatchCategory({
    tmdbId: "220558", // Bakuage Sentai Boonboomger
    title: "Bakuage Sentai Boonboomger",
    originCountry: ["JP"],
    genres: ["Action", "Sci-Fi"],
  });
  assert.strictEqual(sentaiTvCat, "sentai", "Boonboomger must be categorized as sentai");
  console.log("  [PASS] Sentai series identified as sentai");

  // Anime TV
  const animeTvCat = determineWatchCategory({
    tmdbId: "85937", // Demon Slayer
    title: "Demon Slayer: Kimetsu no Yaiba",
    originCountry: ["JP"],
    genres: ["Animation", "Action", "Fantasy"],
  });
  assert.strictEqual(animeTvCat, "anime", "Demon Slayer must be categorized as anime");
  console.log("  [PASS] Anime series identified as anime");

  // Anime Movie
  const animeMovieCat = determineWatchCategory({
    tmdbId: "372058", // Your Name.
    title: "Your Name.",
    originCountry: ["JP"],
    genres: ["Animation", "Romance", "Drama"],
  });
  assert.strictEqual(animeMovieCat, "anime", "Your Name. must be categorized as anime");
  console.log("  [PASS] Anime movie identified as anime");

  // Normal Movie
  const normalMovieCat = determineWatchCategory({
    tmdbId: "550", // Fight Club
    title: "Fight Club",
    originCountry: ["US"],
    genres: ["Drama"],
  });
  assert.strictEqual(normalMovieCat, "normal", "Fight Club must be categorized as normal");
  console.log("  [PASS] Normal movie identified as normal");

  // Normal TV
  const normalTvCat = determineWatchCategory({
    tmdbId: "1399", // Game of Thrones
    title: "Game of Thrones",
    originCountry: ["US"],
    genres: ["Drama", "Sci-Fi & Fantasy"],
  });
  assert.strictEqual(normalTvCat, "normal", "Game of Thrones must be categorized as normal");
  console.log("  [PASS] Normal TV identified as normal");

  // 2. Test URL Builder Structure
  console.log("\n2. Testing Watch URL Generation...");

  const animeMovieUrl = buildWatchUrl({
    type: "movie",
    tmdbId: "372058",
    category: "anime",
  });
  assert.strictEqual(
    animeMovieUrl,
    "/watch/movie/anime/372058",
    "Anime movie URL mismatch"
  );
  console.log(`  [PASS] Anime Movie URL: ${animeMovieUrl}`);

  const animeTvUrl = buildWatchUrl({
    type: "tv",
    tmdbId: "85937",
    category: "anime",
    episode: 1,
  });
  assert.strictEqual(
    animeTvUrl,
    "/watch/tv/anime/85937/1",
    "Anime TV URL mismatch"
  );
  console.log(`  [PASS] Anime TV URL: ${animeTvUrl}`);

  const sentaiMovieUrl = buildWatchUrl({
    type: "movie",
    tmdbId: "12345",
    category: "sentai",
  });
  assert.strictEqual(
    sentaiMovieUrl,
    "/watch/movie/sentai/12345",
    "Sentai movie URL mismatch"
  );
  console.log(`  [PASS] Sentai Movie URL: ${sentaiMovieUrl}`);

  const sentaiTvUrl = buildWatchUrl({
    type: "tv",
    tmdbId: "220558",
    category: "sentai",
    episode: 5,
  });
  assert.strictEqual(
    sentaiTvUrl,
    "/watch/tv/sentai/220558/5",
    "Sentai TV URL mismatch"
  );
  console.log(`  [PASS] Sentai TV URL: ${sentaiTvUrl}`);

  const normalMovieUrl = buildWatchUrl({
    type: "movie",
    tmdbId: "550",
    category: "normal",
  });
  assert.strictEqual(
    normalMovieUrl,
    "/watch/movie/normal/550",
    "Normal movie URL mismatch"
  );
  console.log(`  [PASS] Normal Movie URL: ${normalMovieUrl}`);

  const normalTvUrl = buildWatchUrl({
    type: "tv",
    tmdbId: "1399",
    category: "normal",
    episode: 3,
  });
  assert.strictEqual(
    normalTvUrl,
    "/watch/tv/normal/1399/3",
    "Normal TV URL mismatch"
  );
  console.log(`  [PASS] Normal TV URL: ${normalTvUrl}`);

  // 3. Test Next Episode Category Preservation
  console.log("\n3. Testing Next Episode URL Category Preservation...");
  const nextAnime = buildNextEpisodeUrl("anime", "85937", 6);
  assert.strictEqual(nextAnime, "/watch/tv/anime/85937/6");
  console.log(`  [PASS] Next Anime: ${nextAnime}`);

  const nextSentai = buildNextEpisodeUrl("sentai", "220558", 6);
  assert.strictEqual(nextSentai, "/watch/tv/sentai/220558/6");
  console.log(`  [PASS] Next Sentai: ${nextSentai}`);

  const nextNormal = buildNextEpisodeUrl("normal", "1399", 6);
  assert.strictEqual(nextNormal, "/watch/tv/normal/1399/6");
  console.log(`  [PASS] Next Normal: ${nextNormal}`);

  // 4. Test PlaybackRouter Provider Isolation
  console.log("\n4. Testing Provider Isolation...");
  const router = new PlaybackRouter();

  // Anime routing
  const animeProviders = router.resolveProviders({
    mediaType: "tv",
    tmdbId: "85937",
    category: "anime",
  });
  const animeProviderNames = animeProviders.map((p) => p.name);
  assert.strictEqual(
    animeProviderNames[0],
    "YenimeProvider",
    "Anime must use Yenime as primary provider"
  );
  assert.deepStrictEqual(
    animeProviderNames,
    ["YenimeProvider", "VidLink", "SuperEmbed"],
    "Anime fallback order must be Yenime -> VidLink -> SuperEmbed"
  );
  console.log(`  [PASS] Anime providers: ${animeProviderNames.join(" -> ")}`);

  // Sentai routing
  const sentaiProviders = router.resolveProviders({
    mediaType: "tv",
    tmdbId: "220558",
    category: "sentai",
  });
  const sentaiProviderNames = sentaiProviders.map((p) => p.name);
  assert.strictEqual(
    sentaiProviderNames[0],
    "SuperSentaiProvider",
    "Sentai must use SuperSentaiProvider as primary"
  );
  assert(
    !sentaiProviderNames.includes("Yenime"),
    "Sentai must NEVER include Yenime"
  );
  console.log(`  [PASS] Sentai providers: ${sentaiProviderNames.join(" -> ")}`);

  // Normal routing
  const normalProviders = router.resolveProviders({
    mediaType: "movie",
    tmdbId: "550",
    category: "normal",
  });
  const normalProviderNames = normalProviders.map((p) => p.name);
  assert.deepStrictEqual(
    normalProviderNames,
    ["VidLink", "SuperEmbed"],
    "Normal must strictly be VidLink -> SuperEmbed"
  );
  assert(
    !normalProviderNames.includes("Yenime"),
    "Normal must NEVER include Yenime"
  );
  assert(
    !normalProviderNames.includes("SuperSentaiProvider"),
    "Normal must NEVER include SuperSentaiProvider"
  );
  console.log(`  [PASS] Normal providers: ${normalProviderNames.join(" -> ")}`);

  // 5. Centralized Incompatibility Correction
  console.log("\n5. Testing Centralized Incompatibility Correction...");
  // Normal movie requested with anime category: PlaybackService detects genres not anime
  const session = await defaultPlaybackService.getMoviePlayback(
    "550",
    "Fight Club",
    {
      category: "anime",
      genres: ["Drama"],
      originCountry: ["US"],
      productionCountries: ["US"],
    }
  );
  assert.strictEqual(
    session.mediaInfo.category,
    "normal",
    "Fight Club with category=anime must be corrected to normal"
  );
  console.log(
    `  [PASS] Incompatible category corrected: requested anime -> resolved ${session.mediaInfo.category}`
  );

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("\n[FAIL] Test error:", err);
  process.exit(1);
});
