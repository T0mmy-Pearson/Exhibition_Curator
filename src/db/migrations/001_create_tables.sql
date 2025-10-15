-- Create Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Exhibitions table
CREATE TABLE exhibitions (
  exhibition_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Exhibition Artworks junction table
CREATE TABLE exhibition_artworks (
  exhibition_id INTEGER REFERENCES exhibitions(exhibition_id) ON DELETE CASCADE,
  artwork_id VARCHAR(255) NOT NULL,
  notes TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (exhibition_id, artwork_id)
);

-- Create User Favorites table
CREATE TABLE user_favorites (
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id VARCHAR(255) NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- Create indexes for better performance
CREATE INDEX idx_exhibitions_user_id ON exhibitions(user_id);
CREATE INDEX idx_exhibition_artworks_exhibition_id ON exhibition_artworks(exhibition_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);