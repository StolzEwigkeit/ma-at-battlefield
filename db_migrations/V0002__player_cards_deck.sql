CREATE TABLE IF NOT EXISTS player_cards (
  id SERIAL PRIMARY KEY,
  table_id INT NOT NULL REFERENCES tables(id),
  player_id INT NOT NULL REFERENCES players(id),
  card_id VARCHAR(40) NOT NULL,
  kind VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'hand',
  drawn_round INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_player ON player_cards(player_id, status);
CREATE INDEX IF NOT EXISTS idx_cards_table ON player_cards(table_id);
