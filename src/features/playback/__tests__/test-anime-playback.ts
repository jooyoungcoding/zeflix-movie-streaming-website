import { defaultPlaybackService } from "../service/playback.service";
import { PlaybackRouter } from "../service/playback.router";
import { isAnimeContent } from "../service/anime.detector";
import { isSuperSentaiSeries } from "../service/super-sentai.detector";
import { YenimeProvider } from "../providers/yenime.provider";

async function runTests() {
  console.log("=== RUNNING ANIME PLAYBACK ARCHITECTURE TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Anime Detection
  assert(isAnimeContent(37854), "One Piece TMDB ID 37854 detected as Anime");
  assert(isAnimeContent(1429), "Attack on Titan TMDB ID 1429 detected as Anime");
  assert(
    isAnimeContent(999999, { genres: ["Animation", "Action"], originCountry: ["JP"] }),
    "Metadata with Animation + JP country detected as Anime"
  );
  assert(
    isAnimeContent(888888, { genres: ["Anime"] }),
    "Metadata with Anime genre detected as Anime"
  );

  // 2. Super Sentai Exclusion from Anime
  assert(
    !isAnimeContent(37746), // Kaizoku Sentai Gokaiger
    "Super Sentai Gokaiger TMDB 37746 is NOT classified as Anime"
  );
  assert(
    isSuperSentaiSeries(37746),
    "Super Sentai Gokaiger is correctly classified as Super Sentai"
  );

  // 3. Normal TV/Movie Exclusion
  assert(
    !isAnimeContent(1399, { genres: ["Drama", "Sci-Fi & Fantasy"], originCountry: ["US"] }),
    "Game of Thrones (US Drama) is NOT classified as Anime"
  );
  assert(
    !isAnimeContent(299534, { genres: ["Action", "Adventure"], originCountry: ["US"] }),
    "Avengers: Endgame (US Action) is NOT classified as Anime"
  );

  // 4. PlaybackRouter Resolution
  const router = new PlaybackRouter();

  // 4a. Anime Routing
  const animeProviders = router.resolveProviders({
    mediaType: "tv",
    tmdbId: "37854", // One Piece
    title: "One Piece",
  });
  assert(
    animeProviders.length === 3 &&
      animeProviders[0].id === "yenime" &&
      animeProviders[1].id === "vidlink" &&
      animeProviders[2].id === "superembed",
    "Anime routes to: Yenime -> VidLink -> SuperEmbed"
  );

  // 4b. Super Sentai Routing
  const sentaiProviders = router.resolveProviders({
    mediaType: "tv",
    tmdbId: "37746", // Kaizoku Sentai Gokaiger
    title: "Kaizoku Sentai Gokaiger",
  });
  assert(
    sentaiProviders.length === 3 &&
      sentaiProviders[0].id === "super-sentai" &&
      sentaiProviders[1].id === "vidlink" &&
      sentaiProviders[2].id === "superembed",
    "Super Sentai routes to: SuperSentai -> VidLink -> SuperEmbed"
  );

  // 4c. Normal Content Routing
  const normalProviders = router.resolveProviders({
    mediaType: "tv",
    tmdbId: "1396", // Breaking Bad
    title: "Breaking Bad",
    metadata: { genres: ["Drama", "Crime"], originCountry: ["US"] },
  });
  assert(
    normalProviders.length === 2 &&
      normalProviders[0].id === "vidlink" &&
      normalProviders[1].id === "superembed",
    "Normal TV routes to: VidLink -> SuperEmbed (No Yenime, No SuperSentai)"
  );

  // 5. YenimeProvider Source Generation
  const yenime = new YenimeProvider();
  const onePieceSource = await yenime.getTvEpisodeSource("37854", 1, 5, {
    title: "One Piece",
  });
  assert(
    onePieceSource !== null &&
      onePieceSource.url.includes("/stream/mal/21/5/sub") &&
      onePieceSource.providerId === "yenime",
    "Yenime generates correct stream URL for One Piece S01 E05 (/stream/mal/21/5/sub)"
  );

  // 6. PlaybackService End-to-End Session Resolution
  console.log("\nResolving One Piece PlaybackSession via PlaybackService...");
  const session = await defaultPlaybackService.getTvPlayback(
    "37854",
    1,
    1,
    "One Piece"
  );
  assert(session.mediaInfo.isAnime === true, "Session mediaInfo.isAnime is true");
  assert(
    session.sources[0]?.providerId === "yenime",
    "Session primary source is Yenime"
  );
  assert(
    session.sources[1]?.providerId === "vidlink",
    "Session fallback 1 is VidLink"
  );
  assert(
    session.sources[2]?.providerId === "superembed",
    "Session fallback 2 is SuperEmbed"
  );

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
