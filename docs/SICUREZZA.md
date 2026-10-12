# Sicurezza e conformità

Questo documento descrive le misure di sicurezza di LUMiNA, come si verificano e cosa resta da fare prima della messa in produzione. È pensato per chi deve valutare il sito (ufficio sicurezza, DPO, verificatori esterni).

Riferimenti utilizzati: OWASP Top 10 (2021), OWASP ASVS 4.0 (livello 1, con i controlli di livello 2 su sessioni e registrazione degli eventi), OWASP Secure Headers, GDPR (artt. 5, 25, 32), Linee guida del Garante su cookie e strumenti di tracciamento (10 giugno 2021), Misure minime di sicurezza ICT per le PA (AgID, circolare 2/2017), Legge 4/2004 e Linee guida AgID sull'accessibilità.

## Esito delle verifiche

| Verifica | Come ripeterla | Esito |
|---|---|---|
| Scansione OWASP ZAP baseline | `make scansione-sicurezza` (rapporto in `backups/zap/`) | 0 avvisi di rischio alto, medio o basso; restano solo note informative, motivate in `scripts/zap-regole.conf` |
| Test unitari (validazione, sanitizzazione, permessi, upload) | `make test` | superati |
| Test end-to-end (CSRF, permessi, header, cookie, login, cambio password, flusso di revisione) | `make test-e2e` | superati |
| Dipendenze con vulnerabilità note | `npm audit --omit=dev` (anche in CI) | un solo avviso su sharp/librsvg, non sfruttabile: vedi rischi residui |
| Configurazione di produzione | `make verifica-produzione` | da eseguire sul server: blocca password dimostrative, HTTPS mancante, permessi di `.env` |

## Misure per categoria (OWASP Top 10)

| Rischio | Misure |
|---|---|
| **A01 Controllo degli accessi** | Permessi calcolati lato server per ogni operazione (`computePermessi`, coperta da test); le bozze altrui rispondono 404 per non rivelarne l'esistenza; funzioni amministrative separate (`requireAdmin`); originali delle immagini solo per utenti autenticati con accesso alla scheda; nessun redirect verso siti esterni dopo il login |
| **A02 Crittografia** | HTTPS tramite reverse proxy con HSTS; cookie `Secure`, `HttpOnly`, `SameSite=Strict` e prefisso `__Host-`; password conservate solo come hash bcrypt (user-manager); nessun dato sensibile negli URL (login sempre in POST); segreti solo in `.env` con permessi 600 |
| **A03 Iniezione (SQL, XSS)** | Solo query parametrizzate; nomi di tabelle dinamici presi da configurazione statica; validazione di ogni input con schemi zod; HTML dei campi formattati ripulito con lista di tag ammessi in scrittura e in lettura; codifica dell'output (EJS); Content-Security-Policy senza script o stili inline o esterni; immagini verificate dai primi byte (niente SVG) |
| **A04 Progettazione** | Flusso bozza → revisione → pubblicazione con permessi per stato; minimo privilegio (utente MongoDB limitato al proprio database, container senza capability); limiti di frequenza e di dimensione su login, API e caricamenti |
| **A05 Configurazione** | Header di sicurezza (CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP/COEP/CORP); nessuno stack trace nelle risposte; app come utente non root, filesystem in sola lettura, `no-new-privileges`, `cap_drop: ALL`; MySQL esposto solo su localhost, user-manager e MongoDB solo in rete interna; in HTTPS l'app rifiuta di partire con la password dimostrativa del database |
| **A06 Componenti vulnerabili** | Versioni fissate (`package-lock.json`, immagini Docker con tag o digest); `npm audit` in CI; Dependabot per dipendenze, immagini e azioni |
| **A07 Autenticazione e sessioni** | Messaggi di errore generici; limiti di tentativi per IP e per nome utente; sessione con durata massima (8 ore) e chiusura per inattività (60 minuti); logout e cambio password revocano i token sul server; il cambio password richiede quella attuale; token anti-CSRF sul modulo di accesso; utenti bloccati esclusi anche con token valido |
| **A08 Integrità** | Installazione riproducibile (`npm ci`), build in CI; migrazioni del database versionate e registrate; backup verificati dopo la creazione (`gzip -t`) |
| **A09 Registrazione e monitoraggio** | Registro di audit (`AUDIT` nei log): accessi riusciti e falliti, logout, cambi di password, accessi negati, gestione utenti, eliminazioni, cambi di stato, unioni di voci, esportazioni. Storico delle revisioni per ogni scheda. Endpoint `/healthz` per il monitoraggio |
| **A10 SSRF** | Il server contatta solo l'indirizzo configurato dello user-manager; nessun URL fornito dagli utenti viene richiesto lato server |

Protezione CSRF, a più livelli: cookie `SameSite=Strict`; rifiuto delle richieste che il browser dichiara cross-site (`Sec-Fetch-Site`); `Origin`/`Referer` obbligatori e verificati quando c'è una sessione; corpo accettato solo in JSON o come immagine; token "double submit" sul modulo di accesso.

## Privacy (GDPR e linee guida del Garante)

- **Visitatori**: nessun dato personale raccolto, nessun cookie durante la consultazione, nessuno strumento di analisi, nessuna risorsa di terze parti (font, script e immagini sono serviti dal sito). La lingua viene dall'intestazione `Accept-Language` inviata dal browser o dal parametro `?lang=`, senza memorizzazione. L'indirizzo IP resta solo in memoria per pochi minuti nei limiti di frequenza. Un test end-to-end verifica che le pagine pubbliche non impostino cookie.
- **Personale**: solo cookie tecnici (sessione; token anti-CSRF limitato alla pagina di accesso), che non richiedono consenso e sono descritti nell'informativa. Dati degli account ridotti al necessario. I log di audit non contengono indirizzi IP, password, token o contenuti delle schede.
- **Informativa** (`/privacy`) e **termini** (`/termini`): bozze da completare con i dati del titolare e da far verificare all'ufficio legale.

## Misure minime AgID (estratto)

| Famiglia ABSC | In LUMiNA |
|---|---|
| 1-2 Inventario | componenti e versioni dichiarati in `package-lock.json` e `docker-compose.yml` |
| 3 Configurazioni sicure | configurazione di base sicura, verificabile con `make verifica-produzione` |
| 4 Vulnerabilità | `npm audit` in CI, Dependabot, scansione ZAP ripetibile |
| 5 Privilegi amministrativi | ruoli separati, minimo privilegio su database e container, registro delle azioni degli amministratori |
| 10 Copie di sicurezza | backup giornaliero automatico con rotazione e verifica, procedura di ripristino provata (`make restore`) |
| 13 Protezione dei dati | dati minimizzati, nessun tracciamento, originali delle immagini non pubblicati |

## Accessibilità (Legge 4/2004)

Struttura semantica, navigazione da tastiera, etichette e testi alternativi, rispetto della preferenza "riduci movimento". La pagina `/accessibilita` va collegata alla dichiarazione di accessibilità ufficiale da pubblicare tramite il modulo AgID dopo una valutazione WCAG 2.1 AA.

## Rischi residui e azioni prima della produzione

| # | Rischio / azione | Responsabile |
|---|---|---|
| 1 | Configurare HTTPS (reverse proxy), `COOKIE_SECURE=true`, `TRUST_PROXY`, `ALLOWED_ORIGINS`, `APP_BIND=127.0.0.1`; nuovi segreti; `make verifica-produzione` senza errori | gestore del server |
| 2 | Lo user-manager impone password di sole lettere e numeri e non offre l'autenticazione a due fattori. Mitigato da limiti di tentativi, scadenza delle sessioni e revoca. Soluzione definitiva: sostituirlo (vedi `MIGLIORAMENTI.md`) | sviluppo |
| 3 | sharp 0.35.4: avviso su librsvg (gestione degli SVG). Non sfruttabile perché gli SVG sono rifiutati prima dell'elaborazione; aggiornare a 0.35.5 e rendere bloccante l'audit in CI | sviluppo |
| 4 | Il `JWT_SECRET` dimostrativo è nella storia git: considerarlo pubblico e sostituirlo | gestore del server |
| 5 | Copia dei backup fuori dal server, preferibilmente cifrata, e prova periodica di ripristino | gestore del server |
| 6 | Raccolta centralizzata dei log con conservazione definita e allarmi su accessi falliti ripetuti ed errori | gestore del server |
| 7 | Completare informativa privacy e termini; inserire il trattamento nel registro dei trattamenti; nominare responsabile del trattamento il fornitore di hosting, se esterno | titolare / DPO |
| 8 | Valutazione di accessibilità e dichiarazione AgID | titolare |
| 9 | Test di penetrazione indipendente prima del lancio pubblico | titolare |

## Segnalazione di vulnerabilità

Impostare `SECURITY_CONTACT` (es. `mailto:sicurezza@ente.it`): il contatto viene pubblicato in `/.well-known/security.txt` (RFC 9116).
