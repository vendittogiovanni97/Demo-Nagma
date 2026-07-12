-- Form template prenotazione (idempotent)
INSERT INTO "form_templates" ("name", "schemaB64", "createdAt", "updatedAt")
SELECT * FROM (VALUES
  ('Scheda Prenotazione Tattoo',
    E'Wx5AIQp3bG9iYWwgdGVtcGxhdGUgZm9yIHRhdHRvbyBib29raW5nIGZvcm0=',
    NOW(), NOW())
) AS v(name, schema_b64, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM "form_templates" f WHERE f.name = v.name);
