# LUMiNA Reborn

Prototipo web per la catalogazione e la consultazione delle opere dei [Musei Nazionali di Lucca](http://www.luccamuseinazionali.it/).

L'applicazione è sviluppata con Node.js, TypeScript, Express, EJS, MySQL e MongoDB. L'intero ambiente può essere avviato con Docker Compose.

## Contenuti inclusi

Alla prima inizializzazione MySQL vengono caricati automaticamente:

- lo schema del database, da `dbinit/init.sql`;
- un dataset dimostrativo con sei schede approvate, da `dbinit/zz-luminadb-data.sql`.

Le schede incluse sono:

1. San Sebastiano;
2. San Giovanni Battista;
3. Skyphos a vernice nera;
4. Bronzetto antropomorfo;
5. Trittico con Matrimonio mistico di santa Caterina;
6. Croce dipinta con Cristo vivo.

Il dataset contiene 22 immagini già incorporate nel dump come data URL. Le
immagini vengono quindi importate insieme alle schede, senza copiare file a
mano o eseguire script aggiuntivi.

## Requisiti

- Docker Engine;
- Docker Compose v2 (`docker compose`);
- Node.js 21.6.2;
- npm;
- `rsync`.

Per installare la versione Node prevista dal progetto tramite `nvm`:

```bash
nvm install 21.6.2
nvm use 21.6.2
node --version
```

## Primo avvio

Clonare il repository e accedere alla sua directory:

```bash
git clone https://github.com/bianchi-john/LuminaReborn.git
cd LuminaReborn
```

Creare la configurazione locale partendo dall'esempio incluso:

```bash
cp .env.example .env
chmod 600 .env
```

Creare la rete Docker esterna richiesta dal progetto, se non esiste già:

```bash
docker network inspect extern >/dev/null 2>&1 || docker network create extern
```

Installare le dipendenze, compilare il progetto e avviare i container:

```bash
npm ci
npm run start:build
docker compose up -d --build
```

Controllare lo stato dei servizi:

```bash
docker compose ps
docker compose logs --tail=100
```

Il sito è disponibile all'indirizzo:

```text
http://localhost:3000
```

L'API dello user manager è esposta su:

```text
http://localhost:7071
```

## Inizializzazione del database

Il servizio MySQL monta:

```text
./database-data  -> /var/lib/mysql
./dbinit         -> /docker-entrypoint-initdb.d
```

Gli script SQL dentro `dbinit` vengono eseguiti in ordine alfabetico, ma soltanto quando `/var/lib/mysql` è vuota. Nel progetto l'ordine è quindi:

1. `dbinit/init.sql`: crea le tabelle e i vincoli;
2. `dbinit/zz-luminadb-data.sql`: carica il dataset prodotto con `mysqldump`.

Verificare il caricamento delle schede:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer \
  mysql -u admin -D luminadb -e \
  "SELECT s.id, LEFT(s.titolo_opera, 80) AS titolo, ss.stato
   FROM schede s
   JOIN tds_schede_statoScheda tss ON tss.id_scheda = s.id
   JOIN statoScheda ss ON ss.id = tss.id_stato
   ORDER BY s.id;"
```

Il valore `stato = 2` indica una scheda approvata e pubblicamente consultabile.

Verificare anche che tutte le immagini siano state importate:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer \
  mysql -u admin -D luminadb --table -e \
  "SELECT s.id,
          LEFT(REPLACE(REPLACE(s.titolo_opera, '<i>', ''), '</i>', ''), 55) AS titolo,
          COUNT(DISTINCT i.id) AS immagini,
          SUM(i.data LIKE 'data:image/%') AS immagini_funzionanti
   FROM schede s
   LEFT JOIN tds_schede_immagini si ON si.id_scheda = s.id
   LEFT JOIN immagini i ON i.id = si.id_immagine
   GROUP BY s.id, s.titolo_opera
   ORDER BY s.id;"
```

Il dataset incluso contiene complessivamente 22 immagini funzionanti.

## Ricreare il database da zero

Questa operazione elimina solamente i dati MySQL locali e provoca una nuova esecuzione degli script presenti in `dbinit`:

```bash
docker compose down
sudo rm -rf database-data
docker compose up -d --build
```

Non è necessario eseguire manualmente `dbinit/init.sql`.

Per eliminare anche i dati MongoDB dello user manager:

```bash
docker compose down
sudo rm -rf database-data user-data/mongo-data
docker compose up -d --build
```

## Aggiornare il dump incluso

Dopo aver modificato e verificato il database, rigenerare il dataset con:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer \
  mysqldump \
    -u admin \
    --no-tablespaces \
    --single-transaction \
    --set-gtid-purged=OFF \
    --no-create-info \
    --complete-insert \
    --skip-extended-insert \
    --skip-dump-date \
    --default-character-set=utf8mb4 \
    luminadb > dbinit/zz-luminadb-data.sql
```

Il dump deve rimanere data-only: lo schema continua a essere gestito da `dbinit/init.sql`.

Verificare che il file non contenga istruzioni di creazione o eliminazione delle tabelle:

```bash
rg '^(CREATE|DROP) TABLE' dbinit/zz-luminadb-data.sql
```

Il comando non deve produrre risultati.

## Backup completo manuale

Per creare un backup completo del database corrente:

```bash
docker exec -e MYSQL_PWD=letmein mysqlcontainer \
  mysqldump \
    -u admin \
    --no-tablespaces \
    --single-transaction \
    --routines \
    --triggers \
    luminadb > "$HOME/Downloads/luminadb-$(date +%Y%m%d-%H%M%S).sql"
```

## Sviluppo locale

Avvio dell'applicazione in modalità sviluppo:

```bash
npm run start:dev
```

Compilazione TypeScript e copia delle viste:

```bash
npm run start:build
```

Avvio della build di produzione:

```bash
npm run start:prod
```

## Accesso a MySQL

```bash
docker exec -it mysqlcontainer mysql -u admin -p luminadb
```

Password prevista dalla configurazione dimostrativa:

```text
letmein
```

Comandi SQL utili:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM schede;
SELECT id, titolo_opera FROM schede ORDER BY id;
```

## Struttura principale

```text
src/                         sorgenti TypeScript, viste e risorse web
dist/                        output compilato
dbinit/init.sql              schema MySQL
dbinit/zz-luminadb-data.sql  dataset dimostrativo
database-data/               dati MySQL locali, non versionati
user-data/                   dati MongoDB locali, non versionati
docker-compose.yml           definizione dei servizi Docker
Dockerfile                   immagine dell'applicazione Node.js
```

## Limitazioni note del prototipo

- La configurazione utilizza indirizzi IPv4 statici sulla subnet indicata in `.env.example`. Se la subnet è già occupata, occorre modificare insieme subnet, gateway e indirizzi dei container.
- Le immagini del dataset dimostrativo sono incorporate nel dump come data URL. Questo rende semplice l'installazione del prototipo, ma aumenta la dimensione del file SQL e non rappresenta necessariamente la soluzione più adatta a un ambiente di produzione.
- Le credenziali incluse sono esclusivamente dimostrative e devono essere sostituite prima di qualsiasi utilizzo pubblico o di produzione.
- Il codice di autenticazione contiene configurazioni legate all'ambiente storico del prototipo e può richiedere un adeguamento della URL dello user manager.

## Arresto dei servizi

```bash
docker compose down
```

Questo comando arresta i container senza eliminare i dati persistenti presenti in `database-data` e `user-data`.
