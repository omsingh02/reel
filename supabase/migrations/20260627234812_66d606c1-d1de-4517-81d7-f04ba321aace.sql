
ALTER TABLE public.watchlist_items
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'watchlist',
  ADD COLUMN IF NOT EXISTS rating numeric,
  ADD COLUMN IF NOT EXISTS watched_at timestamptz,
  ADD COLUMN IF NOT EXISTS runtime integer;

CREATE TABLE IF NOT EXISTS public.hidden_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tmdb_id integer NOT NULL,
  tmdb_type text NOT NULL,
  hidden_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, tmdb_type)
);
GRANT SELECT, INSERT, DELETE ON public.hidden_items TO authenticated;
GRANT ALL ON public.hidden_items TO service_role;
ALTER TABLE public.hidden_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own hidden items"
  ON public.hidden_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own hidden items"
  ON public.hidden_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their own hidden items"
  ON public.hidden_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.episode_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tmdb_id integer NOT NULL,
  season integer NOT NULL,
  episode integer NOT NULL,
  watched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, season, episode)
);
GRANT SELECT, INSERT, DELETE ON public.episode_progress TO authenticated;
GRANT ALL ON public.episode_progress TO service_role;
ALTER TABLE public.episode_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own episode progress"
  ON public.episode_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own episode progress"
  ON public.episode_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own episode progress"
  ON public.episode_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
