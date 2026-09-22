import { ReleasesResponse, CountryOption } from "../movie.type";

export async function fetchReleases(params: {
  year?: number;
  region?: string;
}): Promise<ReleasesResponse> {
  const query = new URLSearchParams();
  if (params.year) query.set("year", String(params.year));
  if (params.region && params.region.toLowerCase() !== "worldwide") {
    query.set("region", params.region);
  }

  const res = await fetch(`/api/releases?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch releases: ${res.status}`);
  }
  return await res.json();
}

export async function fetchCountries(): Promise<CountryOption[]> {
  const res = await fetch("/api/countries");
  if (!res.ok) {
    throw new Error(`Failed to fetch countries: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data.countries) ? data.countries : [];
}
