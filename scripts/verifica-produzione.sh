#!/bin/bash
# Checks the configuration (.env) before going to production.
# Exits with an error if it finds insecure settings.
set -uo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="${1:-.env}"
[ -f "$ENV_FILE" ] || { echo "File $ENV_FILE not found"; exit 1; }

errori=0
avvisi=0
val() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- ; }
ko() { echo "  ✗ $1"; errori=$((errori + 1)); }
warn() { echo "  ! $1"; avvisi=$((avvisi + 1)); }
ok() { echo "  ✓ $1"; }

echo "Checking $ENV_FILE"

perm=$(stat -c %a "$ENV_FILE" 2>/dev/null || stat -f %Lp "$ENV_FILE")
[ "$perm" = "600" ] || [ "$perm" = "400" ] && ok "file permissions $perm" || ko "file permissions $perm: use chmod 600 $ENV_FILE"

for var in DB_PASSWORD MYSQL_ROOT_PASSWORD ADMIN_PASSWORD MONGO_ROOT_PASSWORD MONGO_APP_PASSWORD; do
  v=$(val "$var")
  case "$v" in
    ""|letmein|admin|password|changeme|schedatore) ko "$var empty or demo value" ;;
    *) [ ${#v} -ge 12 ] && ok "$var set" || ko "$var too short (at least 12 characters)" ;;
  esac
done

jwt=$(val JWT_SECRET)
if [ "$jwt" = "sonoVVNÀAFINVASDVNNSJljnval" ] || [ ${#jwt} -lt 32 ]; then
  ko "JWT_SECRET is the demo value or too short: generate one with 'openssl rand -hex 32'"
else
  ok "JWT_SECRET"
fi

[ "$(val COOKIE_SECURE)" = "true" ] && ok "COOKIE_SECURE=true" || ko "COOKIE_SECURE must be true (site served over HTTPS)"
case "$(val ALLOWED_ORIGINS)" in https://*) ok "ALLOWED_ORIGINS uses https" ;; *) ko "ALLOWED_ORIGINS: set the public https://... address" ;; esac
[ "$(val TRUST_PROXY)" != "0" ] && [ -n "$(val TRUST_PROXY)" ] && ok "TRUST_PROXY" || warn "TRUST_PROXY=0: correct only if there is no reverse proxy in front of the app (otherwise the anti-scraping protection sees a single address and blocks everyone)"
[ -n "$(val SECURITY_CONTACT)" ] && ok "SECURITY_CONTACT" || warn "SECURITY_CONTACT empty: /.well-known/security.txt will not be published"
[ "$(val APP_BIND)" = "127.0.0.1" ] && ok "APP_BIND=127.0.0.1 (app reachable only through the reverse proxy)" || warn "APP_BIND is not 127.0.0.1: the app is also exposed over plain HTTP without the proxy"

echo
if [ "$errori" -gt 0 ]; then
  echo "$errori problems to fix, $avvisi warnings"
  exit 1
fi
echo "Configuration suitable for production ($avvisi warnings)"
