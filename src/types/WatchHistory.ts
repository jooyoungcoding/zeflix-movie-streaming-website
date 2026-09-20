export type WatchHistory = {
    history_id: string;
    user_id: string;
    movie_id: string | null;
    episode_id: string | null;
    progress_seconds: number;
    duration_seconds: number | null;
    completed: boolean;
    last_watched_at: string;
    created_at: string;
    updated_at: string;
};