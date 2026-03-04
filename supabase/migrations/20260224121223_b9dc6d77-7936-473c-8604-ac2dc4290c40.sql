
-- Scoreboard table for CTF submissions
CREATE TABLE public.scoreboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  solved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.scoreboard ENABLE ROW LEVEL SECURITY;

-- Anyone can view the scoreboard
CREATE POLICY "Scoreboard is publicly readable"
ON public.scoreboard FOR SELECT USING (true);

-- Anyone can insert (no auth required for CTF)
CREATE POLICY "Anyone can submit scores"
ON public.scoreboard FOR INSERT WITH CHECK (true);

-- Index for leaderboard queries
CREATE INDEX idx_scoreboard_level_time ON public.scoreboard (level, solved_at);
