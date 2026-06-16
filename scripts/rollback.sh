#!/usr/bin/env bash
# rollback.sh — emergency rollback do poprzedniego release
# Uzycie: bash /var/www/mlre/scripts/rollback.sh [release_name]
# Bez argumentu: cofa do poprzedniego release automatycznie

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/mlre}"
PM2_NAME="${PM2_NAME:-mlre-web}"
RELEASES_DIR="$DEPLOY_PATH/releases"

CURRENT=$(readlink -f "$DEPLOY_PATH/current" 2>/dev/null | xargs basename 2>/dev/null || echo "none")

if [ -n "${1:-}" ]; then
  TARGET="$1"
else
  # Automatycznie: drugi najnowszy release
  TARGET=$(ls -1t "$RELEASES_DIR" | grep -v "^$CURRENT$" | head -1)
fi

if [ -z "$TARGET" ]; then
  echo "Brak release do rollbacku (tylko jeden istnieje lub brak releases)"
  exit 1
fi

if [ ! -d "$RELEASES_DIR/$TARGET" ]; then
  echo "Release nie istnieje: $RELEASES_DIR/$TARGET"
  exit 1
fi

echo "=== ROLLBACK: $CURRENT --> $TARGET ==="
echo ""
echo "Aktualny:  $CURRENT"
echo "Docelowy:  $TARGET"
echo ""
read -r -p "Potwierdz rollback (y/N): " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Anulowano"; exit 0; }

# Przelacz symlink
ln -sfn "$RELEASES_DIR/$TARGET" "$DEPLOY_PATH/current"
echo "[1/3] Symlink: current -> $TARGET"

# Restart PM2 z poprzednim kodem
pm2 restart "$PM2_NAME" 2>/dev/null || \
pm2 start "$DEPLOY_PATH/current/server.js" --name "$PM2_NAME" --instances 1
echo "[2/3] PM2 restarted"

# Nginx reload
nginx -t && nginx -s reload
echo "[3/3] Nginx reloaded"

echo ""
echo "=== Rollback zakończony ==="
echo "    Aktywny release: $TARGET"
echo "    Sprawdz: pm2 logs $PM2_NAME"
echo "    Weryfikacja: curl -A 'Googlebot/2.1' https://www.maltaluxuryrealestate.com/ | wc -c"
