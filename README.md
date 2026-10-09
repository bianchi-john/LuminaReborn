# LUMiNA

**Catalogo digitale delle opere dei [Musei Nazionali di Lucca](http://www.luccamuseinazionali.it/).**

LUMiNA è un archivio pensato per due pubblici: gli **schedatori e gli storici dell'arte**, che descrivono le opere con schede ricche e collegate tra loro, e i **visitatori**, che consultano il catalogo, cercano e scoprono le relazioni tra opere, autori, luoghi e mostre.

> Stato: prototipo avanzato. Il repository include sei schede dimostrative con immagini, caricate automaticamente al primo avvio.

## Cosa fa

**Per chi consulta**
- Ricerca semplice con suggerimenti mentre si scrive e ricerca avanzata campo per campo (datazione anche a.C., menu a tendina per classificazione, materiali, ubicazioni…).
- Indici per autore, materiale, tecnica, ubicazione, provenienza e mostra: ogni voce mostra tutte le opere collegate.
- Scheda dell'opera con galleria, dati tecnici, bibliografia e un **confronto dimensionale** con la sagoma di una persona (o di una mano, per gli oggetti piccoli), calcolato dalle misure.
- Interfaccia in **italiano** e **inglese** (scelta automatica dal browser o dal selettore in alto); i contenuti delle schede restano in italiano.
- Immagini pubbliche in versione ridotta: gli originali ad alta risoluzione restano riservati allo staff.

**Per chi cataloga**
- Editor a sezioni (identificazione, autori, datazione, misure, collocazione, testi, mostre, bibliografia, immagini, riepilogo).
- Autori, materiali, tecniche, luoghi, mostre e bibliografia sono **voci condivise**: si cerca prima tra quelle esistenti e, prima di crearne una nuova, il sistema avvisa se ce ne sono di simili. Così le schede restano collegate e senza doppioni.
- Flusso di revisione: bozza → invio con messaggio → approvazione o rifiuto motivato dell'amministratore → pubblicazione. Ogni passaggio resta nello storico.

**Per chi amministra**
- Revisione delle schede, gestione degli utenti, vocabolari con unione dei duplicati.
- Backup automatico giornaliero del database ed **esportazione Excel** del catalogo, leggibile anche senza strumenti tecnici.

## Provarlo in 2 minuti

Serve solo **Docker** (con Compose v2) e `make`.

```bash
git clone https://github.com/bianchi-john/LuminaReborn.git
cd LuminaReborn
make up
```

Apri <http://localhost:3000>. Per l'area riservata:

| Ruolo | Utente | Password |
|---|---|---|
| Amministratore | `admin` | `admin` |
| Schedatore | `pasquale`, `elena`, `virginia` | `schedatore` |

Per ricominciare da capo con i dati dimostrativi: `make reset-demo`. Tutti i comandi: `make`.

## Documentazione

| | |
|---|---|
| [docs/INSTALLAZIONE.md](docs/INSTALLAZIONE.md) | Installazione, configurazione, dati dimostrativi, aggiornamenti, backup e ripristino, messa in produzione |
| [docs/SVILUPPO.md](docs/SVILUPPO.md) | Ambiente di sviluppo con ricarica automatica, architettura, modello dei dati, traduzioni, test |
| [docs/MIGLIORAMENTI.md](docs/MIGLIORAMENTI.md) | Proposte per i prossimi sviluppi |

## Tecnologie

Node.js 22 e TypeScript, Express, pagine renderizzate dal server con EJS, Bootstrap 5; MySQL 8.4 (catalogo e, in un database separato, i file delle immagini); MongoDB con [user-manager](https://github.com/maximemoreillon/user_manager) per gli account. Tutto gira in Docker.
