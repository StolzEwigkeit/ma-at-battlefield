ALTER TABLE t_p15470832_ma_at_battlefield.tables ADD COLUMN deck TEXT NULL;
ALTER TABLE t_p15470832_ma_at_battlefield.tables ADD COLUMN reshuffles INTEGER NOT NULL DEFAULT 0;
ALTER TABLE t_p15470832_ma_at_battlefield.player_cards ADD COLUMN discarded_at TIMESTAMP NULL;