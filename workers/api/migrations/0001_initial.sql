-- Reader's Haven D1 Database Schema
-- Migrations for Cloudflare D1 (SQLite-based)

-- Users table (linked to MangaDex OAuth)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  username    TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Reading history
CREATE TABLE IF NOT EXISTS reading_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id    TEXT NOT NULL,
  manga_title TEXT NOT NULL DEFAULT '',
  cover_file  TEXT DEFAULT '',
  chapter_id  TEXT NOT NULL,
  chapter_num TEXT,
  page        INTEGER DEFAULT 1,
  read_at     TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user
  ON reading_history(user_id, read_at DESC);

-- Follows / reading status
CREATE TABLE IF NOT EXISTS follows (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id    TEXT NOT NULL,
  status      TEXT CHECK(status IN ('reading','completed','plan_to_read','dropped','on_hold')) NOT NULL DEFAULT 'reading',
  added_at    TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, manga_id)
);

-- Custom collections
CREATE TABLE IF NOT EXISTS collections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_public   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_collections_user
  ON collections(user_id);

-- Collection items
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  manga_id      TEXT NOT NULL,
  position      INTEGER DEFAULT 0,
  added_at      TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (collection_id, manga_id)
);
