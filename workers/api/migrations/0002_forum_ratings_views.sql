-- D1 Migration 0002 for Forum, Comments, Ratings, and Views count

-- Views count table
CREATE TABLE IF NOT EXISTS manga_views (
  manga_id       TEXT PRIMARY KEY,
  views_count    INTEGER DEFAULT 0,
  last_viewed_at TEXT DEFAULT (datetime('now'))
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id       TEXT NOT NULL,
  rating         INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
  created_at     TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, manga_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id       TEXT NOT NULL,
  chapter_id     TEXT, -- NULL for manga level comments, not null for chapter level comments
  content        TEXT NOT NULL,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_manga ON comments(manga_id, chapter_id);

-- Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  description    TEXT DEFAULT ''
);

-- Insert default categories
INSERT OR IGNORE INTO forum_categories (id, name, description) VALUES 
  (1, 'Announcements', 'Official news and announcements from Reader''s Haven.'),
  (2, 'General Manga Chat', 'Talk about your favorite manga, manhwa, and novels here!'),
  (3, 'Recommendations', 'Looking for something new? Ask the community for recommendations!'),
  (4, 'Suggestions & Feedback', 'Help us improve Reader''s Haven with your feedback.');

-- Forum Threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id    INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  content        TEXT NOT NULL,
  views_count    INTEGER DEFAULT 0,
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);

-- Forum Posts (replies to threads)
CREATE TABLE IF NOT EXISTS forum_posts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id      INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
