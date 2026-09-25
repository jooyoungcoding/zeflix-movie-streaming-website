import { SentaiSource } from "./sentai-source.interface";
import { PlaybackSource } from "../types/playback.types";

/**
 * Registry mapping TMDB TV IDs to official TokuFun series slugs
 */
export const TOKUFUN_SERIES_SLUGS: Record<number, string> = {
  34391: "himitsu-sentai-gorenger",
  39186: "jakq-dengekitai",
  39187: "battle-fever-j",
  39188: "denshi-sentai-denziman",
  39189: "taiyo-sentai-sun-vulcan",
  39190: "dai-sentai-goggle-v",
  39191: "kagaku-sentai-dynaman",
  39192: "choudenshi-bioman",
  39193: "dengeki-sentai-changeman",
  39194: "choushinsei-flashman",
  39195: "hikari-sentai-maskman",
  39196: "choujuu-sentai-liveman",
  39197: "kousoku-sentai-turboranger",
  39198: "chikyuu-sentai-fiveman",
  39199: "choujin-sentai-jetman",
  31591: "kyoryu-sentai-zyuranger",
  31592: "gosei-sentai-dairanger",
  31593: "ninja-sentai-kakuranger",
  31594: "chouriki-sentai-ohranger",
  31595: "gekisou-sentai-carranger",
  31596: "denji-sentai-megaranger",
  31597: "seijuu-sentai-gingaman",
  31598: "kyukyu-sentai-gogofive",
  31599: "mirai-sentai-timeranger",
  31600: "hyakujuu-sentai-gaoranger",
  31601: "ninpuu-sentai-hurricanger",
  31602: "bakuryuu-sentai-abaranger",
  31603: "tokusou-sentai-dekaranger",
  31604: "mahou-sentai-magiranger",
  31605: "gogo-sentai-boukenger",
  31606: "juken-sentai-gekiranger",
  31607: "engine-sentai-go-onger",
  23062: "samurai-sentai-shinkenger",
  31608: "tensou-sentai-goseiger",
  37746: "kaizoku-sentai-gokaiger",
  41473: "tokumei-sentai-go-busters",
  46849: "zyuden-sentai-kyoryuger",
  60563: "ressha-sentai-toqger",
  61899: "shuriken-sentai-ninninger",
  65103: "doubutsu-sentai-zyuohger-jyuohger",
  69641: "uchu-sentai-kyuranger",
  76331: "kaitou-sentai-lupinranger-vs-keisatsu-sentai-patranger",
  85499: "kishiryu-sentai-ryusoulger",
  96117: "mashin-sentai-kiramager",
  114695: "kikai-sentai-zenkaiger",
  139446: "avataro-sentai-donbrothers",
  219754: "ohsama-sentai-king-ohger",
  243555: "bakuage-sentai-boonboomger",
  270119: "no1-sentai-gozyuger",
  44372: "hikonin-unofficial-sentai-akibaranger",
};

/**
 * TokuFunSource
 * Dedicated source adapter for TokuFun English-subbed Super Sentai content.
 * Follows the SentaiSource interface.
 */
export class TokuFunSource implements SentaiSource {
  readonly id = "tokufun";
  readonly name = "TokuFun";
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.TOKUTUN_URL || "https://toku.fun"
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Resolve movie playback source for TokuFun
   */
  async resolveMovie(
    tmdbId: string,
    title?: string,
    _metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    void _metadata;
    const slug = this.determineSeriesSlug(tmdbId, title);
    if (!slug) return null;

    // TokuFun English sub movie post format
    const url = `${this.baseUrl}/post/${slug}-full-series-movies-english-sub`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        source: this.id,
        franchise: "Super Sentai",
        language: "en",
        slug,
        tmdbId,
      },
    };
  }

  /**
   * Resolve TV episode playback source for TokuFun
   */
  async resolveEpisode(
    tmdbId: string,
    season: number,
    episode: number,
    title?: string,
    _metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    void _metadata;
    const slug = this.determineSeriesSlug(tmdbId, title);
    if (!slug) return null;

    const ep = Math.max(1, Math.floor(episode || 1));
    const s = Math.max(1, Math.floor(season || 1));

    // TokuFun standard English sub episode post format
    const url = `${this.baseUrl}/post/${slug}-episode-${ep}-full-english-sub`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        source: this.id,
        franchise: "Super Sentai",
        language: "en",
        slug,
        tmdbId,
        season: s,
        episode: ep,
      },
    };
  }

  /**
   * Determine the TokuFun series slug using TMDB ID registry or title slugification
   */
  private determineSeriesSlug(tmdbId: string, title?: string): string | null {
    const numericId = parseInt(String(tmdbId || "").trim(), 10);
    if (!isNaN(numericId) && TOKUFUN_SERIES_SLUGS[numericId]) {
      return TOKUFUN_SERIES_SLUGS[numericId];
    }

    if (title && title.trim()) {
      const cleaned = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (cleaned.length > 0) {
        return cleaned;
      }
    }

    return null;
  }
}
