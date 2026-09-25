import { TokuFunSource } from "../sources/tokufun.source";
import { TokuAddonSource } from "../sources/tokuaddon.source";
import { SentaiSource } from "../sources/sentai-source.interface";
import { SuperSentaiResolver } from "../service/super-sentai.resolver";
import { SuperSentaiProvider } from "../providers/super-sentai.provider";
import { defaultPlaybackService } from "../service/playback.service";
import { PlaybackSource } from "../types/playback.types";
import { generateMediaProgressKey } from "../service/watch-history.service";

async function runSentaiTests() {
  console.log("=== Testing Super Sentai Playback Architecture ===");
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

  // 1. TokuFunSource Tests
  const tokufun = new TokuFunSource();
  const tfEp = await tokufun.resolveEpisode("270119", 1, 9, "No.1 Sentai Gozyuger");
  assert(tfEp !== null, "TokuFunSource resolves episode for Gozyuger (270119)");
  assert(
    tfEp?.providerId === "tokufun" && tfEp?.type === "iframe",
    "TokuFunSource returns normalized PlaybackSource with providerId 'tokufun'"
  );
  assert(
    tfEp?.url.includes("no1-sentai-gozyuger-episode-9-full-english-sub") === true,
    "TokuFunSource constructs correct English-subbed episode post URL"
  );

  const tfMovie = await tokufun.resolveMovie("219754", "Ohsama Sentai King-Ohger");
  assert(
    tfMovie?.url.includes("ohsama-sentai-king-ohger") === true,
    "TokuFunSource resolves movie for King-Ohger (219754)"
  );

  // 2. TokuAddonSource Tests
  const tokuaddon = new TokuAddonSource();
  const taEp = await tokuaddon.resolveEpisode("270119", 1, 9, "No.1 Sentai Gozyuger");
  assert(taEp !== null, "TokuAddonSource resolves episode for Gozyuger");
  assert(
    taEp?.providerId === "tokuaddon" && taEp?.type === "iframe",
    "TokuAddonSource returns normalized PlaybackSource with providerId 'tokuaddon'"
  );
  assert(
    taEp?.url.includes("270119:1:9") === true,
    "TokuAddonSource constructs correct streaming series URL with format {id}:{s}:{ep}"
  );

  // 3. SuperSentaiResolver Tests
  const resolver = new SuperSentaiResolver();
  const allSources = await resolver.resolveTvEpisodeAllSources(
    "270119",
    1,
    9,
    "No.1 Sentai Gozyuger"
  );
  assert(allSources.length === 2, "SuperSentaiResolver resolves both TokuFun and TokuAddon sources");
  assert(allSources[0].providerId === "tokufun", "1st source in resolver order is TokuFun");
  assert(allSources[1].providerId === "tokuaddon", "2nd source in resolver order is TokuAddon");

  // 4. Extensibility Test: custom Sentai source can be added without modifying SuperSentaiProvider
  class MockCustomSource implements SentaiSource {
    readonly id = "custom-sentai-cdn";
    readonly name = "CustomSentaiCDN";
    async resolveMovie(): Promise<PlaybackSource | null> {
      return null;
    }
    async resolveEpisode(
      tmdbId: string,
      s: number,
      ep: number
    ): Promise<PlaybackSource | null> {
      return {
        type: "iframe",
        url: `https://custom-sentai-cdn.org/stream/${tmdbId}/${s}/${ep}`,
        providerId: this.id,
        providerName: this.name,
      };
    }
  }

  const customResolver = new SuperSentaiResolver([
    new TokuFunSource(),
    new TokuAddonSource(),
    new MockCustomSource(),
  ]);
  const customSources = await customResolver.resolveTvEpisodeAllSources("270119", 1, 1);
  assert(customSources.length === 3, "SuperSentaiResolver cleanly supports registering new sources");
  assert(
    customSources[2].providerId === "custom-sentai-cdn",
    "Third custom source cleanly resolves in sequence"
  );

  // 5. SuperSentaiProvider Tests
  const provider = new SuperSentaiProvider(resolver);
  const provSources = await provider.getTvEpisodeSources(
    "243555",
    1,
    1,
    { title: "Bakuage Sentai Boonboomger" }
  );
  assert(
    provSources.length === 2 && provSources[0].providerId === "tokufun" && provSources[1].providerId === "tokuaddon",
    "SuperSentaiProvider delegates to SuperSentaiResolver and returns all sources in order"
  );

  // 6. PlaybackService End-to-End Cascade for Super Sentai
  // Bakuage Sentai Boonboomger (243555)
  const session = await defaultPlaybackService.getTvPlayback(
    "243555",
    1,
    1,
    "Bakuage Sentai Boonboomger"
  );

  assert(session.mediaInfo.isSuperSentai === true, "PlaybackService detects Super Sentai content");
  assert(session.sources.length >= 4, "PlaybackService returns full cascade of sources");
  assert(session.sources[0].providerId === "tokufun", "Source 1 is TokuFun");
  assert(session.sources[1].providerId === "tokuaddon", "Source 2 is TokuAddon");
  assert(session.sources[2].providerId === "vidlink", "Source 3 is VidLink (Fallback 1)");
  assert(session.sources[3].providerId === "superembed", "Source 4 is SuperEmbed (Fallback 2)");

  // 7. Provider-Independent Watch History Test
  const historyKey = generateMediaProgressKey("tv", "243555", 1, 1);
  assert(
    historyKey === "zeflix:watch_progress:tv_243555_s1_e1",
    "Watch history key is strictly based on TMDB ID and season/episode, never stream URLs"
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSentaiTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
