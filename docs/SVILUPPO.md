# Guida per sviluppatori

## Ambiente di sviluppo

```bash
make dev
```

Avvia tutto lo stack con l'app in modalità sviluppo (`docker-compose.dev.yml`): `src/`, `views/`, `public/` e `migrations/` sono montati nel container.

| Modifichi | Vedi il risultato |
|---|---|
| `src/**/*.ts` | riavvio automatico in circa un secondo (`tsx watch`) |
| `views/*.ejs`, `public/css`, `public/js` | ricarica la pagina (nessuna cache in sviluppo) |
| `migrations/*.sql` | `make restart` (le migrazioni nuove vengono applicate all'avvio) |
| `package.json` | `make dev` di nuovo (ricostruisce l'immagine) |

MySQL è raggiungibile da `127.0.0.1:3306` (`make db` apre la console). Per lavorare con Node installato sulla macchina invece che nel container: `npm ci`, un `.env` con `DB_HOST=127.0.0.1` e `USER_MANAGER_API_URL` raggiungibile, poi `npm run dev`.

### Comandi

| | |
|---|---|
| `make typecheck` | controllo dei tipi |
| `make test` | test unitari (`test/*.test.ts`, runner `node:test`) |
| `make test-e2e` | test end-to-end sull'istanza avviata: crea una scheda di prova, la porta alla pubblicazione e la elimina |
| `npm run i18n:check` | testi dell'interfaccia senza traduzione inglese |
| `make reset-demo` | riparte dai dati dimostrativi |

La CI (`.github/workflows/ci.yml`) esegue typecheck, test, audit delle dipendenze e build dell'immagine.

## Architettura

```text
Browser ──► nodeapp (Express)
              ├─ pagine EJS renderizzate dal server       routes/pages.ts
              ├─ API JSON per editor e area riservata      routes/api.ts   (/api/*)
              ├─ file delle immagini                       routes/media.ts (/media/:id/:variante)
              ├─ MySQL  luminadb     catalogo
              │         luminamedia  byte delle immagini
              └─ user-manager (HTTP, rete interna) ──► MongoDB   account
```

```text
src/
  index.ts             avvio: attesa del DB, migrazioni, pulizie e export programmati, server
  app.ts               middleware (sicurezza, lingua, sessione), helper per i template
  config.ts            variabili d'ambiente, con valori predefiniti e controlli
  auth/                sessione (cookie → utente) e client dello user-manager
  domain/              regole del dominio senza I/O: vocabolari, validazione della scheda,
                       classificazioni, confronto dimensionale
  services/            accesso ai dati: schede, voci, ricerca, immagini, esportazione Excel
  routes/              pagine, API, media
  http/                errori, header di sicurezza, CSRF, limiti di frequenza
  i18n/                traduzioni (en.json) e raccolta delle chiavi
  db/                  pool MySQL, migratore, migrazioni in codice
  util/                HTML (sanitizzazione), somiglianza tra testi, SQL
views/                 template EJS (partials/ comuni, area/ per l'area riservata)
public/js/             moduli ES senza build: editor.js, home.js, ...; lib/ condivise
migrations/            migrazioni SQL numerate
dbinit/                schema originale e dati dimostrativi (solo primo avvio di MySQL)
scripts/               backup, ripristino, reset demo, seed utenti
test/                  test unitari; e2e/ test sull'istanza avviata
```

Dove intervenire per i casi più comuni:

| Voglio… | File |
|---|---|
| aggiungere un campo alla scheda | migrazione SQL + `domain/scheda.schema.ts` + `services/schede.service.ts` + `views/area/editor.ejs` / `public/js/editor.js` + `views/scheda.ejs` |
| aggiungere un nuovo vocabolario condiviso (es. "Committenti") | migrazione con tabella e TDS + una voce in `domain/vocabolari.ts`: validazione, salvataggio, API, indici e autocompletamento si adeguano da soli; poi il pannello dell'editor |
| cambiare i campi della ricerca | `services/search.service.ts` (+ form in `views/home.ejs`) |
| cambiare un testo dell'interfaccia | il testo italiano nel template/script e la sua traduzione in `src/i18n/en.json` |
| cambiare i permessi | `computePermessi` in `services/schede.service.ts` (coperto da test) |

## Modello dei dati

**Voci condivise** (*authority file*): `autori`, `materiali`, `tecniche`, `ubicazioni`, `provenienze`, `mostre`, `bibliografie`, `altreBibliografie`. Ogni voce esiste una volta sola (vincolo `UNIQUE`, su una colonna `chiave` calcolata dove il testo è lungo) ed è collegata alle schede tramite le tabelle `tds_schede_*`, che contengono anche i dati propri del collegamento e l'ordine:

| Collegamento | Campi propri della singola opera |
|---|---|
| `tds_schede_autori` | `formula_precedente` (es. "copia da"), `formula_successiva`, `categoria` |
| `tds_schede_ubicazioni` | `collocazione` (sala, vetrina) |
| `tds_schede_provenienze` | `note` |

Al salvataggio di una scheda una voce indicata per nome viene riusata se ne esiste già una identica (`INSERT … ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`); l'editor obbliga comunque a cercare prima e avvisa delle voci simili (`util/similarity.ts`). Gli amministratori correggono e uniscono i duplicati da *Vocabolari*.

**Dati propri della scheda**: `cronologie`, `inventari`, `gruppi_misure` → `misure`, `documentazioniFotografiche`, `immagini`, tutti con FK verso `schede` e `ON DELETE CASCADE`.

**Stato e storico**: `schede.stato` (0 bozza, 1 in revisione, 2 pubblicata); ogni azione (creata, modificata, inviata, respinta, approvata…) con eventuale messaggio è in `schede_revisioni`. `tds_users_schede` elenca gli schedatori accreditati; `users` è la copia locale degli account dello user-manager.

**Immagini**: `luminadb.immagini` contiene scheda, ordine, didascalia e dimensioni; i byte stanno in `luminamedia.immagini_file`, una riga per variante (`originale`, `anteprima` WebP 1280 px, `miniatura` WebP 480 px), con FK in cascata verso `immagini`. Le varianti ridotte non contengono metadati (EXIF/GPS) e l'anteprima porta il watermark `MEDIA_WATERMARK` (testo disegnato da sharp con il font Liberation Serif installato nell'immagine Docker). Il pubblico riceve solo `anteprima` e `miniatura`; `originale` richiede l'accesso.

**Migrazioni**: `migrations/NNN_nome.sql` e passi in codice in `src/db/codeMigrations.ts`, applicati in ordine di nome e registrati in `schema_migrations`. Nei file SQL `{{MAIN_DB}}` e `{{MEDIA_DB}}` diventano i nomi dei database configurati. Non modificare una migrazione già rilasciata: aggiungerne una nuova.

## Ricerca

- **Semplice** (`q`): per requisito cerca in titolo, autore, classificazione, descrizione sintetica, commento storico-critico, ubicazione, provenienza, vicende collezionistiche. Ogni parola deve comparire in almeno uno di questi campi; maiuscole e accenti non contano; la vocale finale delle parole lunghe è ignorata (singolare/plurale); le etichette di classificazione sono riconosciute ("dipinto" → Dipinti). Ordinamento per rilevanza (titolo e autore pesano di più).
- **Avanzata**: un criterio per campo, in AND; menu a tendina dove i valori sono pochi (classificazione, categoria, materiale, tecnica, ubicazione, proprietà, luogo della mostra), autocompletamento per autore e mostra.
- **Suggerimenti** (`/api/suggerimenti`) mentre si scrive e **"Forse cercavi"** quando non ci sono risultati.

## Lingue

L'italiano è la lingua principale: i testi nel codice sono in italiano e fanno da chiave. `t('Testo')` nei template (e negli script, da `public/js/lib/i18n.js`) restituisce la traduzione inglese da `src/i18n/en.json`, se presente. La lingua viene da `?lang=` o dall'intestazione `Accept-Language`; non si usano cookie. Il test `ogni testo dell'interfaccia ha la traduzione inglese` fallisce se un testo nuovo non è tradotto: `npm run i18n:check` elenca quelli mancanti. I contenuti delle schede non vengono tradotti.

## Sicurezza

| Rischio | Contromisura |
|---|---|
| SQL injection | solo query parametrizzate; i nomi di tabelle/colonne dinamici vengono da configurazioni statiche (`domain/vocabolari.ts`); `multipleStatements` solo per il migratore |
| XSS | EJS fa l'escape di default; l'HTML dei campi formattati passa da `sanitize-html` con una lista di tag ammessi sia in scrittura sia in lettura; CSP senza script/stili inline o esterni; negli script del browser solo `textContent` |
| CSRF | cookie `SameSite=Lax`, controllo dell'header `Origin` e obbligo di JSON sulle richieste che modificano dati |
| Privacy dei visitatori | nessun cookie (la lingua viaggia nel parametro `?lang=`, propagato ai link da `common.js`), nessuno strumento di analisi né risorsa di terze parti; l'IP resta solo in memoria per pochi minuti nei limiti di frequenza. Un test end-to-end verifica che le pagine pubbliche non impostino cookie |
| Sessioni | cookie `HttpOnly` (e `Secure` in HTTPS) con durata massima; logout con revoca del token sullo user-manager; utenti bloccati esclusi anche con token valido |
| Accessi non autorizzati | permessi calcolati lato server per ogni operazione (`computePermessi`); le bozze altrui rispondono 404 |
| Forza bruta / abuso | limiti di frequenza su login, API e caricamenti |
| File caricati | tipo verificato dai primi byte (niente SVG), limite di pixel contro le "decompression bomb", versioni pubbliche ricodificate senza metadati |
| Esposizione dei servizi | user-manager e MongoDB solo in rete interna; MySQL solo su localhost; app come utente non root, filesystem in sola lettura, `no-new-privileges` |
| Dipendenze | versioni fissate, `npm audit` in CI |

Lo user-manager (`moreillon/user-manager-mongoose`, fissato per digest) impone password di sole lettere e numeri ed emette token senza scadenza: l'app ne limita la durata e lo isola, ma la sua sostituzione è tra le proposte in [MIGLIORAMENTI.md](MIGLIORAMENTI.md).
