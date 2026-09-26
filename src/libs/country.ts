const LANGUAGE_COUNTRY_FALLBACK: Record<string, string> = {
  ja: "Japan",
  ko: "South Korea",
  zh: "China",
  cn: "China",
  vi: "Vietnam",
  fr: "France",
  de: "Germany",
  es: "Spain",
  it: "Italy",
  th: "Thailand",
  hi: "India",
  ru: "Russia",
};

/**
 * Converts ISO 3166-1 alpha-2 or alpha-3 country code to full English country name.
 * Examples: "US" -> "United States", "KR" -> "South Korea", "JP" -> "Japan"
 */
export function formatCountryName(code: string): string {
  if (!code || typeof code !== "string") return "";
  const trimmed = code.trim();
  if (!trimmed) return "";

  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(trimmed.toUpperCase()) || trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Returns formatted country display name(s) for a media item.
 */
export function getDisplayCountry({
  originCountry,
  productionCountries,
  originalLanguage,
  limit = 2,
}: {
  originCountry?: string[];
  productionCountries?: string[];
  originalLanguage?: string;
  limit?: number;
}): string {
  const codes =
    originCountry && originCountry.length > 0
      ? originCountry
      : productionCountries && productionCountries.length > 0
      ? productionCountries
      : [];

  const names = codes
    .map(formatCountryName)
    .filter((name): name is string => Boolean(name && name.length > 0));

  const uniqueNames = Array.from(new Set(names));

  if (uniqueNames.length > 0) {
    return uniqueNames.slice(0, limit).join(", ");
  }

  if (originalLanguage && LANGUAGE_COUNTRY_FALLBACK[originalLanguage.toLowerCase()]) {
    return LANGUAGE_COUNTRY_FALLBACK[originalLanguage.toLowerCase()];
  }

  return "";
}
