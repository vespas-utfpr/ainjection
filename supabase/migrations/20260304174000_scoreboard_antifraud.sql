-- Anti-fraud hardening for shared scoreboard
ALTER TABLE public.scoreboard
ADD COLUMN IF NOT EXISTS proof_id TEXT;

-- Backfill old rows so constraint can be enforced
UPDATE public.scoreboard
SET proof_id = COALESCE(proof_id, gen_random_uuid()::text)
WHERE proof_id IS NULL;

ALTER TABLE public.scoreboard
ALTER COLUMN proof_id SET NOT NULL;

-- Prevent replay of solve tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'scoreboard_proof_id_key'
  ) THEN
    ALTER TABLE public.scoreboard
    ADD CONSTRAINT scoreboard_proof_id_key UNIQUE (proof_id);
  END IF;
END $$;

-- Prevent same player from solving same level multiple times
CREATE UNIQUE INDEX IF NOT EXISTS scoreboard_unique_player_level
ON public.scoreboard ((lower(player_name)), level);
