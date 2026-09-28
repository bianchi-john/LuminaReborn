# LUMiNA Reborn

Prototipo web per la catalogazione e la consultazione delle opere dei [Musei Nazionali di Lucca](http://www.luccamuseinazionali.it/).

Sviluppato con Node.js, TypeScript, Express, EJS, MySQL e MongoDB. L'intero ambiente si avvia con Docker Compose: al primo avvio vengono create le tabelle, importate le opere e creati gli utenti, senza passaggi manuali.

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

## Accesso, ruoli e utenti

Due ruoli, gestiti dallo user-manager (MongoDB). Il ruolo è determinato dal campo `isAdmin` restituito dallo user-manager: `isAdmin: true` = amministratore, campo assente = schedatore.

- **Amministratore** — approva/respinge le bozze e gestisce gli utenti.
- **Schedatore** — crea, modifica ed elimina le bozze e le invia in approvazione.

### Credenziali dimostrative

Create automaticamente al primo avvio (l'admin dallo user-manager tramite `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env`; gli schedatori dal servizio one-shot `user-seed`, vedi `scripts/seed-users.sh`):

| Ruolo | Utente | Password |
|-------|--------|----------|
| Amministratore | `admin` | `admin` |
| Schedatore | `pasquale` | `schedatore` |
| Schedatore | `elena` | `schedatore` |
| Schedatore | `virginia` | `schedatore` |

Gli username degli schedatori coincidono con gli autori delle schede incluse. La password è `schedatore` (e non lo username) perché lo user-manager richiede almeno 6 caratteri. Nuovi utenti si creano da `http://localhost:8080` (accedendo come admin) o via API `POST /users`.

Le credenziali sono solo dimostrative: sostituirle prima di qualsiasi uso reale.

## Contenuti inclusi

Il dataset dimostrativo (`dbinit/zz-luminadb-data.sql`) contiene **6 schede approvate** con **22 immagini** incorporate come data URL (importate insieme alle schede):

1. San Sebastiano
2. San Giovanni Battista
3. Skyphos a vernice nera
4. Bronzetto antropomorfo
5. Trittico con Matrimonio mistico di santa Caterina
6. Croce dipinta con Cristo vivo

Lo schema è in `dbinit/init.sql`. Entrambi gli script vengono eseguiti in ordine alfabetico solo quando `/var/lib/mysql` è vuota (primo avvio). Lo stato `2` indica una scheda approvata e pubblicamente consultabile.

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

## Ricreare l'ambiente da zero

Elimina i dati locali e forza una nuova inizializzazione (schema, opere e utenti vengono ricreati):

```bash
docker compose down
sudo rm -rf database-data user-data/mongo-data   # se serve i permessi di root
docker compose up -d --build
```

## Sviluppo locale (opzionale)

Richiede Node.js 21.6.2, npm e `rsync`.

```bash
npm ci
npm run start:dev     # sviluppo con nodemon
npm run start:build   # compila TypeScript e copia le viste
npm run start:prod    # build di produzione
```

## Manutenzione del database

Accesso a MySQL (password dimostrativa: `letmein`):

```bash
docker exec -it mysqlcontainer mysql -u admin -p luminadb
```

Rigenerare il dump dimostrativo (deve restare data-only; lo schema resta in `init.sql`):

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

## Struttura principale

```text
src/                         sorgenti TypeScript, viste e risorse web
dist/                        output compilato
dbinit/                      schema (init.sql) e dataset dimostrativo
scripts/seed-users.sh        creazione schedatori dimostrativi (servizio user-seed)
docker-compose.yml           definizione dei servizi Docker
database-data/, user-data/   dati locali (MySQL / MongoDB), non versionati
```

## Note tecniche

- **Rete**: IP statici sulla subnet in `.env.example`; se è occupata, modificare insieme subnet, gateway e indirizzi dei container.
- **User-manager**: l'URL con cui l'app lo raggiunge è configurabile con `USER_MANAGER_API_URL` (`.env`). Per usare l'interfaccia utenti `:8080` da un server remoto, impostare `USER_MANAGER_FRONT_API_URL` all'indirizzo con cui si apre il sito (es. `http://IP_DEL_SERVER:7071`).
- **MongoDB**: fissato a `mongo:7.0`; la `latest` (8.x) non parte sui kernel Linux recenti (incompatibilità nota, SERVER-121912).
- **Immagini**: incorporate nel dump come data URL — comodo per la demo, non ideale in produzione.

## Arresto

```bash
docker compose down
```

Arresta i container mantenendo i dati in `database-data` e `user-data`.
