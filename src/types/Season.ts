export type Season = {
    season_id: string;
    tv_id: string;
    tmdb_id: number | null;
    season_number: number;
    name: string | null;
    overview: string | null;
    poster_path: string | null;
    air_date: string | null;
    episode_count: number | null;
    created_at: string;
    updated_at: string;
};