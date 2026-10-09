#!/bin/bash
# Riporta l'ambiente allo stato iniziale: elimina i dati (catalogo, immagini,
# utenti) e riavvia, ricaricando le opere e gli utenti dimostrativi.
#   scripts/demo-reset.sh        chiede conferma
#   scripts/demo-reset.sh -y     senza conferma
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "${1:-}" != "-y" ]; then
  read -r -p "Tutti i dati attuali verranno eliminati e sostituiti con quelli dimostrativi. Continuare? [s/N] " ok
  [ "$ok" = "s" ] || [ "$ok" = "S" ] || { echo "Annullato"; exit 0; }
fi
if grep -qE '^(MYSQL|MONGO)_DATA_DIR=.+/' .env 2>/dev/null; then
  echo "Attenzione: .env usa cartelle dell'host per i dati (MYSQL_DATA_DIR/MONGO_DATA_DIR)." >&2
  echo "Svuotarle a mano prima di proseguire, oppure rimuovere quelle variabili." >&2
  exit 1
fi
docker network inspect extern >/dev/null 2>&1 || docker network create extern >/dev/null
docker compose down --volumes --remove-orphans
docker compose up -d --build
echo "Attendo che l'applicazione sia pronta..."
for _ in $(seq 1 90); do
  if [ "$(docker inspect -f '{{.State.Health.Status}}' nodeappcontainer 2>/dev/null)" = healthy ]; then
    echo "Pronto: http://localhost:${APP_PORT:-3000}"
    exit 0
  fi
  sleep 2
done
echo "L'applicazione non risulta pronta: controllare con 'docker compose logs nodeapp'" >&2
exit 1
