-- Demo seed data for Yam Master
-- Idempotent inserts for users and finished game history.

BEGIN;

-- -------------------------------------------------------------------
-- Users for manual login tests
-- Password for all seeded users: Test123!
-- -------------------------------------------------------------------
INSERT INTO users (email, username, password_hash, status)
VALUES
  ('demo.alice@yam.local', 'alice_demo', crypt('Test123!', gen_salt('bf')), 'active'),
  ('demo.bob@yam.local', 'bob_demo', crypt('Test123!', gen_salt('bf')), 'active'),
  ('demo.claire@yam.local', 'claire_demo', crypt('Test123!', gen_salt('bf')), 'active'),
  ('demo.david@yam.local', 'david_demo', crypt('Test123!', gen_salt('bf')), 'active')
ON CONFLICT (username) DO UPDATE
SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  status = 'active';

INSERT INTO user_identities (user_id, provider, provider_user_id, email_verified)
SELECT u.id, 'local', u.email, true
FROM users u
WHERE u.username IN ('alice_demo', 'bob_demo', 'claire_demo', 'david_demo')
ON CONFLICT (provider, provider_user_id) DO NOTHING;

-- -------------------------------------------------------------------
-- Finished games with coherent participants/scores/winners
-- -------------------------------------------------------------------
WITH seed_users AS (
  SELECT id, username
  FROM users
  WHERE username IN ('alice_demo', 'bob_demo', 'claire_demo', 'david_demo')
),
alice AS (SELECT id FROM seed_users WHERE username = 'alice_demo'),
bob AS (SELECT id FROM seed_users WHERE username = 'bob_demo'),
claire AS (SELECT id FROM seed_users WHERE username = 'claire_demo'),
david AS (SELECT id FROM seed_users WHERE username = 'david_demo')
INSERT INTO games (
  id,
  mode,
  status,
  created_by_user_id,
  started_at,
  ended_at,
  winner_user_id,
  winner_slot,
  win_reason,
  metadata
)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'online',
    'finished',
    (SELECT id FROM alice),
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days' + INTERVAL '18 minutes',
    (SELECT id FROM alice),
    1,
    'five-aligned',
    jsonb_build_object('idGame', 'seed-g-001', 'seeded', true)
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'online',
    'finished',
    (SELECT id FROM bob),
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '22 minutes',
    (SELECT id FROM bob),
    1,
    'no-pawns-left',
    jsonb_build_object('idGame', 'seed-g-002', 'seeded', true)
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'online',
    'finished',
    (SELECT id FROM claire),
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days' + INTERVAL '17 minutes',
    (SELECT id FROM alice),
    2,
    'five-aligned',
    jsonb_build_object('idGame', 'seed-g-003', 'seeded', true)
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'online',
    'finished',
    (SELECT id FROM david),
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '20 minutes',
    (SELECT id FROM david),
    1,
    'no-pawns-left',
    jsonb_build_object('idGame', 'seed-g-004', 'seeded', true)
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'bot',
    'finished',
    (SELECT id FROM alice),
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days' + INTERVAL '11 minutes',
    (SELECT id FROM alice),
    1,
    'five-aligned',
    jsonb_build_object('idGame', 'seed-g-005', 'seeded', true)
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'bot',
    'finished',
    (SELECT id FROM bob),
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '9 minutes',
    NULL,
    2,
    'five-aligned',
    jsonb_build_object('idGame', 'seed-g-006', 'seeded', true)
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'online',
    'finished',
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '16 minutes',
    (SELECT id FROM claire),
    2,
    'five-aligned',
    jsonb_build_object('idGame', 'seed-g-007', 'seeded', true)
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'online',
    'finished',
    (SELECT id FROM david),
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '25 minutes',
    NULL,
    NULL,
    'no-pawns-left',
    jsonb_build_object('idGame', 'seed-g-008', 'seeded', true)
  )
ON CONFLICT (id) DO UPDATE
SET
  mode = EXCLUDED.mode,
  status = EXCLUDED.status,
  created_by_user_id = EXCLUDED.created_by_user_id,
  started_at = EXCLUDED.started_at,
  ended_at = EXCLUDED.ended_at,
  winner_user_id = EXCLUDED.winner_user_id,
  winner_slot = EXCLUDED.winner_slot,
  win_reason = EXCLUDED.win_reason,
  metadata = EXCLUDED.metadata;

WITH seed_users AS (
  SELECT id, username
  FROM users
  WHERE username IN ('alice_demo', 'bob_demo', 'claire_demo', 'david_demo')
),
alice AS (SELECT id FROM seed_users WHERE username = 'alice_demo'),
bob AS (SELECT id FROM seed_users WHERE username = 'bob_demo'),
claire AS (SELECT id FROM seed_users WHERE username = 'claire_demo'),
david AS (SELECT id FROM seed_users WHERE username = 'david_demo')
INSERT INTO game_players (
  game_id,
  user_id,
  guest_label,
  socket_id,
  player_slot,
  score,
  is_winner
)
VALUES
  ('11111111-1111-4111-8111-111111111111', (SELECT id FROM alice), 'alice_demo', 'seed:alice:001', 1, 6, true),
  ('11111111-1111-4111-8111-111111111111', (SELECT id FROM bob), 'bob_demo', 'seed:bob:001', 2, 3, false),

  ('22222222-2222-4222-8222-222222222222', (SELECT id FROM bob), 'bob_demo', 'seed:bob:002', 1, 4, true),
  ('22222222-2222-4222-8222-222222222222', (SELECT id FROM claire), 'claire_demo', 'seed:claire:002', 2, 2, false),

  ('33333333-3333-4333-8333-333333333333', (SELECT id FROM claire), 'claire_demo', 'seed:claire:003', 1, 3, false),
  ('33333333-3333-4333-8333-333333333333', (SELECT id FROM alice), 'alice_demo', 'seed:alice:003', 2, 5, true),

  ('44444444-4444-4444-8444-444444444444', (SELECT id FROM david), 'david_demo', 'seed:david:004', 1, 4, true),
  ('44444444-4444-4444-8444-444444444444', (SELECT id FROM alice), 'alice_demo', 'seed:alice:004', 2, 1, false),

  ('55555555-5555-4555-8555-555555555555', (SELECT id FROM alice), 'alice_demo', 'seed:alice:005', 1, 5, true),
  ('55555555-5555-4555-8555-555555555555', NULL, 'bot', 'seed:bot:005', 2, 1, false),

  ('66666666-6666-4666-8666-666666666666', (SELECT id FROM bob), 'bob_demo', 'seed:bob:006', 1, 2, false),
  ('66666666-6666-4666-8666-666666666666', NULL, 'bot', 'seed:bot:006', 2, 5, true),

  ('77777777-7777-4777-8777-777777777777', NULL, 'invited_guest', 'seed:guest:007', 1, 2, false),
  ('77777777-7777-4777-8777-777777777777', (SELECT id FROM claire), 'claire_demo', 'seed:claire:007', 2, 5, true),

  ('88888888-8888-4888-8888-888888888888', (SELECT id FROM david), 'david_demo', 'seed:david:008', 1, 3, false),
  ('88888888-8888-4888-8888-888888888888', (SELECT id FROM bob), 'bob_demo', 'seed:bob:008', 2, 3, false)
ON CONFLICT (game_id, player_slot) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  guest_label = EXCLUDED.guest_label,
  socket_id = EXCLUDED.socket_id,
  score = EXCLUDED.score,
  is_winner = EXCLUDED.is_winner;

COMMIT;
