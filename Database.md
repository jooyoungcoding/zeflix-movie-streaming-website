# Zeflix Database Schema

## 1. Overview

Zeflix uses **PostgreSQL / Supabase** as the database.

The database stores:

* User profiles
* Movies
* TV series
* Seasons
* Episodes
* Favorites
* Watch history
* Movie awards
* TV series awards

### Main Data Sources

| Data                        | Source          |
| --------------------------- | --------------- |
| Movie metadata              | TMDB            |
| TV series metadata          | TMDB            |
| Seasons / Episodes metadata | TMDB            |
| Movie / TV ratings          | TMDB            |
| Awards                      | Zeflix database |
| User authentication         | Supabase Auth   |
| User profile                | `profiles`      |

---

# 2. Entity Relationship Overview

```text
auth.users
    │
    └── profiles
          │
          └── User Profile

movies
    │
    ├── movie_awards
    │
    ├── favorites
    │
    └── watch_history
            │
            └── User

tv_shows
    │
    ├── seasons
    │     │
    │     └── episodes
    │
    ├── tv_show_awards
    │
    ├── favorites
    │
    └── watch_history
```

### Relationships

```text
profiles
    1 ───── 1 auth.users

movies
    1 ───── N movie_awards

tv_shows
    1 ───── N tv_show_awards

tv_shows
    1 ───── N seasons

seasons
    1 ───── N episodes

auth.users
    1 ───── N favorites

auth.users
    1 ───── N watch_history

movies
    1 ───── N favorites

tv_shows
    1 ───── N favorites

movies
    1 ───── N watch_history

episodes
    1 ───── N watch_history
```

---

# 3. `profiles`

Stores user profile information associated with Supabase Auth.

## Columns

| Column         | Type        | Constraints               | Description                |
| -------------- | ----------- | ------------------------- | -------------------------- |
| `profile_id`   | UUID        | PK, FK                    | References `auth.users.id` |
| `email`        | VARCHAR     | NOT NULL, UNIQUE          | User email                 |
| `username`     | VARCHAR     | UNIQUE                    | User's username            |
| `display_name` | VARCHAR     |                           | User's display name        |
| `avatar_url`   | TEXT        |                           | URL of user's avatar       |
| `created_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Creation time              |
| `updated_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Last update time           |

## Primary Key

```text
profiles.profile_id
```

## Foreign Key

```text
profiles.profile_id
    → auth.users.id
```

### Relationship

```text
auth.users
    │
    │ 1 : 1
    ▼
profiles
```

---

# 4. `movies`

Stores movie metadata obtained from TMDB.

## Columns

| Column              | Type        | Constraints                     | Description              |
| ------------------- | ----------- | ------------------------------- | ------------------------ |
| `movie_id`          | UUID        | PK, DEFAULT `gen_random_uuid()` | Internal Zeflix movie ID |
| `tmdb_id`           | INTEGER     | NOT NULL, UNIQUE                | TMDB movie ID            |
| `imdb_id`           | VARCHAR     | UNIQUE                          | IMDb movie ID            |
| `title`             | VARCHAR     | NOT NULL                        | Movie title              |
| `original_title`    | VARCHAR     |                                 | Original movie title     |
| `overview`          | TEXT        |                                 | Movie description        |
| `poster_path`       | TEXT        |                                 | TMDB poster path         |
| `backdrop_path`     | TEXT        |                                 | TMDB backdrop path       |
| `release_date`      | DATE        |                                 | Movie release date       |
| `vote_average`      | NUMERIC     | 0–10                            | TMDB rating              |
| `vote_count`        | INTEGER     | >= 0                            | Number of TMDB votes     |
| `runtime`           | INTEGER     | >= 0                            | Movie runtime in minutes |
| `original_language` | VARCHAR     |                                 | Original language        |
| `created_at`        | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time            |
| `updated_at`        | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Last update time         |

## Primary Key

```text
movies.movie_id
```

## External ID

```text
movies.tmdb_id
```

`tmdb_id` identifies the movie in TMDB.

`movie_id` is the internal identifier used by Zeflix.

---

# 5. `tv_shows`

Stores TV series metadata obtained from TMDB.

## Columns

| Column               | Type        | Constraints                     | Description                  |
| -------------------- | ----------- | ------------------------------- | ---------------------------- |
| `tv_id`              | UUID        | PK, DEFAULT `gen_random_uuid()` | Internal Zeflix TV series ID |
| `tmdb_id`            | INTEGER     | NOT NULL, UNIQUE                | TMDB TV series ID            |
| `imdb_id`            | VARCHAR     | UNIQUE                          | IMDb ID                      |
| `name`               | VARCHAR     | NOT NULL                        | TV series name               |
| `original_name`      | VARCHAR     |                                 | Original series name         |
| `overview`           | TEXT        |                                 | Series description           |
| `poster_path`        | TEXT        |                                 | TMDB poster path             |
| `backdrop_path`      | TEXT        |                                 | TMDB backdrop path           |
| `first_air_date`     | DATE        |                                 | First air date               |
| `last_air_date`      | DATE        |                                 | Last air date                |
| `vote_average`       | NUMERIC     | 0–10                            | TMDB rating                  |
| `vote_count`         | INTEGER     | >= 0                            | Number of TMDB votes         |
| `number_of_seasons`  | INTEGER     | >= 0                            | Number of seasons            |
| `number_of_episodes` | INTEGER     | >= 0                            | Number of episodes           |
| `original_language`  | VARCHAR     |                                 | Original language            |
| `created_at`         | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time                |
| `updated_at`         | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Last update time             |

## Primary Key

```text
tv_shows.tv_id
```

## External ID

```text
tv_shows.tmdb_id
```

---

# 6. `seasons`

Stores seasons belonging to a TV series.

## Columns

| Column          | Type        | Constraints                     | Description        |
| --------------- | ----------- | ------------------------------- | ------------------ |
| `season_id`     | UUID        | PK, DEFAULT `gen_random_uuid()` | Internal season ID |
| `tv_id`         | UUID        | NOT NULL, FK                    | Parent TV series   |
| `tmdb_id`       | INTEGER     |                                 | TMDB season ID     |
| `season_number` | INTEGER     | NOT NULL, >= 0                  | Season number      |
| `name`          | VARCHAR     |                                 | Season name        |
| `overview`      | TEXT        |                                 | Season description |
| `poster_path`   | TEXT        |                                 | Season poster      |
| `air_date`      | DATE        |                                 | Season air date    |
| `episode_count` | INTEGER     | >= 0                            | Number of episodes |
| `created_at`    | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time      |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Last update time   |

## Foreign Key

```text
seasons.tv_id
    → tv_shows.tv_id
```

### Relationship

```text
TV Series
    │
    ├── Season 1
    │     ├── Episode 1
    │     ├── Episode 2
    │     └── ...
    │
    ├── Season 2
    │     ├── Episode 1
    │     └── ...
    │
    └── ...
```

---

# 7. `episodes`

Stores episodes belonging to a season.

## Columns

| Column           | Type        | Constraints                     | Description         |
| ---------------- | ----------- | ------------------------------- | ------------------- |
| `episode_id`     | UUID        | PK, DEFAULT `gen_random_uuid()` | Internal episode ID |
| `season_id`      | UUID        | NOT NULL, FK                    | Parent season       |
| `tmdb_id`        | INTEGER     |                                 | TMDB episode ID     |
| `episode_number` | INTEGER     | NOT NULL, >= 0                  | Episode number      |
| `name`           | VARCHAR     | NOT NULL                        | Episode name        |
| `overview`       | TEXT        |                                 | Episode description |
| `still_path`     | TEXT        |                                 | Episode still image |
| `air_date`       | DATE        |                                 | Episode air date    |
| `runtime`        | INTEGER     | >= 0                            | Episode runtime     |
| `vote_average`   | NUMERIC     | 0–10                            | TMDB rating         |
| `vote_count`     | INTEGER     | >= 0                            | Number of votes     |
| `created_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time       |
| `updated_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Last update time    |

## Foreign Key

```text
episodes.season_id
    → seasons.season_id
```

---

# 8. `favorites`

Stores movies or TV series saved by users.

## Columns

| Column        | Type        | Constraints                     | Description                   |
| ------------- | ----------- | ------------------------------- | ----------------------------- |
| `favorite_id` | UUID        | PK, DEFAULT `gen_random_uuid()` | Favorite record ID            |
| `user_id`     | UUID        | NOT NULL, FK                    | User who created the favorite |
| `movie_id`    | UUID        | FK, nullable                    | Favorite movie                |
| `tv_id`       | UUID        | FK, nullable                    | Favorite TV series            |
| `created_at`  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time                 |

## Foreign Keys

```text
favorites.user_id
    → auth.users.id

favorites.movie_id
    → movies.movie_id

favorites.tv_id
    → tv_shows.tv_id
```

A favorite can reference either:

```text
Movie
OR
TV Series
```

---

# 9. `watch_history`

Stores the user's playback progress.

## Columns

| Column             | Type        | Constraints                     | Description                   |
| ------------------ | ----------- | ------------------------------- | ----------------------------- |
| `history_id`       | UUID        | PK, DEFAULT `gen_random_uuid()` | Watch history ID              |
| `user_id`          | UUID        | NOT NULL, FK                    | User                          |
| `movie_id`         | UUID        | FK, nullable                    | Watched movie                 |
| `episode_id`       | UUID        | FK, nullable                    | Watched episode               |
| `progress_seconds` | INTEGER     | NOT NULL, >= 0                  | Current playback position     |
| `duration_seconds` | INTEGER     | >= 0                            | Total duration                |
| `completed`        | BOOLEAN     | NOT NULL, DEFAULT `false`       | Whether content was completed |
| `last_watched_at`  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Last playback time            |
| `created_at`       | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time                 |
| `updated_at`       | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Last update time              |

## Foreign Keys

```text
watch_history.user_id
    → auth.users.id

watch_history.movie_id
    → movies.movie_id

watch_history.episode_id
    → episodes.episode_id
```

### Supported Content

```text
Movie
    ↓
watch_history.movie_id

TV Series
    ↓
Season
    ↓
Episode
    ↓
watch_history.episode_id
```

---

# 10. `movie_awards`

Stores award information for movies.

This table is maintained by Zeflix and is not dependent on TMDB movie metadata.

## Columns

| Column           | Type        | Constraints                     | Description        |
| ---------------- | ----------- | ------------------------------- | ------------------ |
| `movie_award_id` | UUID        | PK, DEFAULT `gen_random_uuid()` | Award record ID    |
| `movie_id`       | UUID        | NOT NULL, FK                    | Related movie      |
| `award_name`     | VARCHAR     | NOT NULL                        | Award organization |
| `category`       | VARCHAR     | NOT NULL                        | Award category     |
| `year`           | INTEGER     |                                 | Award year         |
| `result`         | VARCHAR     |                                 | Winner / Nominee   |
| `created_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time      |

## Foreign Key

```text
movie_awards.movie_id
    → movies.movie_id
```

### Example

```text
Oppenheimer
    │
    ├── Academy Awards
    │     ├── Best Picture
    │     ├── Best Director
    │     └── Best Actor
    │
    └── Golden Globes
          └── Best Director
```

---

# 11. `tv_show_awards`

Stores award information for TV series.

## Columns

| Column        | Type        | Constraints                     | Description        |
| ------------- | ----------- | ------------------------------- | ------------------ |
| `tv_award_id` | UUID        | PK, DEFAULT `gen_random_uuid()` | Award record ID    |
| `tv_id`       | UUID        | NOT NULL, FK                    | Related TV series  |
| `award_name`  | VARCHAR     | NOT NULL                        | Award organization |
| `category`    | VARCHAR     | NOT NULL                        | Award category     |
| `year`        | INTEGER     |                                 | Award year         |
| `result`      | VARCHAR     |                                 | Winner / Nominee   |
| `created_at`  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`       | Creation time      |

## Foreign Key

```text
tv_show_awards.tv_id
    → tv_shows.tv_id
```

### Example

```text
Breaking Bad
    │
    └── Primetime Emmy Awards
          ├── Outstanding Drama Series
          └── Outstanding Lead Actor
```

---

# 12. Content Architecture

Zeflix separates Movies and TV Series at the database level.

```text
                         Content
                            │
                ┌───────────┴───────────┐
                │                       │
              Movie                 TV Series
                │                       │
            movies                  tv_shows
                │                       │
        movie_awards               seasons
                                        │
                                    episodes
                                        │
                                tv_show_awards
```

---

# 13. External Data vs Zeflix Data

## TMDB-managed metadata

The following fields primarily originate from TMDB:

```text
tmdb_id
title / name
original_title / original_name
overview
poster_path
backdrop_path
release_date / first_air_date
last_air_date
vote_average
vote_count
runtime
number_of_seasons
number_of_episodes
original_language
```

## Zeflix-managed data

The following data is managed by Zeflix:

```text
profiles
favorites
watch_history
movie_awards
tv_show_awards
```

## Important ID Rule

Use internal Zeflix IDs for database relationships:

```text
movies.movie_id
tv_shows.tv_id
seasons.season_id
episodes.episode_id
```

Use TMDB IDs only for integration with TMDB:

```text
movies.tmdb_id
tv_shows.tmdb_id
seasons.tmdb_id
episodes.tmdb_id
```

Example:

```text
Zeflix
movie_id = UUID-A
        │
        └── tmdb_id = 872585

movie_awards.movie_id
        │
        └── UUID-A
```

Do not use `tmdb_id` as the internal foreign key when a Zeflix primary key is available.

---

# 14. Current Schema Summary

| Table            | Purpose                  | Main Relationship |
| ---------------- | ------------------------ | ----------------- |
| `profiles`       | User profile             | `auth.users`      |
| `movies`         | Movie metadata           | TMDB              |
| `tv_shows`       | TV series metadata       | TMDB              |
| `seasons`        | TV seasons               | `tv_shows`        |
| `episodes`       | TV episodes              | `seasons`         |
| `favorites`      | Saved movies / TV series | Users + Content   |
| `watch_history`  | Playback progress        | Users + Content   |
| `movie_awards`   | Movie awards             | `movies`          |
| `tv_show_awards` | TV series awards         | `tv_shows`        |

## Core Relationship Diagram

```text
                         auth.users
                              │
                              │
                         profiles
                              │
              ┌───────────────┴───────────────┐
              │                               │
          favorites                      watch_history
              │                               │
        ┌─────┴─────┐                   ┌─────┴─────┐
        │           │                   │           │
      movies     tv_shows             movies     episodes
        │           │                               │
        │           ├──────────────┐                │
        │           │              │                │
        │         seasons      tv_show_awards       │
        │           │                               │
        │        episodes ◄─────────────────────────┘
        │
   movie_awards
```
