-- Staff members (idempotent via NOT EXISTS)
INSERT INTO "staff" ("name", "type", "color", "createdAt", "updatedAt")
SELECT * FROM (VALUES
  ('Giuseppe Savoia',  'COLLABORATORE'::"StaffType", '#3b82f6', NOW(), NOW()),
  ('Aniello Gozzi',    'COLLABORATORE'::"StaffType", '#10b981', NOW(), NOW()),
  ('Pietro Russo',     'COLLABORATORE'::"StaffType", '#f59e0b', NOW(), NOW()),
  ('Lorenzo Vignone',  'COLLABORATORE'::"StaffType", '#ef4444', NOW(), NOW()),
  ('Vincenzo Santoro', 'COLLABORATORE'::"StaffType", '#8b5cf6', NOW(), NOW()),
  ('Martina Paolino',  'APPRENDISTA'::"StaffType",   '#ec4899', NOW(), NOW()),
  ('Genny Diotiaiuti', 'APPRENDISTA'::"StaffType",   '#06b6d4', NOW(), NOW()),
  ('Boston',           'APPRENDISTA'::"StaffType",   '#f97316', NOW(), NOW())
) AS v(name, type, color, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM "staff" s WHERE s.name = v.name);
