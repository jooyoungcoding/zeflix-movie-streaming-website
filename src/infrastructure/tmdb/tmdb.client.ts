const DEFAULT_TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TMDBNotFoundError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "TMDBNotFoundError";
    this.status = 404;
  }
}

export async function fetchFromTMDB<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  maxRetries: number = 4
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
    let timeoutId: NodeJS.Timeout | undefined;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "User-Agent": "Zeflix-App/1.0",
        },
        signal: controller.signal,
        next: {
          // Revalidate cache every hour for movie catalogs
          revalidate: 3600,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown TMDB error");
        if (response.status === 404) {
          throw new TMDBNotFoundError(
            `TMDB resource not found (404): ${errorText}`
          );
        }
        throw new Error(
          `TMDB request failed with status ${response.status}: ${errorText}`
        );
      }

      return (await response.json()) as T;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = err;

      if (err instanceof TMDBNotFoundError) {
        // Do not retry 404 not found errors
        break;
      }

      if (attempt < maxRetries) {
        // Exponential backoff for transient network / socket reset glitches
        const backoffMs = attempt * 800 + Math.floor(Math.random() * 200);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to fetch data from TMDB after multiple attempts");
}
