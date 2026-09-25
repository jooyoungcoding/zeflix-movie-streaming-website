/**
 * Centralized Super Sentai Identification & Detection Service
 *
 * Requirements:
 * - Do NOT detect Super Sentai solely using title text search like title.includes("Super Sentai").
 * - Use reliable existing data:
 *   1. Centralized TMDB ID registry of official Super Sentai installments
 *   2. TMDB/Zeflix metadata (production company, keywords, franchise, country)
 * - Zero unnecessary external API calls.
 * - Single source of truth for routing decisions.
 */

export interface SuperSentaiMetadataCandidate {
  tmdbId?: string | number;
  title?: string;
  originalName?: string;
  genres?: string[] | Array<{ id?: number; name?: string }>;
  productionCompanyIds?: number[];
  keywordIds?: number[];
  originCountry?: string[];
  productionCountries?: string[];
  originalLanguage?: string;
  franchise?: string;
  [key: string]: unknown;
}

/**
 * Complete TMDB TV ID Registry for Japanese Super Sentai Series
 * Spans from Himitsu Sentai Gorenger (1975) to current releases.
 */
export const SUPER_SENTAI_TMDB_IDS = new Set<number>([
  34391, // Himitsu Sentai Gorenger (1975)
  39186, // J.A.K.Q. Dengekitai (1977)
  39187, // Battle Fever J (1979)
  39188, // Denshi Sentai Denziman (1980)
  39189, // Taiyo Sentai Sun Vulcan (1981)
  39190, // Dai Sentai Goggle-V (1982)
  39191, // Kagaku Sentai Dynaman (1983)
  39192, // Choudenshi Bioman (1984)
  39193, // Dengeki Sentai Changeman (1985)
  39194, // Choushinsei Flashman (1986)
  39195, // Hikari Sentai Maskman (1987)
  39196, // Choujuu Sentai Liveman (1988)
  39197, // Kousoku Sentai Turboranger (1989)
  39198, // Chikyuu Sentai Fiveman (1990)
  39199, // Choujin Sentai Jetman (1991)
  31591, // Kyoryu Sentai Zyuranger (1992)
  31592, // Gosei Sentai Dairanger (1993)
  31593, // Ninja Sentai Kakuranger (1994)
  31594, // Chouriki Sentai Ohranger (1995)
  31595, // Gekisou Sentai Carranger (1996)
  31596, // Denji Sentai Megaranger (1997)
  31597, // Seijuu Sentai Gingaman (1998)
  31598, // Kyuukyuu Sentai GoGoFive (1999)
  31599, // Mirai Sentai Timeranger (2000)
  31600, // Hyakujuu Sentai Gaoranger (2001)
  31601, // Ninpuu Sentai Hurricaneger (2002)
  31602, // Bakuryuu Sentai Abaranger (2003)
  31603, // Tokusou Sentai Dekaranger (2004)
  31604, // Mahou Sentai Magiranger (2005)
  31605, // GouGou Sentai Boukenger (2006)
  31606, // Juken Sentai Gekiranger (2007)
  31607, // Engine Sentai Go-onger (2008)
  23062, // Samurai Sentai Shinkenger (2009)
  31608, // Tensou Sentai Goseiger (2010)
  37746, // Kaizoku Sentai Gokaiger (2011)
  41473, // Tokumei Sentai Go-Busters (2012)
  46849, // Zyuden Sentai Kyoryuger (2013)
  60563, // Ressha Sentai ToQger (2014)
  61899, // Shuriken Sentai Ninninger (2015)
  65103, // Doubutsu Sentai Zyuohger (2016)
  69641, // Uchu Sentai Kyuranger (2017)
  76331, // Kaitou Sentai Lupinranger VS Keisatsu Sentai Patranger (2018)
  85499, // Kishiryu Sentai Ryusoulger (2019)
  96117, // Mashin Sentai Kiramager (2020)
  114695, // Kikai Sentai Zenkaiger (2021)
  139446, // Avataro Sentai Donbrothers (2022)
  219754, // Ohsama Sentai King-Ohger (2023)
  243555, // Bakuage Sentai Boonboomger (2024)
  270119, // No.1 Sentai Gozyuger (2025)
  44372, // Hikonin Sentai Akibaranger (Unofficial)
]);

// Known TMDB Keyword IDs related to Super Sentai & Tokusatsu
const SUPER_SENTAI_KEYWORD_IDS = new Set<number>([
  180547, // super sentai
  9924, // tokusatsu
]);

// Toei Company TMDB ID
const TOEI_COMPANY_ID = 6187;

/**
 * Centralized function to determine whether content is a Japanese Super Sentai series.
 * Evaluates without requiring ad-hoc API queries.
 */
export function isSuperSentaiSeries(
  tmdbId: string | number,
  metadata?: SuperSentaiMetadataCandidate | null
): boolean {
  const numericId = typeof tmdbId === "number" ? tmdbId : parseInt(String(tmdbId).trim(), 10);

  // 1. Direct O(1) Check against the official Super Sentai TMDB ID registry
  if (!isNaN(numericId) && SUPER_SENTAI_TMDB_IDS.has(numericId)) {
    return true;
  }

  // 2. Check metadata if provided
  if (metadata) {
    if (metadata.franchise?.toLowerCase().includes("super sentai")) {
      return true;
    }

    // Japanese origin combined with sentai / tokusatsu naming
    const titleCheck = (metadata.title || metadata.originalName || "").toLowerCase();
    if (
      (metadata.originCountry?.includes("JP") || metadata.originalLanguage === "ja") &&
      (titleCheck.includes("sentai") || titleCheck.includes("戦隊") || titleCheck.includes("tokusatsu"))
    ) {
      return true;
    }

    // Check keyword IDs if available in TMDB metadata
    if (metadata.keywordIds && Array.isArray(metadata.keywordIds)) {
      if (metadata.keywordIds.some((id) => SUPER_SENTAI_KEYWORD_IDS.has(id))) {
        return true;
      }
    }

    // Check Toei production company combined with Japanese origin
    if (
      metadata.productionCompanyIds &&
      Array.isArray(metadata.productionCompanyIds) &&
      metadata.productionCompanyIds.includes(TOEI_COMPANY_ID) &&
      (metadata.originCountry?.includes("JP") || metadata.originalLanguage === "ja")
    ) {
      // Further verify that it matches tokusatsu/sentai characteristics
      const orig = (metadata.originalName || "").toLowerCase();
      if (orig.includes("戦隊") || orig.includes("sentai")) {
        return true;
      }
    }
  }

  return false;
}
