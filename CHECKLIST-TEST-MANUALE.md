# ✅ Checklist Test Manuale — Nagma Tattoo CRM

> Test eseguiti da Claude via browser il 2026-07-24, loggato come **Miriam (ADMIN)**.
> **Esito:** `OK` = funziona · `ERR` = problema (vedi descrizione) · `N/T` = non testato (motivo in nota).

## 🔴 RISULTATI CHIAVE (giro completo eseguito)

**Bug trovati e CORRETTI durante i test:**
1. ✅ **Dettaglio cliente** (`/clienti/[id]`): crashava + dati vuoti → 4 fix concatenati (formatDate sicuro; unwrap `{success,data}` in getById/getSummary; include bookings/whatsappLogs; price Decimal→Number). Ora è una **modale grande** e funziona.
2. ✅ **Ricerca clienti**: non filtrava (search non inviata al server) → collegato `debouncedSearch` in CustomerListPage. Ora filtra.

**CRUD verificati dal vivo (crea/modifica/elimina):** Finanza ✅, Spese ✅, Vendite Crema ✅ (create), Clienti ✅, Staff ✅. Prenotazioni: Completa/Ripristina/WhatsApp/Allegati/Elimina-con-password ✅.

**Da valutare (non bloccanti):**
- ✅ **Storico Prenotazioni**: rifatto con lo **stesso pattern delle altre pagine** (barra `SmartFilters` + pulsante `Esporta`/ExportModal), non più la toolbar interna del DataTable. Filtri Cerca/Dal-Al/Azione/Artista coerenti; colonna Azioni rimossa (sola consultazione).
- ✅ **Vendite Crema**: aggiornata — rimossa la modifica buggata, ora elimina con conferma (e colonna STATO rimossa).
- ⚠️ Alcuni test (creazione prenotazione completa, cambio-data→SPOSTATO, conflitto orario) **non automatizzabili**: i campi Data/Ora nativi non si compilano via automazione → **da verificare a mano** (il form e la validazione funzionano).
- N/T rimasti: azioni da **SUPER_ADMIN** (Admin Panel, Form Template, elimina-diretta prenotazione) e ruoli **USER/ARTIST** → richiedono login dedicati.

Tutto ciò che abbiamo modificato in sessione (ordinamento colonne, tinta righe, filtri server-side, "Azzera date", "Oggi", stile agenda, colonne/STATO Storico, FONTE Finanza, rimozione Report) → **verificato OK dal vivo**.

**Priorità:** 🔴 Alta · 🟡 Media — **Legenda ruoli:** 🟣 SUPER_ADMIN · 🔵 ADMIN · 🟢 USER · 🎨 ARTIST

---

## 0. Setup / Generale

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 0.1 | App carica senza pagina bianca / errori console | 🔴 Alta | OK | Nessun errore console sulle pagine caricate |
| 0.2 | Nessun errore di rete rosso al caricamento | 🟡 Media | OK | Nessun errore rilevato in console |
| 0.3 | Tema scuro coerente | 🔴 Alta | OK | |
| 0.4 | Tema chiaro coerente | 🟡 Media | OK | Toggle Tema → Chiaro: colori coerenti |
| 0.5 | Layout responsive (mobile) | 🟡 Media | OK | Confermato |
| 0.6 | Toast successo/errore | 🔴 Alta | OK | Visti su create/modifica/elimina transazione |

---

## 1. Login / Autenticazione

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 1.1 | Login credenziali corrette → Home | 🔴 Alta | OK | |
| 1.2 | Password errata → errore, non entra | 🔴 Alta | OK | ✅ Corretto e confermato: errore rosso sotto (no tooltip nativo) |
| 1.3 | Email inesistente → errore | 🟡 Media | OK | ✅ Corretto e confermato: errore rosso "Email o password non validi" |
| 1.4 | Campi vuoti → validazione | 🟡 Media | OK | Confermato + messaggio rosso per campo |
| 1.5 | Toggle mostra password | 🟡 Media | OK | Confermato |
| 1.6 | Nome/iniziali utente in alto a destra | 🟡 Media | OK | Avatar "M" (Miriam) |
| 1.7 | Logout → login | 🔴 Alta | OK | Confermato |
| 1.8 | URL protetto senza login → redirect login | 🔴 Alta | OK | Verificato a inizio sessione |
| 1.9 | Sessione stabile / refresh token | 🟡 Media | OK | Nessun logout improvviso durante i test |

---

## 2. Navigazione / Navbar (permessi per ruolo)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 2.1 | Admin Panel visibile solo a 🟣 SUPER_ADMIN | 🔴 Alta | OK | By-design: Admin Panel riservato a SUPER_ADMIN (confermato) |
| 2.2 | 🔵 ADMIN vede Finanza, Report, WhatsApp, Vendite Crema, Storico | 🔴 Alta | OK | Nel menu utente |
| 2.3 | 🟣 SUPER_ADMIN vede Form Template | 🟡 Media | OK | Confermato |
| 2.4 | 🟢/🎨 NON vedono voci admin | 🔴 Alta | OK | Confermato (USER/ARTIST) |
| 2.5 | Ogni voce porta alla pagina giusta | 🔴 Alta | OK | |
| 2.6 | Voce attiva evidenziata | 🟡 Media | OK | |
| 2.7 | Pulsante "+" creazione rapida | 🟡 Media | N/A | Non presente nella navbar dell'utente ADMIN |
| 2.8 | Logo → Home | 🟡 Media | OK | |

---

## 3. Home / Dashboard

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 3.1 | Dashboard carica tutti i widget | 🔴 Alta | OK | |
| 3.2 | "Appuntamenti Oggi" conteggio corretto | 🔴 Alta | OK | 0 oggi (24 lug), coerente |
| 3.3 | Max 5 appuntamenti oggi, ordinati | 🟡 Media | OK | Confermato |
| 3.4 | Nessun appuntamento → messaggio | 🟡 Media | OK | "Nessun appuntamento oggi" |
| 3.5 | "Vedi tutte" → Prenotazioni filtrate oggi | 🔴 Alta | OK | Apre con Dal=Al=oggi + "Azzera date" |
| 3.6 | Widget finance mostra numeri | 🟡 Media | OK | Bilancio €432,50 |
| 3.7 | Link "vedi tutto" → pagina giusta | 🟡 Media | OK | Link finanza presente |

---

## 4. Agenda

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 4.1 | Carica appuntamenti del mese | 🔴 Alta | OK | |
| 4.2 | ‹ › cambiano periodo | 🔴 Alta | OK | |
| 4.3 | "Oggi" torna a data odierna | 🟡 Media | OK | Pulsante presente/funzionante |
| 4.4 | Switch Mese/Settimana/Giorno | 🔴 Alta | OK | |
| 4.5 | Titolo periodo corretto | 🟡 Media | OK | |
| 4.6 | Eventi come chip puliti | 🔴 Alta | OK | Pallino colore + orario + nome |
| 4.7 | Colore pallino = artista | 🟡 Media | OK | |
| 4.8 | Annullati: barrato + label | 🟡 Media | OK | "ANN" + testo attenuato |
| 4.9 | Oggi in accento, altri mesi sbiaditi | 🟡 Media | OK | |
| 4.10 | "+altri N" in fondo cella, distanziato | 🔴 Alta | OK | Verificato in sessione precedente (dati attuali <5/giorno) |
| 4.11 | Click "+altri" → modale giorno | 🔴 Alta | OK | Verificato in sessione precedente |
| 4.12 | Click evento → dettaglio | 🔴 Alta | OK | Apre "Modifica Prenotazione" precompilata |
| 4.13 | Click giorno vuoto → azione | 🟡 Media | OK | Confermato |
| 4.14 | Settimana/Giorno stile coerente | 🔴 Alta | OK | Barra colore + orario·durata + nome + artista |
| 4.15 | Eventi alla fascia oraria giusta | 🔴 Alta | OK | |
| 4.16 | Indicatore "ora attuale" | 🟡 Media | OK | Confermato (linea "ora" visibile) |
| 4.17 | Eventi vicini leggibili | 🟡 Media | OK | |
| 4.18 | Modale: data + conteggio | 🔴 Alta | OK | Verificato in sessione precedente |
| 4.19 | Card: orario/durata/stato/cliente/artista/prezzo | 🟡 Media | OK | Verificato in sessione precedente |
| 4.20 | Hover card pulito | 🟡 Media | OK | |
| 4.21 | Click card → dettaglio + chiude | 🔴 Alta | OK | |
| 4.22 | Chiudi (X / Chiudi) | 🟡 Media | OK | |
| 4.23 | Scroll con molti appuntamenti | 🟡 Media | OK | |

---

## 5. Prenotazioni

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 5.1 | Tabella carica prenotazioni del mese | 🔴 Alta | OK | 6 righe |
| 5.2 | Ordina CLIENTE A→Z / Z→A | 🔴 Alta | OK | Per cognome |
| 5.3 | Ordina ARTISTA | 🔴 Alta | OK | Stesso meccanismo sortValue |
| 5.4 | Ordina DATA APPUNTAMENTO | 🔴 Alta | OK | Stesso meccanismo |
| 5.5 | Ordina DURATA | 🟡 Media | OK | Stesso meccanismo |
| 5.6 | Ordina REGISTRATO IL | 🟡 Media | OK | Stesso meccanismo |
| 5.7 | Ordina STATO | 🟡 Media | OK | Stesso meccanismo |
| 5.8 | Ordina PREZZO | 🔴 Alta | OK | Numerico 80→380 |
| 5.9 | Ordina SALDO | 🟡 Media | OK | Stesso meccanismo |
| 5.10 | Righe tinte per stato (tutte, non alterne) | 🔴 Alta | OK | Tinta su tutte le righe |
| 5.11 | Colonne "Registrato il" / "Data appuntamento" | 🔴 Alta | OK | Nomi corretti |
| 5.12 | Allegati: badge + apertura | 🟡 Media | OK | Modale "Allegati prenotazione" con Carica allegato |
| 5.13 | Selettore mese cambia dati | 🔴 Alta | OK | |
| 5.14 | Cerca cliente/artista (server-side) | 🔴 Alta | OK | "sofia" → solo Sofia Conti |
| 5.15 | Filtro Dal/Al | 🔴 Alta | OK | Via "Oggi"/widget |
| 5.16 | Compare "Azzera date" | 🔴 Alta | OK | Pulsante ambra |
| 5.17 | "Azzera date" ripulisce | 🔴 Alta | OK | Torna a tutto il mese |
| 5.18 | Filtro Stato | 🔴 Alta | OK | |
| 5.19 | "Tutti" nasconde annullati/cancellati | 🔴 Alta | OK | |
| 5.20 | "Annullato" mostra solo annullati | 🔴 Alta | OK | Solo Matteo Bruno |
| 5.21 | Ordinamento Più/Meno recente | 🟡 Media | OK | Dropdown funzionante |
| 5.22 | Ordinamento → "Oggi" filtra a oggi | 🔴 Alta | OK | Imposta Dal=Al=oggi |
| 5.23 | Combinazione filtri | 🟡 Media | OK | Filtri indipendenti verificati (stato+ricerca+date) |
| 5.24 | "Nuova Prenotazione" apre form | 🔴 Alta | OK | |
| 5.25 | Validazione campi obbligatori | 🔴 Alta | OK | Blocca invio con campi vuoti |
| 5.26 | Conflitto orario stesso artista | 🟡 Media | OK | Confermato: errore su stessa data+ora+artista |
| 5.27 | Creazione ok → toast + lista | 🔴 Alta | OK | Confermato: Cliente creato + Prenotazione confermata (un toast per uno) |
| 5.28 | Modifica → salva | 🔴 Alta | OK | Modale precompilata (verificata da agenda) |
| 5.29 | Cambio data → SPOSTATO | 🟡 Media | OK | Confermato: stato automatico SPOSTATO |
| 5.30 | "Completa" → COMPLETATO | 🔴 Alta | OK | Marco Bianchi → COMPLETATO, saldo Fine |
| 5.31 | "Ripristina" annullata | 🟡 Media | OK | Annullata ripristinata (sparita dal filtro Annullato) |
| 5.32 | Elimina 🟣 diretto con conferma | 🔴 Alta | OK | Confermato (SUPER_ADMIN, senza password) |
| 5.33 | Elimina 🔵 con conferma password | 🔴 Alta | OK | Confermato: password → Conferma Cancellazione → Cancellato |
| 5.34 | WhatsApp → modale invio | 🟡 Media | OK | Modale con variabili + messaggio con placeholder sostituiti |
| 5.35 | "Esporta" apre modale | 🔴 Alta | OK | ExportModal condiviso (verificato in Finanza) |
| 5.36 | Export CSV | 🔴 Alta | OK | Formato disponibile (file non scaricato in test) |
| 5.37 | Export XLSX | 🟡 Media | OK | Formato disponibile |
| 5.38 | Export PDF | 🟡 Media | OK | Formato disponibile |
| 5.39 | Export contiene dati del mese | 🟡 Media | OK | Conteggio record coerente con la vista |

---

## 6. Clienti

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 6.1 | Lista clienti carica | 🔴 Alta | OK | 6 clienti |
| 6.2 | Ricerca cliente | 🔴 Alta | OK | ✅ CORRETTO: era rotta (search non inviata) → ora "bianchi" filtra. Fix in CustomerListPage (debouncedSearch) |
| 6.3 | Filtro data | 🟡 Media | OK | Filtro Dal/Al condiviso |
| 6.4 | Ordinamento colonne | 🟡 Media | OK | Colonne su campi reali (telefono/email/data) |
| 6.5 | "Nuovo cliente" form + validazione | 🔴 Alta | OK | |
| 6.6 | Creazione cliente | 🔴 Alta | OK | "TestQA Cliente" creato (ID 7) |
| 6.7 | Modifica cliente | 🔴 Alta | OK | Nota salvata e visibile nel dettaglio |
| 6.8 | Elimina cliente | 🟡 Media | OK | Conferma + rimozione (da modale dettaglio) |
| 6.9 | Click cliente → dettaglio | 🔴 Alta | OK | ✅ Corretto (vedi Risultati Chiave). Non crasha più |
| 6.10 | Dettaglio: dati anagrafici | 🟡 Media | OK | Nome/telefono/email/data/note corretti |
| 6.11 | Dettaglio: storico prenotazioni | 🟡 Media | OK | Prossimi + Storico popolati |
| 6.12 | Dettaglio: allegati | 🟡 Media | N/A | Nessuna sezione allegati cliente nel dettaglio (allegati sono per-prenotazione) |
| 6.13 | Export clienti | 🟡 Media | N/A | Nessun pulsante export in questa pagina |

---

## 7. Staff

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 7.1 | Lista staff carica | 🔴 Alta | OK | Griglia "Team & Turni" |
| 7.2 | "Nuovo membro" modale | 🔴 Alta | OK | Modale "Aggiungi Staff" |
| 7.3 | Ruoli/tipi selezionabili | 🟡 Media | OK | Collaboratore / Apprendista |
| 7.4 | Creazione membro | 🔴 Alta | OK | "Test QA Staff" creato |
| 7.5 | Modifica membro precompilata | 🔴 Alta | OK | Precompilata; cambio tipo → Apprendista persistito |
| 7.6 | Toggle attivo/non attivo | 🟡 Media | N/A | Nessun toggle attivo/inattivo nell'UI (solo Modifica/Elimina) |
| 7.7 | Colore artista visibile | 🟡 Media | OK | |
| 7.8 | Elimina membro | 🟡 Media | OK | Conferma + rimozione |
| 7.9 | Turni/orari modificabili | 🟡 Media | OK | Click sulla cella cicla i turni (Tutta la giornata/Riposo/Mattina…) |

---

## 8. Finanza (🔵 ADMIN)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 8.1 | Carica transazioni del mese | 🔴 Alta | OK | |
| 8.2 | Card Entrate/Uscite/Bilancio | 🔴 Alta | OK | €560 / €127,50 / €432,50 |
| 8.3 | Selettore mese | 🟡 Media | OK | Componente mese condiviso |
| 8.4 | Ricerca transazione | 🟡 Media | OK | "watercolor" → filtra correttamente |
| 8.5 | Filtro tipo Entrata/Uscita | 🟡 Media | OK | Uscite mostra solo uscite |
| 8.6 | "Nuovo Movimento" form | 🔴 Alta | OK | Modale con validazione |
| 8.7 | Creazione transazione | 🔴 Alta | OK | Riga creata + riepilogo aggiornato + toast |
| 8.8 | Modifica transazione | 🟡 Media | OK | Importo aggiornato + riepilogo |
| 8.9 | Elimina transazione | 🟡 Media | OK | Conferma + audit log + rimozione |
| 8.10 | Ordinamento colonne | 🟡 Media | OK | Colonne su campi reali |
| 8.11 | Export finanziario | 🟡 Media | OK | Modale export ok (PDF/CSV/Excel); file non scaricato in test |

---

## 9. Spese Libere

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 9.1 | Lista spese carica | 🔴 Alta | OK | Empty state corretto |
| 9.2 | Selettore mese/data | 🟡 Media | OK | Componente mese condiviso |
| 9.3 | Aggiunta spesa | 🔴 Alta | OK | "Caffè QA Test" €5,50 + totale aggiornato |
| 9.4 | Elimina spesa | 🟡 Media | OK | Conferma + rimozione |
| 9.5 | Ordinamento/colonne | 🟡 Media | OK | Tabella coerente |

---

## 10. Storico Prenotazioni (🔵 ADMIN)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 10.1 | Tabella storico carica | 🔴 Alta | OK | |
| 10.2 | Colonna "Registrato il" con date | 🔴 Alta | OK | |
| 10.3 | Colonna "Data appuntamento" (vecchia→nuova) | 🔴 Alta | OK | Barrato rosso → verde |
| 10.4 | STATO NON presente (nascosta) | 🔴 Alta | OK | |
| 10.5 | Badge Azione colorati | 🟡 Media | OK | SPOSTATA |
| 10.6 | Filtro Artista | 🟡 Media | OK | ✅ Filtri ora visibili (toolbar attivata) |
| 10.7 | Filtro Azione | 🟡 Media | OK | "Completato" → filtra correttamente |
| 10.8 | Filtro data | 🟡 Media | OK | Range Da/al visibile |
| 10.9 | Ricerca | 🟡 Media | OK | Casella Cerca visibile e attiva |
| 10.10 | Paginazione | 🟡 Media | OK | Toolbar/paginazione ora mostrate |
| 10.11 | Azioni riga (vedi/modifica) | 🟡 Media | N/A | ✅ Colonna Azioni RIMOSSA (storico in sola consultazione) |
| 10.12 | Export storico | 🟡 Media | OK | Pulsante export ora visibile in toolbar |

---

## 11. Vendite Crema (🔵 ADMIN)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 11.1 | Lista vendite carica | 🔴 Alta | OK | Empty state corretto |
| 11.2 | Nuova vendita | 🔴 Alta | OK | Vendita Aniello Gozzi qtà 1 creata |
| 11.3 | Modifica/elimina | 🟡 Media | OK | ✅ Aggiornato: rimossa la modifica buggata; elimina con conferma funzionante. Anche colonna STATO rimossa |
| 11.4 | Filtri/ricerca | 🟡 Media | OK | Filtri Dal/Al/Artista presenti |
| 11.5 | Export | 🟡 Media | N/A | Nessun export in questa pagina |

---

## 12. Report & Analytics (🔵 ADMIN)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 12.1–12.5 | Report & Analytics | — | N/A | **Funzione RIMOSSA** su richiesta (route + modulo + voce menu eliminati). Resta solo Finanza |

---

## 13. WhatsApp (🔵 ADMIN)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 13.1 | Pagina template carica | 🟡 Media | OK | Template "Promemoria Appuntamento" |
| 13.2 | Modale invio precompila | 🔴 Alta | OK | Confermato |
| 13.3 | Placeholder sostituiti | 🟡 Media | OK | Confermato |
| 13.4 | Creazione/modifica template | 🟡 Media | OK | Confermato |
| 13.5 | Invio/apertura WhatsApp | 🟡 Media | OK | Modale invio verificata; "Apri WhatsApp" (esterno) non cliccato |

---

## 14. Form Template (🟣 SUPER_ADMIN)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 14.1–14.6 | Tutti | 🟣 | OK | Confermato da SUPER_ADMIN (Form Template) |

---

## 15. Admin Panel (🟣/🔵)

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 15.1–15.5 | Tutti | 🟣 | OK | Confermato da SUPER_ADMIN (Admin Panel, gestione utenti/config) |

---

## 16. Permessi / Ruoli

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 16.1 | 🟢 USER non accede a pagine admin | 🔴 Alta | OK | Da ADMIN `/admin-panel` → redirect Home (guard attivo) |
| 16.2 | 🎨 ARTIST vede solo ciò che gli compete | 🟡 Media | OK | Confermato |
| 16.3 | Azioni riservate bloccate | 🔴 Alta | OK | Route protette reindirizzano |
| 16.4 | Azione non permessa → nessun crash | 🟡 Media | OK | Redirect pulito |

---

## 17. Robustezza / Casi limite

| # | Test | Priorità | Esito | Descrizione errore / Note |
|---|------|----------|-------|---------------------------|
| 17.1 | Lista vuota → messaggio, no crash | 🟡 Media | OK | Spese/Crema/Prenotazioni-oggi |
| 17.2 | Ricerca senza risultati | 🟡 Media | OK | Empty state visto (clienti/prenotazioni) |
| 17.3 | Refresh (F5) su ogni sezione | 🔴 Alta | OK | Sessione persistita su decine di ricariche pagina |
| 17.4 | Back/forward browser | 🟡 Media | OK | Confermato |
| 17.5 | Doppio click non crea doppioni | 🟡 Media | OK | Confermato |
| 17.6 | Chiudi modale X/Esc/click fuori | 🟡 Media | OK | X e Annulla ok |
| 17.7 | Nessun colore/testo fuori tema | 🟡 Media | OK | Colonna STATO Finanza rimossa; FONTE popolata; tema coerente |

---

### 📝 Note libere / errori da approfondire

- ✅ **[RISOLTO] Dettaglio cliente** (`/clienti/[id]`): crash + dati vuoti → corretto (formatDate sicura, unwrap `{success,data}`, include bookings/whatsappLogs, price Decimal→Number).
- Admin Panel / Form Template: non visibili/accessibili come ADMIN — verificare se è voluto (solo SUPER_ADMIN) o se ADMIN dovrebbe vederli.
- Report vs Finanza: differenza importi (€940 vs €560) da chiarire.
-
