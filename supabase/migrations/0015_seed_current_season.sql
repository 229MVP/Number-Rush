-- Number Rush: bootstrap active ranked season

INSERT INTO public.ranked_seasons (season_key, name, starts_at, ends_at, active)
VALUES (
  'season-1',
  'SEASON 1',
  now() - interval '7 days',
  now() + interval '180 days',
  true
)
ON CONFLICT (season_key) DO NOTHING;
