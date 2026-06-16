#!/usr/bin/env bash
# deploy.sh — VPS-side deployment script, triggered by GitHub Actions
# Usage: bash /var/www/mlre/scripts/deploy.sh <RELEASE> <PORT> <PM2_NAME> <DEPLOY_PATH>

set -euo pipefail

RELEASE="${1:?Release ID required}"
PORT="${2:-3100}"
PM2_NAME="${3:-mlre-web}"
DEPLOY_PATH="${4:-/var/www/mlre}"
RELEASES_DIR="$DEPLOY_PATH/releases"
ENV_FILE="$DEPLOY_PATH/shared/.env.production"

echo "=== Malta Luxury RE Deploy === release=$RELEASE port=$PORT pm2=$PM2_NAME"

# [1] Unpack
echo "[1/6] Unpacking release..."
cd "$RELEASES_DIR/$RELEASE"
tar -xzf release.tgz
rm release.tgz

# [2] Write .env.production from environment variables injected by Actions
echo "[2/6] Writing .env.production..."
mkdir -p "$DEPLOY_PATH/shared" "$DEPLOY_PATH/logs"
cat > "$ENV_FILE" <<ENDENV
NODE_ENV=production
PORT=$PORT
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}
NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN:-}
NEXT_PUBLIC_SITE_URL=https://www.maltaluxuryrealestate.com
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
STRIPE_PRICE_PRO=${STRIPE_PRICE_PRO:-}
STRIPE_PRICE_FEATURED=${STRIPE_PRICE_FEATURED:-}
RESEND_API_KEY=${RESEND_API_KEY:-}
ADMIN_KEY=${ADMIN_KEY:-}
ENDENV
chmod 600 "$ENV_FILE"

# [3] Atomic symlink switch
echo "[3/6] Switching symlink: current -> $RELEASE"
ln -sfn "$RELEASES_DIR/$RELEASE" "$DEPLOY_PATH/current"

# [4] PM2 restart (only mlre-web — never touch other projects)
echo "[4/6] Restarting PM2 process: $PM2_NAME"
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
  pm2 stop "$PM2_NAME" 2>/dev/null || true
  pm2 delete "$PM2_NAME" 2>/dev/null || true
fi

# Load env file and start
set -a && source "$ENV_FILE" && set +a
pm2 start "$DEPLOY_PATH/current/server.js" \
  --name "$PM2_NAME" \
  --instances 1 \
  --log "$DEPLOY_PATH/logs/pm2.log" \
  --time
pm2 save

# [5] Local smoke test
echo "[5/6] Local smoke test on port $PORT..."
sleep 4
BYTES=$(curl -sf -A "Googlebot/2.1" "http://127.0.0.1:$PORT/" 2>/dev/null | wc -c || echo 0)
echo "    Response: ${BYTES} bytes"
if [ "${BYTES}" -lt 3000 ]; then
  echo "ERROR: Response too small (${BYTES} bytes) — app may have crashed"
  echo "Run: pm2 logs $PM2_NAME"
  exit 1
fi

# [6] Nginx reload (test config first — never blindly reload)
echo "[6/6] nginx -t && reload..."
nginx -t
nginx -s reload

# Cleanup old releases (keep 3)
echo "[+] Cleaning old releases (keep 3)..."
ls -1dt "$RELEASES_DIR"/*/ 2>/dev/null | tail -n +4 | while IFS= read -r old; do
  echo "    Removing: $old"
  rm -rf "$old"
done

echo ""
echo "=== Deploy $RELEASE complete ==="
echo "    Live: https://www.maltaluxuryrealestate.com"
echo "    Logs: pm2 logs $PM2_NAME"
echo "    Rollback: ln -sfn <prev_release> $DEPLOY_PATH/current && pm2 reload $PM2_NAME && nginx -s reload"
