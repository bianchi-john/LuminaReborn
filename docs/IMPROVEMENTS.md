# Roadmap

## Done

- Shared, linked authority entries with duplicate warnings and merging
- Tabbed editor, grouped measurements, completeness summary, cataloguer ↔ admin messages
- Separate image database: originals for staff only; watermarked, metadata-free previews for the public; pixel limits
- Images in rich text, limited to the record's own images
- Ranked search with singular/plural matching, suggestions and "did you mean"
- Italian/English UI; size comparison silhouette
- Daily backups, restore, Excel export
- Security review (ZAP clean), audit log, session timeouts, MongoDB auth, Dependabot
- Anti-scraping (per-IP limits, temporary blocks, AI crawlers excluded) and non-enumerable public URLs
- Unit and e2e tests, CI, hot-reload dev environment

## High priority

1. **HTTPS and a dedicated domain** (Caddy or Traefik with Let's Encrypt), then `COOKIE_SECURE=true` and `TRUST_PROXY=1`.
2. **New secrets.** The demo `JWT_SECRET` is in git history (commits `53df3aee`, `b33692cb`).
3. **Off-site backups** and periodic restore tests.
4. **Replace the user-manager** with accounts stored in MySQL (Argon2, server-side sessions, email password reset, full-charset passwords). This drops MongoDB. Then add **2FA** for admins.
5. **Upgrade sharp** (librsvg advisory) and make the CI audit blocking.

## Catalogue

6. Alignment with **ICCD OA/RA** records and export to the national catalogue.
7. **External authority IDs**: ULAN/VIAF/Wikidata for authors, GeoNames for places.
8. Historical/cultural context as a shared entry (free text with suggestions today).
9. **Record versions** with a diff for the reviewing admin.
10. Review comments on individual fields.
11. **Excel/CSV import** for cataloguing campaigns, matching existing entries.

## Public site

12. **Deep zoom** (IIIF + OpenSeadragon) with limited tiles for the public.
13. Photo credits and licences on every image.
14. **SEO**: sitemap, schema.org `VisualArtwork` data.
15. Full-text search (MySQL FULLTEXT or Meilisearch) beyond a few thousand records.
16. A documented, read-only **public API** and open data.
17. WCAG 2.1 AA audit with screen readers.

## Operations

18. Monitoring: `/healthz`, alerts on errors and disk space, central logs.
19. Remove the static IPs from `docker-compose.yml` and the external `extern` network if no proxy uses it.
20. Move anti-scraping state to Redis if the app ever runs as more than one instance.
21. Purge secrets and the large binaries in `docs/Doc/` from git history.
