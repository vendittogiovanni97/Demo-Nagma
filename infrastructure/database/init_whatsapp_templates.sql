-- Template WhatsApp (idempotent via NOT EXISTS)
INSERT INTO "whatsapp_templates" ("name", "category", "body", "isActive", "createdAt", "updatedAt")
SELECT * FROM (VALUES
  ('Conferma Appuntamento', 'Conferma',
    E'Ciao {{nome}}!\n\nTi confermiamo il tuo appuntamento per il {{data}} alle {{ora}}.\n\nRicorda di:\n• Mangiare qualcosa prima\n• Non bere alcolici 24h prima\n• Se hai domande scrivimi!\n\nA presto!',
    true, NOW(), NOW()),
  ('Promemoria Appuntamento', 'Promemoria',
    E'Ciao {{nome}}!\n\nTi ricordiamo che hai un appuntamento domani alle {{ora}}.\n\nSe non puoi più venire, per favore contattaci il prima possibile così possiamo riprogrammare.\n\nA domani!',
    true, NOW(), NOW()),
  ('Richiesta Caparra', 'Caparra',
    E'Ciao {{nome}}!\n\nPer confermare la prenotazione del {{data}} alle {{ora}}, ti chiediamo di versare una caparra di €30.\n\nPuoi versarla tramite:\n• Bonifico: IT00X0000000000000000000000\n• WhatsApp con satispay\n\nLasciaci la ricevuta una volta versato!',
    true, NOW(), NOW()),
  ('Conferma Caparra Ricevuta', 'Conferma',
    E'Ciao {{nome}}!\n\nAbbiamo ricevuto la caparra di €30 per l''appuntamento del {{data}} alle {{ora}}.\n\nSei confermato!\n\nTi ricordiamo le istruzioni prima dell''appuntamento:\n• Mangiare qualcosa prima\n• Non bere alcolici 24h prima\n• Portare documento',
    true, NOW(), NOW()),
  ('Tattoo Pronto', 'Info',
    E'Ciao {{nome}}!\n\nIl tuo tatuaggio è guarito bene! Per i prossimi 15 giorni:\n\nCura:\n• Applica crema lenitiva 2-3 volte al giorno\n• Lava con sapone neutro delicatamente\n\nEvita:\n• Non grattare, non esponi al sole\n• No piscine, mare, sauna\n\nSe hai dubbi scrivici!',
    true, NOW(), NOW()),
  ('Prenotazione Annullata', 'Annullamento',
    E'Ciao {{nome}}!\n\nAbbiamo cancellato la tua prenotazione del {{data}} alle {{ora}}.\n\nSe vuoi riprogrammare, scrivici qui!',
    true, NOW(), NOW()),
  ('Coupon Sconto', 'Marketing',
    E'Ciao {{nome}}!\n\nTi regaliamo il 10% di sconto sul tuo prossimo tatuaggio!\n\nCodice: TATTOO10\n\nLo sconto è valido per 3 mesi.\n\nPrenota quando vuoi!',
    true, NOW(), NOW()),
  ('Check Post Trattamento', 'Follow-up',
    E'Ciao {{nome}}!\n\nCome va il tatuaggio? È tutto okay?\n\nSe hai dubbi sulla guarigione o necessiti altre informazioni, siamo qui!',
    true, NOW(), NOW())
) AS v(name, category, body, is_active, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM "whatsapp_templates" w WHERE w.name = v.name);
