-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/jghtqgsnevtzxhscfirg/sql/new

CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id  uuid REFERENCES secrets(id) ON DELETE CASCADE NOT NULL,
  parent_id  uuid REFERENCES comments(id) ON DELETE CASCADE,
  text       text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add parent_id if table already existed without it
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'anyone reads comments') THEN
    CREATE POLICY "anyone reads comments" ON comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'anyone inserts comments') THEN
    CREATE POLICY "anyone inserts comments" ON comments FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Supports both increment (+1) and decrement (-1), floor at 0
CREATE OR REPLACE FUNCTION adjust_reaction(p_secret_id uuid, p_col_name text, p_delta int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_col_name NOT IN ('reaction_me_too', 'reaction_wild', 'reaction_doubtful') THEN
    RAISE EXCEPTION 'Invalid column';
  END IF;
  EXECUTE format(
    'UPDATE secrets SET %I = GREATEST(0, %I + $1) WHERE id = $2',
    p_col_name, p_col_name
  ) USING p_delta, p_secret_id;
END;
$$;
