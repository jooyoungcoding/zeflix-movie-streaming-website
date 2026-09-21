const DEFAULT_TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function fetchFromTMDB<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  maxRetries: number = 3
): Promise<T> {
  const baseUrl = process.env.TMDB_BASE_URL || DEFAULT_TMDB_BASE_URL;
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!token) {
    throw new Error("TMDB API Read Access Token is not configured");
  }

  const url = new URL(
    `${baseUrl.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "User-Agent": "Zeflix-App/1.0",
        },
        next: {
          // Revalidate cache every hour for movie catalogs
          revalidate: 3600,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown TMDB error");
        throw new Error(
          `TMDB request failed with status ${response.status}: ${errorText}`
        );
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        // Exponential backoff delay for transient network connection resets
        await new Promise((resolve) => setTimeout(resolve, attempt * 600));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to fetch data from TMDB after multiple attempts");
}
