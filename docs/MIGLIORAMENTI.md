# Proposte di miglioramento

Proposte per i prossimi sviluppi, in ordine di priorità. Il ramo `experimentsJohn` contiene già la riscrittura descritta nel README.

## Priorità alta

1. **HTTPS e dominio dedicato.** Reverse proxy (Caddy o Traefik) con certificati Let's Encrypt davanti all'app; poi `COOKIE_SECURE=true` e `TRUST_PROXY=1`. Senza HTTPS le password viaggiano in chiaro.
2. **Segreti reali e rotazione.** Nuovi `JWT_SECRET`, password MySQL e amministratore. Il vecchio `.env`, con il `JWT_SECRET` dimostrativo, risulta già nella storia git (commit `53df3aee`, `b33692cb`): quel segreto va considerato pubblico.
3. **Backup automatici.** `mysqldump` notturno con rotazione (es. 14 giornalieri + 6 mensili) su un disco diverso o su object storage, e una prova di ripristino ogni qualche mese.
4. **Sostituire lo user-manager.** L'immagine `moreillon/user-manager-mongoose` impone password di sole lettere e numeri, emette token senza scadenza e restituisce l'hash della password su `/users/self`. Ora è isolato dietro l'app, ma la soluzione pulita è gestire gli utenti in MySQL (hash Argon2/bcrypt, sessioni server-side, reset password via email) ed eliminare MongoDB: un servizio e un database in meno.
5. **Autenticazione a due fattori** (TOTP) almeno per gli amministratori.

## Catalogo e dati

6. **Allineamento agli standard ICCD** (schede OA/RA): mappare i campi su quelli ministeriali per facilitare scambi con il Catalogo Generale dei Beni Culturali, ed esportazione in formato ICCD/XML.
7. **Authority file esterni**: collegare autori e luoghi a identificativi ULAN/VIAF/Wikidata e GeoNames (un campo `uri` sulle voci), per disambiguare gli omonimi e arricchire le pagine voce.
8. **Ambito storico-culturale come voce condivisa**, come autori e materiali (oggi è testo libero con suggerimenti).
9. **Versionamento delle schede**: conservare le versioni precedenti a ogni approvazione, con confronto delle differenze per l'amministratore.
10. **Commenti di revisione per campo**, invece di un solo messaggio di rifiuto.
11. **Importazione massiva** da CSV/Excel per le campagne di schedatura, con anteprima e riconoscimento delle voci esistenti.

## Immagini

12. **Immagini su file system o object storage** (S3/MinIO) invece che nel database, con miniature generate al caricamento (es. `sharp`) e formati moderni (WebP/AVIF). Oggi le pagine scaricano l'immagine originale anche per le anteprime.
13. **Visualizzatore ad alta risoluzione con zoom profondo** (IIIF + OpenSeadragon), molto apprezzato per dipinti e dettagli.
14. **Diritti e crediti fotografici** per ogni immagine (autore della foto, licenza, riproduzione consentita).

## Consultazione

15. **Ricerca full-text** con rilevanza, tolleranza agli errori di battitura e filtri a faccette (MySQL FULLTEXT come primo passo, Meilisearch/OpenSearch se il catalogo cresce).
16. **SEO e condivisione**: sitemap.xml, dati strutturati schema.org (`VisualArtwork`), anteprime Open Graph con l'immagine dell'opera, URL con il titolo (`/scheda/12-san-sebastiano`).
17. **Versione inglese** dell'interfaccia (e in prospettiva dei testi delle schede).
18. **Accessibilità**: verifica WCAG 2.1 AA con lettori di schermo e testi alternativi obbligatori per le immagini.
19. **API pubblica in sola lettura** documentata (OpenAPI) e dati aperti (licenza CC BY) per ricercatori e altre istituzioni.

## Qualità del software

20. **Integrazione continua** (GitHub Actions): typecheck, test, build dell'immagine Docker e scansione delle vulnerabilità delle dipendenze (`npm audit`, Trivy) a ogni push.
21. **Test di integrazione** su un MySQL effimero (migrazioni, salvataggio schede, permessi) e test end-to-end dell'editor con Playwright.
22. **Monitoraggio**: log strutturati, metriche e avvisi (uptime, errori 5xx, spazio disco del database).
23. **Rimuovere gli IP statici** dal docker-compose: i servizi si raggiungono per nome e gli IP fissi rendono fragile il deploy.
24. **Ripulire la storia git** da `Doc/` (file binari pesanti) e dai segreti, oppure spostare la documentazione in un archivio separato.
