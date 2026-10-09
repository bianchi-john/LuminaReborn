# LUMiNA Reborn

Catalogo web delle opere dei [Musei Nazionali di Lucca](http://www.luccamuseinazionali.it/): consultazione pubblica, schedatura e revisione redazionale.

Node.js 22 + TypeScript, Express, EJS (pagine renderizzate dal server), MySQL 8 per il catalogo, MongoDB + [user-manager](https://github.com/maximemoreillon/user_manager) per gli account. Tutto si avvia con Docker Compose.

## Avvio rapido

Serve solo **Docker** (Engine + Compose v2).

```bash
git clone https://github.com/bianchi-john/LuminaReborn.git
cd LuminaReborn
cp .env.example .env && chmod 600 .env      # poi cambiare password e JWT_SECRET
docker network inspect extern >/dev/null 2>&1 || docker network create extern
docker compose up -d --build
```

Al primo avvio MySQL importa schema e opere dimostrative (`dbinit/`), poi l'applicazione applica le migrazioni (`migrations/`) e lo user-manager crea l'amministratore; il servizio `user-seed` crea gli schedatori dimostrativi.

| Indirizzo | |
|---|---|
| `http://localhost:3000` | Catalogo pubblico |
| `http://localhost:3000/login` | Area riservata |
| `http://localhost:3000/area/utenti` | Gestione utenti (amministratori) |

```bash
docker compose ps
docker compose logs -f nodeapp
```

### Credenziali dimostrative

| Ruolo | Utente | Password |
|---|---|---|
| Amministratore | `admin` | `admin` (da `ADMIN_PASSWORD`) |
| Schedatore | `pasquale`, `elena`, `virginia` | `schedatore` |

Sono solo per la demo: cambiarle prima di qualsiasi uso reale (da `/area/utenti`).

## Ruoli e flusso di lavoro

1. Lo **schedatore** crea una scheda (bozza), la salva quante volte vuole e la **invia in revisione**. Finché è in revisione può solo ritirarla.
2. L'**amministratore** la trova in *Amministrazione › Revisione schede*: può correggerla, **approvarla** (diventa pubblica) o **respingerla** con una motivazione, che lo schedatore vede nella propria area.
3. Una scheda pubblicata può essere ritirata dalla pubblicazione dall'amministratore (torna in bozza).

Ogni passaggio è registrato nello storico della scheda.

## Modello dei dati: voci collegate

Autori, materiali, tecniche, ubicazioni, provenienze, mostre e riferimenti bibliografici sono **voci condivise**: esistono una sola volta e sono collegate alle schede tramite le tabelle `tds_schede_*`. Nell'editor, iniziando a scrivere compaiono le voci esistenti; se si sceglie una voce l'opera viene collegata alle altre che la condividono, altrimenti la voce viene creata (e se ne esiste già una identica viene riusata quella).

Ciò che dipende dalla singola opera sta sul collegamento, non sulla voce:

| Voce | Sul collegamento |
|---|---|
| Autore (`nome`, `date_vita`, `note`) | formula precedente/successiva (es. "copia da"), categoria (firmata, attribuita, documentata) |
| Ubicazione (museo/sede) | collocazione (sala, vetrina) |
| Provenienza | note |

Ogni voce ha una pagina pubblica con tutte le opere collegate (es. `/voci/autori/1`) e gli **Indici** del menu permettono di sfogliare il catalogo per voce. Gli amministratori possono correggere le voci e **unire i duplicati** da *Amministrazione › Vocabolari*.

Cronologie, inventari, misure, immagini e documentazione fotografica appartengono invece alla singola scheda (FK con `ON DELETE CASCADE`). Lo stato della scheda è la colonna `schede.stato` (0 bozza, 1 in revisione, 2 pubblicata); lo storico è in `schede_revisioni`. Le immagini sono salvate come binario e servite da `/api/immagini/:id`.

## Aggiornare un'installazione esistente

La prima volta che questa versione parte su un database esistente applica `migrations/001_normalizza_schema.sql`, che ristruttura le tabelle e **fonde i duplicati** (es. due righe "Pittura a olio" diventano una). Le modifiche allo schema di MySQL non sono transazionali: **fare prima un backup**.

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer mysqldump -u admin \
  --no-tablespaces --single-transaction --routines --triggers \
  luminadb > "$HOME/luminadb-prima-della-migrazione.sql"
git checkout experimentsJohn
docker compose up -d --build
docker compose logs nodeapp | grep -i migrazione
```

Le migrazioni applicate sono registrate in `schema_migrations`. Per disattivarle all'avvio: `MIGRATE_ON_START=false`.

Il vecchio `.env` continua a funzionare; le nuove variabili facoltative sono documentate in `.env.example`.

## Ricreare l'ambiente da zero

```bash
docker compose down
sudo rm -rf database-data user-data/mongo-data
docker compose up -d --build
```

## Sviluppo

Richiede Node.js 22 (oppure usare Docker anche per i comandi qui sotto).

```bash
npm ci
npm run dev        # tsx in watch (servono MySQL e user-manager raggiungibili, vedi .env)
npm run typecheck
npm test           # test unitari (node:test)
npm run build && npm start
```

Con lo stack Docker avviato, per lo sviluppo locale si può puntare a MySQL su `127.0.0.1:3306` (`DB_HOST=127.0.0.1`).

## Sicurezza

- Query SQL sempre parametrizzate; l'HTML dei campi formattati è ripulito con una lista di tag ammessi sia in scrittura sia in lettura.
- Sessione in cookie `HttpOnly`, `SameSite=Lax` (e `Secure` con `COOKIE_SECURE=true`), durata massima `SESSION_MAX_AGE_HOURS`; il logout revoca il token sullo user-manager.
- Protezione CSRF: le richieste che modificano dati devono arrivare dallo stesso sito (`Origin`) in JSON.
- Content-Security-Policy senza script o stili esterni o inline; Bootstrap è servito localmente.
- Limiti di frequenza su login, API e caricamenti; immagini accettate solo se JPEG/PNG/WebP/GIF verificati dai primi byte.
- Lo user-manager e MongoDB non sono esposti fuori dalla rete Docker; MySQL solo su `127.0.0.1`. L'app gira come utente non root su filesystem in sola lettura.

In produzione: HTTPS tramite reverse proxy, `COOKIE_SECURE=true`, `TRUST_PROXY=1`, nuove password e `JWT_SECRET`.

L'interfaccia web originale dello user-manager non serve più (la gestione utenti è in `/area/utenti`); se necessaria si avvia solo in locale con `docker compose -f docker-compose.yml -f docker-compose.user-front.yml up -d`.

## Struttura

```text
src/
  app.ts, index.ts        applicazione Express e avvio (attesa DB, migrazioni)
  auth/                   sessione e client dello user-manager
  domain/                 vocabolari (voci condivise), validazione delle schede
  services/               schede, ricerca, voci, immagini
  routes/                 API JSON (/api) e pagine
  http/                   errori, header di sicurezza, CSRF, rate limit
views/                    template EJS
public/                   CSS e JavaScript del browser (moduli ES, senza build)
migrations/               migrazioni SQL applicate all'avvio
dbinit/                   schema originale e dataset dimostrativo (primo avvio di MySQL)
test/                     test unitari
docs/MIGLIORAMENTI.md     proposte per i prossimi sviluppi
```

## Manutenzione del database

```bash
docker exec -it mysqlcontainer mysql -u admin -p luminadb
```

Schede e immagini:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer mysql -u admin -D luminadb --table -e \
 "SELECT s.id, LEFT(s.titolo_testo, 45) AS titolo, s.stato, COUNT(i.id) AS immagini
    FROM schede s LEFT JOIN immagini i ON i.id_scheda = s.id
   GROUP BY s.id ORDER BY s.id;"
```
