-- Template predefinito per gli auguri di compleanno automatici: il deploy esegue
-- solo le migration (non il seed), quindi senza questa riga lo studio non avrebbe
-- alcun template e gli auguri non partirebbero. Lo studio può poi modificarlo dalla UI.
-- Non viene creato se esiste già un template compleanno (anche disattivato).
INSERT INTO "whatsapp_templates" ("name", "category", "body", "isActive", "createdAt", "updatedAt")
SELECT
  'Auguri di Compleanno',
  'COMPLEANNO',
  E'Tanti auguri di buon compleanno da Nagma Tattoo Studio, {{nome}}! 🎂🎉\n\nTi aspettiamo in studio, a presto!',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "whatsapp_templates"
  WHERE "deletedAt" IS NULL
    AND (
      LOWER("category") = 'compleanno'
      OR "name" ILIKE '%compleanno%'
      OR "name" ILIKE '%auguri%'
    )
);
