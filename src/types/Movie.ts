export type Movie = {
    movie_id: string;
    tmdb_id: number;
    imdb_id: string | null;
    title: string;
    original_title: string | null;
    overview: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string | null;
    vote_average: number | null;
    vote_count: number | null;
    runtime: number | null;
    original_language: string | null;
    created_at: string;
    updated_at: string;
};