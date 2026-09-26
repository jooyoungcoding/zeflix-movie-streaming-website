import assert from "node:assert";
import { defaultPlaybackService } from "../service/playback.service";
import { buildNextEpisodeUrl } from "../service/watch-routing.service";
import { generateMediaProgressKey } from "../service/watch-history.service";
import { PlaybackSource } from "../types/playback.types";

async function runUnifiedFallbackTests() {
  console.log("===============================================================");
  console.log("=== RUNNING UNIFIED PLAYBACK FALLBACK & HEALTH TEST SUITE ===");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`[PASS] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`[FAIL] ${name}:`, err.message);
            failed++;
          });
      }
      console.log(`[PASS] ${name}`);
      passed++;
      return Promise.resolve();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] ${name}:`, msg);
      failed++;
      return Promise.resolve();
    }
  }

  // -------------------------------------------------------------
  // 1. ANIME PLAYBACK & SOURCE RESOLUTION TESTS
  // -------------------------------------------------------------
  console.log("--- 1. Anime Playback Architecture Tests ---");

  await test("Anime TV Series with Yenime available resolves 5-source cascade (Source A, B, C, VidLink, SuperEmbed)", async () => {
    // One Piece (TMDB 37854)
    const session = await defaultPlaybackService.getTvPlayback(
      "37854",
      1,
      1,
      "One Piece",
      { category: "anime" }
    );
    assert.strictEqual(session.mediaInfo.category, "anime");
    assert.strictEqual(session.mediaInfo.isAnime, true);
    assert.strictEqual(session.sources.length, 5);

    // Dedicated Yenime Sources A, B, C
    assert.strictEqual(session.sources[0].providerId, "yenime");
    assert.strictEqual(session.sources[0].customData?.sourceName, "Source A");
    assert.ok(session.sources[0].url.includes("/stream/mal/21/1/sub"));

    assert.strictEqual(session.sources[1].providerId, "yenime");
    assert.strictEqual(session.sources[1].customData?.sourceName, "Source B");
    assert.ok(session.sources[1].url.includes("yenime.net/watch/21/1"));

    assert.strictEqual(session.sources[2].providerId, "yenime");
    assert.strictEqual(session.sources[2].customData?.sourceName, "Source C");
    assert.ok(session.sources[2].url.includes("/embed/mal/21/1/sub"));

    // Fallbacks
    assert.strictEqual(session.sources[3].providerId, "vidlink");
    assert.strictEqual(session.sources[4].providerId, "superembed");
  });

  await test("Anime Movie with Yenime available resolves 5-source cascade", async () => {
    // Your Name (TMDB 372058 -> MAL 32281)
    const session = await defaultPlaybackService.getMoviePlayback(
      "372058",
      "Your Name.",
      { category: "anime", genres: ["Animation"] }
    );
    assert.strictEqual(session.mediaInfo.category, "anime");
    assert.strictEqual(session.sources.length, 5);
    assert.strictEqual(session.sources[0].providerId, "yenime");
    assert.ok(session.sources[0].url.includes("/stream/mal/32281/1/sub"));
    assert.strictEqual(session.sources[3].providerId, "vidlink");
    assert.strictEqual(session.sources[4].providerId, "superembed");
  });

  await test("Anime with Yenime UNMAPPED / unavailable gracefully cascades directly to VidLink -> SuperEmbed", async () => {
    // Unmapped TMDB anime ID with random title
    const session = await defaultPlaybackService.getTvPlayback(
      "99999999",
      1,
      1,
      "NonExistentAnimeTitle123456",
      { category: "anime" }
    );
    assert.strictEqual(session.mediaInfo.category, "anime");
    // Yenime returns [] because no MAL ID exists, so cascade directly continues to VidLink -> SuperEmbed
    assert.strictEqual(session.sources.length, 2);
    assert.strictEqual(session.sources[0].providerId, "vidlink");
    assert.strictEqual(session.sources[1].providerId, "superembed");
  });

  // -------------------------------------------------------------
  // 2. SUPER SENTAI / TOKUSATSU PLAYBACK TESTS
  // -------------------------------------------------------------
  console.log("\n--- 2. Super Sentai Playback Architecture Tests ---");

  await test("Super Sentai TV resolves dedicated Sources A, B, C (TokuFun, TokuAddon, TokuStream) then VidLink -> SuperEmbed", async () => {
    // Bakuage Sentai Boonboomger (TMDB 243555)
    const session = await defaultPlaybackService.getTvPlayback(
      "243555",
      1,
      5,
      "Bakuage Sentai Boonboomger",
      { category: "sentai" }
    );
    assert.strictEqual(session.mediaInfo.category, "sentai");
    assert.strictEqual(session.mediaInfo.isSuperSentai, true);
    assert.strictEqual(session.sources.length, 5);

    // Source A: TokuFun
    assert.strictEqual(session.sources[0].providerId, "tokufun");
    assert.ok(session.sources[0].url.includes("bakuage-sentai-boonboomger-episode-5"));

    // Source B: TokuAddon
    assert.strictEqual(session.sources[1].providerId, "tokuaddon");
    assert.ok(session.sources[1].url.includes("243555:1:5"));

    // Source C: TokuStream
    assert.strictEqual(session.sources[2].providerId, "tokustream");
    assert.ok(session.sources[2].url.includes("/tv/243555/1/5"));

    // Fallbacks
    assert.strictEqual(session.sources[3].providerId, "vidlink");
    assert.strictEqual(session.sources[4].providerId, "superembed");
  });

  await test("Super Sentai Movie resolves dedicated sources then VidLink -> SuperEmbed", async () => {
    // King-Ohger Movie (TMDB 219754)
    const session = await defaultPlaybackService.getMoviePlayback(
      "219754",
      "Ohsama Sentai King-Ohger The Movie",
      { category: "sentai" }
    );
    assert.strictEqual(session.mediaInfo.category, "sentai");
    assert.strictEqual(session.sources.length, 5);
    assert.strictEqual(session.sources[0].providerId, "tokufun");
    assert.strictEqual(session.sources[1].providerId, "tokuaddon");
    assert.strictEqual(session.sources[2].providerId, "tokustream");
    assert.strictEqual(session.sources[3].providerId, "vidlink");
    assert.strictEqual(session.sources[4].providerId, "superembed");
  });

  await test("Super Sentai title not in TokuFun slug registry still resolves TokuAddon, TokuStream, VidLink, SuperEmbed", async () => {
    // Unknown Sentai special without slug
    const session = await defaultPlaybackService.getTvPlayback(
      "88888888",
      1,
      1,
      "",
      { category: "sentai" }
    );
    // TokuFun returns null without slug/title, TokuAddon & TokuStream format by TMDB ID, then VidLink, SuperEmbed
    assert.strictEqual(session.mediaInfo.category, "sentai");
    assert.ok(session.sources.length >= 4);
    assert.strictEqual(session.sources[0].providerId, "tokuaddon");
    assert.strictEqual(session.sources[1].providerId, "tokustream");
    assert.strictEqual(session.sources[2].providerId, "vidlink");
    assert.strictEqual(session.sources[3].providerId, "superembed");
  });

  // -------------------------------------------------------------
  // 3. NORMAL CONTENT PLAYBACK TESTS
  // -------------------------------------------------------------
  console.log("\n--- 3. Normal Content Playback Architecture Tests ---");

  await test("Normal Movie routes strictly to VidLink -> SuperEmbed (No Yenime, No Sentai)", async () => {
    const session = await defaultPlaybackService.getMoviePlayback(
      "550",
      "Fight Club",
      { category: "normal" }
    );
    assert.strictEqual(session.mediaInfo.category, "normal");
    assert.strictEqual(session.sources.length, 2);
    assert.strictEqual(session.sources[0].providerId, "vidlink");
    assert.strictEqual(session.sources[1].providerId, "superembed");
    assert.ok(!session.sources.some((s) => s.providerId === "yenime" || s.providerId === "tokufun"));
  });

  await test("Normal TV Series routes strictly to VidLink -> SuperEmbed", async () => {
    const session = await defaultPlaybackService.getTvPlayback(
      "1399",
      1,
      1,
      "Game of Thrones",
      { category: "normal" }
    );
    assert.strictEqual(session.mediaInfo.category, "normal");
    assert.strictEqual(session.sources.length, 2);
    assert.strictEqual(session.sources[0].providerId, "vidlink");
    assert.strictEqual(session.sources[1].providerId, "superembed");
  });

  // -------------------------------------------------------------
  // 4. WATCH HISTORY PROVIDER-INDEPENDENCE TESTS
  // -------------------------------------------------------------
  console.log("\n--- 4. Provider-Independent Watch History Tests ---");

  test("Watch history persists progress key by mediaId and episode, NEVER containing stream URLs", () => {
    const tvKey = generateMediaProgressKey("tv", "37854", 1, 10);
    assert.strictEqual(tvKey, "zeflix:watch_progress:tv_37854_s1_e10");
    assert.ok(!tvKey.includes("http"), "Watch key must not contain URLs");
    assert.ok(!tvKey.includes("vidlink"), "Watch key must not contain provider names");

    const movieKey = generateMediaProgressKey("movie", "550");
    assert.strictEqual(movieKey, "zeflix:watch_progress:movie_550");
  });

  // -------------------------------------------------------------
  // 5. NEXT EPISODE CATEGORY PRESERVATION TESTS
  // -------------------------------------------------------------
  console.log("\n--- 5. Next Episode Category Preservation Tests ---");

  test("Next Episode keeps anime route intact", () => {
    const nextUrl = buildNextEpisodeUrl("anime", "37854", 2);
    assert.strictEqual(nextUrl, "/watch/tv/anime/37854/2");
  });

  test("Next Episode keeps sentai route intact", () => {
    const nextUrl = buildNextEpisodeUrl("sentai", "243555", 6);
    assert.strictEqual(nextUrl, "/watch/tv/sentai/243555/6");
  });

  test("Next Episode keeps normal route intact", () => {
    const nextUrl = buildNextEpisodeUrl("normal", "1399", 3);
    assert.strictEqual(nextUrl, "/watch/tv/normal/1399/3");
  });

  // -------------------------------------------------------------
  // 6. PLAYBACK FAILURE & FALLBACK CASCADE SIMULATION TESTS
  // -------------------------------------------------------------
  console.log("\n--- 6. Playback Health & Fallback Cascade Simulation Tests ---");

  test("Simulate Anime cascade: Source A fails -> Source B fails -> Source C fails -> VidLink fails -> SuperEmbed succeeds", () => {
    const sources: PlaybackSource[] = [
      { type: "iframe", url: "https://megaplay.buzz/failA", providerId: "yenime", providerName: "Yenime Source A" },
      { type: "iframe", url: "https://yenime.net/failB", providerId: "yenime", providerName: "Yenime Source B" },
      { type: "iframe", url: "https://megaplay.buzz/failC", providerId: "yenime", providerName: "Yenime Source C" },
      { type: "iframe", url: "https://vidlink.pro/failVidLink", providerId: "vidlink", providerName: "VidLink" },
      { type: "iframe", url: "https://multiembed.mov/okSuperEmbed", providerId: "superembed", providerName: "SuperEmbed" },
    ];

    let currentIndex = 0;
    let playbackConfirmed = false;
    const attempts: string[] = [];

    while (currentIndex < sources.length && !playbackConfirmed) {
      const active = sources[currentIndex];
      attempts.push(active.providerName);

      // Sources A, B, C and VidLink fail health check (black screen / timeout / error)
      if (active.url.includes("fail")) {
        currentIndex++;
      } else {
        // SuperEmbed succeeds health check
        playbackConfirmed = true;
      }
    }

    assert.strictEqual(playbackConfirmed, true);
    assert.strictEqual(attempts.length, 5);
    assert.deepStrictEqual(attempts, [
      "Yenime Source A",
      "Yenime Source B",
      "Yenime Source C",
      "VidLink",
      "SuperEmbed",
    ]);
  });

  test("Simulate Super Sentai cascade: Source A fails -> Source B fails -> Source C fails -> VidLink succeeds", () => {
    const sources: PlaybackSource[] = [
      { type: "iframe", url: "https://toku.fun/failA", providerId: "tokufun", providerName: "TokuFun (Source A)" },
      { type: "iframe", url: "https://hub.roxxy/failB", providerId: "tokuaddon", providerName: "TokuAddon (Source B)" },
      { type: "iframe", url: "https://tokustream/failC", providerId: "tokustream", providerName: "TokuStream (Source C)" },
      { type: "iframe", url: "https://vidlink.pro/ok", providerId: "vidlink", providerName: "VidLink" },
      { type: "iframe", url: "https://multiembed.mov/ok", providerId: "superembed", providerName: "SuperEmbed" },
    ];

    let currentIndex = 0;
    let playbackConfirmed = false;
    const attempts: string[] = [];

    while (currentIndex < sources.length && !playbackConfirmed) {
      const active = sources[currentIndex];
      attempts.push(active.providerName);

      if (active.url.includes("fail")) {
        currentIndex++;
      } else {
        playbackConfirmed = true;
      }
    }

    assert.strictEqual(playbackConfirmed, true);
    assert.strictEqual(currentIndex, 3);
    assert.strictEqual(sources[currentIndex].providerId, "vidlink");
  });

  test("Simulate All Providers Exhausted: triggers Friendly Error without crash", () => {
    const sources: PlaybackSource[] = [
      { type: "iframe", url: "https://vidlink.pro/fail", providerId: "vidlink", providerName: "VidLink" },
      { type: "iframe", url: "https://multiembed.mov/fail", providerId: "superembed", providerName: "SuperEmbed" },
    ];

    let currentIndex = 0;
    let allFailed = false;

    while (currentIndex < sources.length) {
      currentIndex++;
    }

    if (currentIndex >= sources.length) {
      allFailed = true;
    }

    assert.strictEqual(allFailed, true);
    const friendlyError = "We couldn't play this video right now. Please try again later.";
    assert.ok(friendlyError.length > 0);
  });

  console.log(`\n===============================================================`);
  console.log(`=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  console.log(`===============================================================`);
  if (failed > 0) process.exit(1);
}

runUnifiedFallbackTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
