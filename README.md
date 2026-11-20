# LUMiNA Reborn

Prototipo web per la catalogazione e la consultazione delle opere dei [Musei Nazionali di Lucca](http://www.luccamuseinazionali.it/).

Sviluppato con Node.js, TypeScript, Express, EJS, MySQL e MongoDB. L'intero ambiente si avvia con Docker Compose: al primo avvio vengono create le tabelle, importate le opere dimostrative e creati gli utenti, senza passaggi manuali.

> **Stato**: bozza utilizzabile. Si possono creare schede, inviarle in approvazione, approvarle o rifiutarle e consultarle. Mancano ancora la modifica delle bozze e le notifiche (vedi [Limiti noti](#limiti-noti)).

## Avvio rapido

Serve solo **Docker** (Engine + Compose v2); la compilazione dell'app avviene dentro il container.

```bash
git clone https://github.com/bianchi-john/LuminaReborn.git
cd LuminaReborn
cp .env.example .env && chmod 600 .env
docker network inspect extern >/dev/null 2>&1 || docker network create extern
docker compose up -d --build
```

Stato e log dei servizi:

```bash
docker compose ps
docker compose logs --tail=100
```

Indirizzi:

| Servizio | URL |
|----------|-----|
| Sito / consultazione | `http://localhost:3000` |
| Login | `http://localhost:3000/login` |
| Gestione utenti (web) | `http://localhost:8080` |
| API user-manager | `http://localhost:7071` |

## Ruoli e flusso di lavoro

Gli utenti stanno nello user-manager (MongoDB). Il ruolo dipende dal campo `isAdmin`: `true` = amministratore, qualsiasi altro valore = schedatore. Gli utenti con `locked: true` non possono entrare.

```text
  schedatore                         amministratore
  ──────────                         ──────────────
  crea la bozza ──► stato 0 (bozza)
                      │  Invia
                      ▼
  Ritira ◄──────── stato 1 (in approvazione) ──► Rigetta: torna a stato 0
                      │  Approva
                      ▼
                   stato 2 (pubblicata, visibile a tutti)
```

| Azione | Chi | Quando è permessa |
|--------|-----|-------------------|
| Creare una bozza | schedatore | sempre |
| Eliminare una bozza | lo schedatore che l'ha creata | solo in stato 0 |
| Inviare in approvazione | lo schedatore che l'ha creata | solo in stato 0 |
| Ritirare | lo schedatore che l'ha creata | solo in stato 1 |
| Approvare / Rigettare | amministratore | solo in stato 1 |

Le regole sono controllate dal server: un'azione fuori stato risponde `409`, una scheda di un altro schedatore risponde `404`. Le bozze **non si possono modificare**: si eliminano e si ricreano.

La guida illustrata per chi scheda (non tecnica) è in [`Doc/guida-schedatori/`](Doc/guida-schedatori/LEGGIMI.md). Gli account con le password si generano in `consegna/`, cartella esclusa da git.

## Credenziali dimostrative

Create automaticamente al primo avvio: l'admin dallo user-manager tramite `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env`, gli schedatori dal servizio one-shot `user-seed` (`scripts/seed-users.sh`).

| Ruolo | Utente | Password |
|-------|--------|----------|
| Amministratore | `admin` | `admin` |
| Schedatore | `pasquale` | `schedatore` |
| Schedatore | `elena` | `schedatore` |
| Schedatore | `virginia` | `schedatore` |

Gli username degli schedatori coincidono con gli autori delle schede incluse. Le password dello user-manager devono avere **almeno 6 caratteri, solo lettere e numeri**. Nuovi utenti si creano da `http://localhost:8080` (accedendo come admin) o via API `POST /users`; per un amministratore si imposta poi `isAdmin: true` con `PATCH /users/{id}`.

**Le credenziali sono pubbliche e solo dimostrative**: su un server raggiungibile da altri vanno cambiate tutte (vedi [Installazione su un server](#installazione-su-un-server)).

## Come vengono salvate le schede

Una scheda è una riga di `schede` più molte tabelle collegate tramite tabelle ponte `tds_schede_*`. Il salvataggio (`src/helpers/schedaService.ts`) avviene in **un'unica transazione**: se un passaggio fallisce non resta nessuna scheda a metà.

- **Voci condivise tra schede**: autori, materiali, tecniche, ubicazioni, provenienze, mostre, bibliografie. Prima di inserire, il server cerca una voce con gli stessi valori; se c'è la riusa, altrimenti la crea. Il confronto ignora maiuscole, accenti e spazi all'inizio o alla fine (collazione `utf8mb4_0900_ai_ci` più `trim`). Nel modulo, autori, materiali e tecniche hanno anche il menu "Seleziona preesistente".
- **Voci proprie della scheda**: inventario, cronologia, documentazione fotografica, misure e immagini sono sempre nuove.
- Eliminare una scheda cancella solo i collegamenti (`ON DELETE CASCADE` sulle tabelle ponte), mai le voci condivise usate da altre schede.
- I valori delle misure accettano la virgola (`72,5`); i gruppi di misure vuoti vengono ignorati.

## Rotte principali

| Rotta | Metodo | Accesso | Funzione |
|-------|--------|---------|----------|
| `/login` | POST | pubblico | accesso, imposta il cookie `jwt` |
| `/search` | GET | pubblico | ricerca sulle schede pubblicate |
| `/schede/:id` | GET | pubblico | dettaglio di una scheda pubblicata |
| `/createBozza` | POST | schedatore | crea una bozza |
| `/manageBozze` | GET / POST / PUT / DELETE | schedatore | elenco, invio, ritiro, eliminazione delle proprie bozze |
| `/suggestions` | GET | schedatore | voci esistenti per i menu "Seleziona preesistente" |
| `/admin` | GET / POST / DELETE | amministratore | elenco, approvazione, rifiuto |
| `/admin/:id` | GET | amministratore | dettaglio di una scheda da valutare |

Le vecchie rotte `PUT` e `DELETE /schede/:id`, che non chiedevano l'accesso, sono state rimosse.

## Contenuti inclusi

Il dataset dimostrativo (`dbinit/zz-luminadb-data.sql`) contiene **6 schede approvate** con **22 immagini** incorporate come data URL:

1. San Sebastiano
2. San Giovanni Battista
3. Skyphos a vernice nera
4. Bronzetto antropomorfo
5. Trittico con Matrimonio mistico di santa Caterina
6. Croce dipinta con Cristo vivo

Lo schema è in `dbinit/init.sql`. Entrambi gli script vengono eseguiti in ordine alfabetico solo quando `/var/lib/mysql` è vuota (primo avvio).

Verifica di schede e immagini:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer mysql -u admin -D luminadb --table -e \
 "SELECT s.id, LEFT(REPLACE(REPLACE(s.titolo_opera,'<i>',''),'</i>',''),45) AS titolo,
         ss.stato, COUNT(DISTINCT i.id) AS immagini
  FROM schede s
  JOIN tds_schede_statoScheda tss ON tss.id_scheda=s.id
  JOIN statoScheda ss ON ss.id=tss.id_stato
  LEFT JOIN tds_schede_immagini si ON si.id_scheda=s.id
  LEFT JOIN immagini i ON i.id=si.id_immagine
  GROUP BY s.id, s.titolo_opera, ss.stato ORDER BY s.id;"
```

## Installazione su un server

Per un'installazione usata da altre persone, senza modificare i file versionati:

1. **Segreti in `.env`**: password del database, `JWT_SECRET` e `ADMIN_PASSWORD` nuovi e casuali (`openssl rand -hex 24`). Il file resta `chmod 600` e non va mai committato.
2. **`docker-compose.override.yml`** (non versionato, letto in automatico da Compose) per:
   - passare i segreti di `.env` ai servizi al posto dei valori dimostrativi;
   - pubblicare MySQL solo in locale (`ports: !override ["127.0.0.1:3306:3306"]`, richiede Compose ≥ 2.24.4);
   - `restart: unless-stopped` su tutti i servizi;
   - disattivare gli schedatori dimostrativi mettendo `user-seed` in un `profile`.
3. Impostare `USER_MANAGER_FRONT_API_URL` all'indirizzo del server (es. `http://IP_DEL_SERVER:7071`).
4. Creare gli account reali (vedi [Credenziali dimostrative](#credenziali-dimostrative)) e cambiare la password di `admin`.
5. Backup automatico notturno di MySQL e MongoDB (vedi sotto).

Aggiornamento dopo un push sul branch:

```bash
git pull
docker compose up -d --build nodeapp   # i dati restano nei volumi
```

## Sviluppo locale

Richiede Node.js 21 o successivo, npm e `rsync`.

```bash
npm install           # il package-lock non è allineato: npm ci fallisce (serve anche git)
npm run start:dev     # sviluppo con nodemon
npm run start:build   # compila TypeScript e copia le viste in dist/
npm run start:prod    # compila ed avvia (è quello che fa il container)
```

**Attenzione alle viste**: il container serve le pagine e gli script da `dist/views/`, che è versionata. Ogni modifica in `src/views/` va copiata anche lì (`npm run start:build` o `rsync -av src/views/ dist/views/`), poi si ricostruisce il container (`docker compose up -d --build nodeapp`).

## Manutenzione del database

Accesso a MySQL (password dimostrativa: `letmein`):

```bash
docker exec -it mysqlcontainer mysql -u admin -p luminadb
```

Rigenerare il dump dimostrativo (deve restare solo dati; lo schema resta in `init.sql`):

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer mysqldump -u admin \
  --no-tablespaces --single-transaction --set-gtid-purged=OFF --no-create-info \
  --complete-insert --skip-extended-insert --skip-dump-date \
  --default-character-set=utf8mb4 luminadb > dbinit/zz-luminadb-data.sql
# verifica che non contenga CREATE/DROP TABLE:
rg '^(CREATE|DROP) TABLE' dbinit/zz-luminadb-data.sql
```

Backup completo:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer mysqldump -u admin \
  --no-tablespaces --single-transaction --routines --triggers \
  luminadb > "$HOME/Downloads/luminadb-$(date +%Y%m%d-%H%M%S).sql"
```

## Ricreare l'ambiente da zero

Elimina i dati locali e forza una nuova inizializzazione (schema, opere e utenti vengono ricreati):

```bash
docker compose down
sudo rm -rf database-data user-data/mongo-data   # se servono i permessi di root
docker compose up -d --build
```

## Struttura principale

```text
src/                         sorgenti TypeScript, viste e risorse web
  controller/                logica delle rotte (schede, bozze, amministrazione)
  helpers/schedaService.ts   salvataggio di una scheda e delle tabelle collegate
  helpers/authHelpers.ts     verifica del cookie e dei ruoli
  query/                     query SQL
  views/                     pagine EJS, script e stili
dist/                        output compilato (dist/views è versionata)
dbinit/                      schema (init.sql) e dataset dimostrativo
scripts/seed-users.sh        creazione schedatori dimostrativi (servizio user-seed)
docker-compose.yml           definizione dei servizi Docker
database-data/, user-data/   dati locali (MySQL / MongoDB), non versionati
```

## Limiti noti

- Le bozze non si possono modificare: si eliminano e si ricreano.
- Nessuna notifica: lo schedatore non viene avvisato quando una scheda viene approvata o rifiutata.
- Il campo "Commento" del modulo viene salvato ma non viene mostrato all'amministratore.
- La ricerca veloce restituisce anche risultati poco pertinenti.
- Le voci condivise rimaste senza schede (es. l'autore di una bozza eliminata) restano tra i suggerimenti.
- Le immagini sono salvate nel database come data URL: comodo per la demo, pesante con molte foto.

## Note tecniche

- **Rete**: IP statici sulla subnet in `.env.example`; se è occupata, modificare insieme subnet, gateway e indirizzi dei container.
- **User-manager**: l'app lo raggiunge all'URL `USER_MANAGER_API_URL` (`.env`).
- **Database**: un solo pool di connessioni condiviso (`src/config/mysql.config.ts`, `DB_CONNECTION_LIMIT`).
- **Log**: password e token di sessione non vengono mai scritti nei log.
- **MongoDB**: fissato a `mongo:7.0`; la `latest` (8.x) non parte sui kernel Linux recenti (incompatibilità nota, SERVER-121912).

## Arresto

```bash
docker compose down
```

Arresta i container mantenendo i dati in `database-data` e `user-data`.
