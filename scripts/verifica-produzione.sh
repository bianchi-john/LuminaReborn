#!/bin/bash
# Controlla la configurazione (.env) prima della messa in produzione.
# Esce con errore se trova impostazioni non sicure.
set -uo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="${1:-.env}"
[ -f "$ENV_FILE" ] || { echo "File $ENV_FILE non trovato"; exit 1; }

errori=0
avvisi=0
val() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- ; }
ko() { echo "  ✗ $1"; errori=$((errori + 1)); }
warn() { echo "  ! $1"; avvisi=$((avvisi + 1)); }
ok() { echo "  ✓ $1"; }

echo "Verifica di $ENV_FILE"

perm=$(stat -c %a "$ENV_FILE" 2>/dev/null || stat -f %Lp "$ENV_FILE")
[ "$perm" = "600" ] || [ "$perm" = "400" ] && ok "permessi del file $perm" || ko "permessi del file $perm: usare chmod 600 $ENV_FILE"

for var in DB_PASSWORD MYSQL_ROOT_PASSWORD ADMIN_PASSWORD MONGO_ROOT_PASSWORD MONGO_APP_PASSWORD; do
  v=$(val "$var")
  case "$v" in
    ""|letmein|admin|password|changeme|schedatore) ko "$var vuota o dimostrativa" ;;
    *) [ ${#v} -ge 12 ] && ok "$var impostata" || ko "$var troppo corta (almeno 12 caratteri)" ;;
  esac
done

jwt=$(val JWT_SECRET)
if [ "$jwt" = "sonoVVNÀAFINVASDVNNSJljnval" ] || [ ${#jwt} -lt 32 ]; then
  ko "JWT_SECRET dimostrativo o corto: generarne uno con 'openssl rand -hex 32'"
else
  ok "JWT_SECRET"
fi

[ "$(val COOKIE_SECURE)" = "true" ] && ok "COOKIE_SECURE=true" || ko "COOKIE_SECURE deve essere true (sito in HTTPS)"
case "$(val ALLOWED_ORIGINS)" in https://*) ok "ALLOWED_ORIGINS in https" ;; *) ko "ALLOWED_ORIGINS: indicare l'indirizzo pubblico https://..." ;; esac
[ "$(val TRUST_PROXY)" != "0" ] && [ -n "$(val TRUST_PROXY)" ] && ok "TRUST_PROXY" || warn "TRUST_PROXY=0: corretto solo se non c'è un reverse proxy davanti all'app"
[ -n "$(val SECURITY_CONTACT)" ] && ok "SECURITY_CONTACT" || warn "SECURITY_CONTACT vuoto: /.well-known/security.txt non verrà pubblicato"
[ "$(val APP_BIND)" = "127.0.0.1" ] && ok "APP_BIND=127.0.0.1 (app raggiungibile solo dal reverse proxy)" || warn "APP_BIND diverso da 127.0.0.1: l'app è esposta anche in HTTP senza proxy"

echo
if [ "$errori" -gt 0 ]; then
  echo "$errori problemi da correggere, $avvisi avvisi"
  exit 1
fi
echo "Configurazione adatta alla produzione ($avvisi avvisi)"
