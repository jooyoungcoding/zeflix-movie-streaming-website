export type Episode = {
    episode_id: string;
    season_id: string;
    tmdb_id: number | null;
    episode_number: number;
    name: string;
    overview: string | null;
    still_path: string | null;
    air_date: string | null;
    runtime: number | null;
    vote_average: number | null;
    vote_count: number | null;
    created_at: string;
    updated_at: string;
};