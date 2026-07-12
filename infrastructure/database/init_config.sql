-- Config di sistema (idempotent)
INSERT INTO "configs" ("paramsKey", "value", "createdAt", "updatedAt")
VALUES
  ('FILES_PATH', '/uploads/attachments/', NOW(), NOW()),
  ('JWT_EXPIRY', '8h', NOW(), NOW()),
  ('BCRYPT_SALT_ROUNDS', '10', NOW(), NOW()),
  ('LOGIN_RATE_LIMIT_WINDOW_MINUTES', '15', NOW(), NOW()),
  ('LOGIN_RATE_LIMIT_MAX_ATTEMPTS', '5', NOW(), NOW()),
  ('SESSION_TIMEOUT_MINUTES', '30', NOW(), NOW()),
  ('MAX_PAGE_LIMIT', '100', NOW(), NOW()),
  ('APP_VERSION', '1.0.0', NOW(), NOW()),
  ('LOG_LEVEL', 'INFO', NOW(), NOW()),
  ('DEBUG_HTTP', 'false', NOW(), NOW()),
  ('SHOW_CONSENSI', 'false', NOW(), NOW()),
  ('SHOW_POSIZIONAMENTO', 'false', NOW(), NOW()),
  ('BOOKING_UPDATE_PASSWORD', '', NOW(), NOW())
ON CONFLICT ("paramsKey") DO NOTHING;
