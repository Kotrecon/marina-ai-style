CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clothes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    material VARCHAR(50) DEFAULT '',
    season VARCHAR(20) NOT NULL,
    style VARCHAR(30) NOT NULL,
    image_path VARCHAR(255),
    wear_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE outfits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    occasion VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE outfit_items (
    outfit_id INTEGER REFERENCES outfits(id) ON DELETE CASCADE,
    clothes_id INTEGER REFERENCES clothes(id) ON DELETE CASCADE,
    PRIMARY KEY (outfit_id, clothes_id)
);

CREATE TABLE dress_codes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    required_categories TEXT NOT NULL
);

CREATE INDEX idx_clothes_user ON clothes(user_id);
CREATE INDEX idx_outfits_user ON outfits(user_id);