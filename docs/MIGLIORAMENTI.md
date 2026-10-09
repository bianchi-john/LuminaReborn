# Proposte di miglioramento

## Già realizzate

- Voci condivise (autori, materiali, tecniche, luoghi, provenienze, mostre, bibliografia) collegate alle schede, con avviso sui doppioni e unione dei duplicati
- Editor a sezioni, misure in gruppi, riepilogo di completezza, messaggi tra schedatore e amministratore
- Immagini in un database separato: originale riservato allo staff, versioni ridotte e senza metadati per il pubblico
- Ricerca con rilevanza, singolare/plurale, suggerimenti e "forse cercavi"
- Interfaccia in italiano e inglese
- Confronto dimensionale con la sagoma umana
- Backup giornaliero con rotazione, ripristino, esportazione Excel
- Sicurezza: query parametrizzate, sanitizzazione HTML, CSP, CSRF, sessioni con scadenza e revoca, rate limit, servizi interni non esposti
- Test unitari ed end-to-end, CI, ambiente di sviluppo con ricarica automatica

## Priorità alta

1. **HTTPS e dominio dedicato** con reverse proxy (Caddy o Traefik, certificati Let's Encrypt), poi `COOKIE_SECURE=true` e `TRUST_PROXY=1`.
2. **Nuovi segreti.** Il `JWT_SECRET` dimostrativo è nella storia git (commit `53df3aee`, `b33692cb`) e nel vecchio `docker-compose.yml`: va considerato pubblico.
3. **Copia dei backup fuori dalla macchina** (NAS, storage cloud) e prova periodica di ripristino.
4. **Sostituire lo user-manager** con account gestiti in MySQL (hash Argon2, sessioni lato server, reset password via email, password con simboli): elimina MongoDB e un servizio esterno non più mantenuto attivamente. Aggiungere poi l'**autenticazione a due fattori** per gli amministratori.
5. **Aggiornare sharp a 0.35.5** appena disponibile da più di due settimane (avviso su librsvg, oggi non sfruttabile perché gli SVG sono rifiutati) e togliere `continue-on-error` dall'audit in CI.

## Catalogo

6. **Allineamento alle schede ICCD (OA/RA)** ed esportazione verso il Catalogo Generale dei Beni Culturali.
7. **Authority file esterni**: identificativi ULAN/VIAF/Wikidata per gli autori e GeoNames per i luoghi, per disambiguare gli omonimi.
8. **Ambito storico-culturale come voce condivisa** (oggi testo libero con suggerimenti).
9. **Versioni delle schede**: conservare le versioni approvate e mostrare all'amministratore le differenze rispetto alla precedente.
10. **Commenti di revisione sul singolo campo**, invece di un unico messaggio.
11. **Importazione da Excel/CSV** per le campagne di schedatura, con riconoscimento delle voci esistenti.
12. **Immagini nei testi formattati**: il filtro HTML già ammette le immagini dell'archivio; manca il pulsante dell'editor per inserirle.

## Consultazione

13. **Zoom ad alta risoluzione** (IIIF + OpenSeadragon) con tasselli limitati per il pubblico, coerente con la tutela degli originali.
14. **Crediti e licenze delle fotografie** su ogni immagine.
15. **SEO**: sitemap, dati strutturati schema.org (`VisualArtwork`), URL con il titolo (`/scheda/12-san-sebastiano`).
16. **Ricerca full-text** (MySQL FULLTEXT o Meilisearch) quando il catalogo supererà qualche migliaio di schede.
17. **API pubblica in sola lettura** documentata e dati aperti per ricercatori e altre istituzioni.
18. **Verifica di accessibilità WCAG 2.1 AA** con lettori di schermo.

## Operatività

19. **Monitoraggio**: controllo di `/healthz`, avvisi su errori e spazio disco, log centralizzati.
20. **Rimuovere gli IP statici** dal `docker-compose.yml` (i servizi si raggiungono per nome) e la rete esterna `extern` se non usata da un proxy.
21. **Ripulire la storia git** dai segreti e dai file pesanti in `Doc/`.
