CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    occasion VARCHAR(100),
    advice TEXT NOT NULL,
    items_snapshot TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
