# Installazione e gestione

## Requisiti

- Docker Engine con Compose v2
- `make` (facoltativo: ogni comando ha l'equivalente `docker compose` riportato nel `Makefile`)
- 2 GB di RAM, qualche GB di disco per immagini e backup

Node.js non serve sulla macchina: la compilazione e i test girano nei container.

## Primo avvio

```bash
make up
```

`make up` crea `.env` da `.env.example` (se manca), la rete Docker `extern`, le cartelle `backups/` e avvia lo stack. Al **primo avvio**, con i volumi dei dati vuoti:

1. MySQL esegue gli script di `dbinit/`: crea il database delle immagini (`01-database-media.sh`), lo schema originale (`init.sql`) e le sei opere dimostrative (`zz-luminadb-data.sql`);
2. l'applicazione applica le migrazioni di `migrations/` (normalizzazione dello schema, spostamento delle immagini nel database media con generazione delle versioni ridotte);
3. lo user-manager crea l'amministratore e il servizio `user-seed` gli schedatori dimostrativi.

Stato e log: `make ps`, `make logs`.

### Servizi

| Servizio | Ruolo | Esposto |
|---|---|---|
| `nodeapp` | applicazione web | `:3000` (configurabile con `APP_PORT`/`APP_BIND`) |
| `mysqldb` | MySQL 8.4: database `luminadb` (catalogo) e `luminamedia` (file delle immagini) | solo `127.0.0.1:3306` |
| `backup` | backup giornaliero dei due database | no |
| `mongo`, `user-manager-api` | account e autenticazione | no (solo rete interna) |
| `user-seed` | crea gli utenti dimostrativi, poi termina | no |

## Dati dimostrativi

Le sei schede di esempio (San Sebastiano, San Giovanni Battista, Skyphos a vernice nera, Bronzetto antropomorfo, Trittico con Matrimonio mistico di santa Caterina, Croce dipinta) con 22 immagini si caricano automaticamente a ogni installazione nuova.

| Comando | Effetto |
|---|---|
| `make reset-demo` | **cancella tutti i dati** (schede, immagini, utenti) e riparte dai dati dimostrativi. Chiede conferma (`./scripts/demo-reset.sh -y` per saltarla) |

I dati stanno in volumi Docker (`mysql-data`, `mongo-data`); per usare cartelle dell'host impostare `MYSQL_DATA_DIR` e `MONGO_DATA_DIR` in `.env`.

Credenziali dimostrative: amministratore `admin`/`admin`, schedatori `pasquale`, `elena`, `virginia` con password `schedatore`. Vanno cambiate prima di qualsiasi uso reale (da *Amministrazione › Utenti*).

## Configurazione

Tutte le variabili sono descritte in [`.env.example`](../.env.example). Le principali:

| Variabile | Uso |
|---|---|
| `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD` | segreti: **da cambiare** (es. `openssl rand -hex 32`) |
| `COOKIE_SECURE` | `true` quando il sito è in HTTPS |
| `TRUST_PROXY` | numero di reverse proxy davanti all'app (es. `1`) |
| `ALLOWED_ORIGINS` | indirizzo pubblico del sito, es. `https://catalogo.example.it` |
| `MEDIA_PREVIEW_PX` | lato lungo delle immagini pubbliche (default 1280 px) |
| `MEDIA_WATERMARK` | firma sulle anteprime pubbliche (default "© Musei Nazionali di Lucca", vuoto per disattivarla; per applicarla alle immagini esistenti va rigenerata l'anteprima) |
| `MAX_IMAGE_MB` | dimensione massima di un'immagine caricata (default 25 MB) |
| `BACKUP_DIR`, `BACKUP_HOUR`, `EXPORT_HOUR`, `BACKUP_KEEP_DAYS` | backup ed esportazioni |

## Backup, ripristino, esportazione

| | |
|---|---|
| Backup automatico | ogni giorno alle `BACKUP_HOUR` (default 3:00) in `backups/db/lumina-AAAAMMGG-HHMMSS.sql.gz`, conservati `BACKUP_KEEP_DAYS` giorni. Comprende catalogo **e** immagini |
| Backup immediato | `make backup` |
| Ripristino | `make restore FILE=backups/db/lumina-....sql.gz` (chiede conferma, sostituisce i dati attuali) |
| Excel automatico | ogni giorno alle `EXPORT_HOUR` in `backups/excel/lumina-catalogo-AAAAMMGG.xlsx` |
| Excel immediato | `make export`, oppure *Amministrazione › Esporta catalogo (Excel)* nel sito |

L'Excel contiene un foglio con tutte le schede (una riga per opera, testi senza formattazione) e un foglio per ogni vocabolario.

I backup restano sulla stessa macchina: **copiarli regolarmente altrove** (altro disco, NAS, storage cloud), ad esempio con un `rsync` notturno della cartella `backups/`. Gli account utente (MongoDB) non sono nel backup automatico; per salvarli:

```bash
docker compose exec mongo mongodump --archive --gzip > backups/utenti-$(date +%Y%m%d).archive.gz
```

## Aggiornare un'installazione esistente

```bash
make backup                 # prima di tutto
git pull
make up                     # ricostruisce l'immagine e applica le migrazioni
make logs                   # controllare "Migrazione database: ... completata"
```

Le migrazioni sono registrate nella tabella `schema_migrations` e vengono applicate una sola volta. Le modifiche allo schema di MySQL non sono transazionali: in caso di errore ripristinare il backup.

**Installazioni precedenti alla versione 2** (dati in `database-data/` e `user-data/`, MySQL 8.0):

- se i dati erano solo quelli dimostrativi, non serve fare nulla: la nuova versione usa volumi Docker e ricarica le opere di esempio (le vecchie cartelle si possono poi cancellare);
- installazioni con MongoDB senza autenticazione (precedenti a questa versione): dopo `make up` eseguire una volta `make mongo-auth`, che crea gli utenti del database;
- per conservarli, aggiungere a `.env` `MYSQL_DATA_DIR=./database-data` e `MONGO_DATA_DIR=./user-data/mongo-data`, avviare con `make up` (MySQL 8.0 → 8.4 si aggiorna da solo), eseguire una volta `make grant-media` per creare il database delle immagini e infine `make restart`.

## Messa in produzione: elenco di controllo

Dettagli e motivazioni in [SICUREZZA.md](SICUREZZA.md). `make verifica-produzione` controlla automaticamente i punti di configurazione.

- [ ] Nuovi valori per `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`, `MONGO_ROOT_PASSWORD`, `MONGO_APP_PASSWORD`; `.env` con permessi `600`
- [ ] `SECURITY_CONTACT` impostato (pubblicato in `/.well-known/security.txt`)
- [ ] `make verifica-produzione` senza errori e `make scansione-sicurezza` senza avvisi
- [ ] Reverse proxy con HTTPS (Caddy, Traefik o nginx) davanti a `nodeapp`; `APP_BIND=127.0.0.1` se il proxy è sulla stessa macchina
- [ ] `COOKIE_SECURE=true`, `TRUST_PROXY=1`, `ALLOWED_ORIGINS=https://…`
- [ ] Utenti dimostrativi eliminati o con nuove password
- [ ] Copia dei backup su un'altra macchina e prova di ripristino
- [ ] Monitoraggio di `GET /healthz` e dello spazio disco
- [ ] Pagine `/privacy` e `/termini` completate (parti tra parentesi quadre) e verificate dall'ufficio legale

## Interfaccia originale dello user-manager

Non serve più (gli utenti si gestiscono in *Amministrazione › Utenti*). Se necessaria, solo in locale:

```bash
docker compose -f docker-compose.yml -f docker-compose.user-front.yml up -d
```

## Comandi utili

```bash
make db                                  # console MySQL
docker compose exec mysqldb sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT id, titolo_testo, stato FROM luminadb.schede"'
docker compose logs -f backup            # esito dei backup
```
