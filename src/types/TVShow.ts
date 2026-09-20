export type TVShow = {
    tv_id: string;
    tmdb_id: number;
    imdb_id: string | null;
    name: string;
    original_name: string | null;
    overview: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string | null;
    last_air_date: string | null;
    vote_average: number | null;
    vote_count: number | null;
    number_of_seasons: number | null;
    number_of_episodes: number | null;
    original_language: string | null;
    created_at: string;
    updated_at: string;
};