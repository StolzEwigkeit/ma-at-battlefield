CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  seats INT NOT NULL DEFAULT 4,
  status VARCHAR(20) NOT NULL DEFAULT 'lobby',
  turn_index INT NOT NULL DEFAULT 0,
  round_num INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  table_id INT NOT NULL REFERENCES tables(id),
  token VARCHAR(40) NOT NULL,
  nickname VARCHAR(24) NOT NULL,
  god_id VARCHAR(20) NOT NULL,
  class_id VARCHAR(20) NOT NULL,
  seat_index INT NOT NULL,
  position INT NOT NULL DEFAULT 1,
  health INT NOT NULL DEFAULT 10,
  feathers INT NOT NULL DEFAULT 0,
  cards INT NOT NULL DEFAULT 3,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  is_out BOOLEAN NOT NULL DEFAULT FALSE,
  ability_used BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (table_id, seat_index),
  UNIQUE (table_id, token)
);

CREATE TABLE IF NOT EXISTS alliances (
  id SERIAL PRIMARY KEY,
  table_id INT NOT NULL REFERENCES tables(id),
  from_player_id INT NOT NULL REFERENCES players(id),
  to_player_id INT NOT NULL REFERENCES players(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_round INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_log (
  id SERIAL PRIMARY KEY,
  table_id INT NOT NULL REFERENCES tables(id),
  round_num INT NOT NULL DEFAULT 1,
  kind VARCHAR(30) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_table ON players(table_id);
CREATE INDEX IF NOT EXISTS idx_alliances_table ON alliances(table_id);
CREATE INDEX IF NOT EXISTS idx_log_table ON game_log(table_id, id DESC);
