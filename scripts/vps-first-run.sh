#!/usr/bin/env bash
# vps-first-run.sh — run ONCE on VPS before first GitHub Actions deploy
# ssh root@<VPS_IP> "bash /tmp/vps-first-run.sh"
#
# What it does:
#   1. Creates /var/www/mlre/{releases,shared,logs,scripts} directories
#   2. Copies nginx vhost config (proxy :3100)
#   3. Adds deploy SSH public key to authorized_keys
#   4. Installs PM2 globally if missing
#   5. Creates initial placeholder .env.production

set -euo pipefail

DEPLOY_PATH="/var/www/mlre"
NGINX_AVAILABLE="/etc/nginx/sites-available/maltaluxuryrealestate.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/maltaluxuryrealestate.com"
NEXT_PORT="3100"

echo "=== VPS First-Run Setup for Malta Luxury RE ==="

# ── 1. Directories ────────────────────────────────────────────────────────────
echo "[1/5] Creating directory structure..."
mkdir -p \
  "$DEPLOY_PATH/releases" \
  "$DEPLOY_PATH/shared" \
  "$DEPLOY_PATH/logs" \
  "$DEPLOY_PATH/scripts"

# ── 2. Copy deploy scripts from repo (must be uploaded first) ─────────────────
echo "[2/5] Installing deploy scripts..."
# The scripts/ dir from your repo should be uploaded:
#   scp -r scripts/ root@VPS:/var/www/mlre/scripts/
# If already there:
chmod +x "$DEPLOY_PATH/scripts/"*.sh 2>/dev/null || true

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
echo "[3/5] Checking PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  pm2 startup systemd -u root --hp /root
  systemctl enable pm2-root 2>/dev/null || true
else
  echo "    PM2 already installed: $(pm2 --version)"
fi

# ── 4. Add deploy SSH key to authorized_keys ──────────────────────────────────
echo "[4/5] SSH authorized_keys setup..."
echo ""
echo "  PASTE your GitHub deploy public key below (from step 2 of the checklist)."
echo "  Press ENTER then Ctrl+D when done:"
echo ""
mkdir -p /root/.ssh
chmod 700 /root/.ssh
cat >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
echo "  Key added to authorized_keys"

# ── 5. Nginx vhost ────────────────────────────────────────────────────────────
echo "[5/5] Nginx vhost setup..."
if [ ! -f "$NGINX_AVAILABLE" ]; then
  echo "  No existing vhost found — creating new one for port $NEXT_PORT"
  cat > "$NGINX_AVAILABLE" << NGINXEOF
server {
    listen 80;
    server_name maltaluxuryrealestate.com www.maltaluxuryrealestate.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name maltaluxuryrealestate.com www.maltaluxuryrealestate.com;

    ssl_certificate     /etc/letsencrypt/live/maltaluxuryrealestate.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maltaluxuryrealestate.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:$NEXT_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:$NEXT_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINXEOF
  ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  nginx -t && nginx -s reload
  echo "  Nginx vhost created and enabled"
else
  echo "  Existing vhost found — updating proxy_pass to port $NEXT_PORT"
  # Only change the proxy port — don't touch SSL config
  sed -i "s|proxy_pass http://127.0.0.1:[0-9]*;|proxy_pass http://127.0.0.1:$NEXT_PORT;|g" "$NGINX_AVAILABLE"
  nginx -t && nginx -s reload
  echo "  Nginx proxy_pass updated to :$NEXT_PORT and reloaded"
fi

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. Push to 'main' branch — GitHub Actions will build and deploy automatically"
echo "  2. Monitor: pm2 logs mlre-web"
echo "  3. Rollback if needed: bash $DEPLOY_PATH/scripts/rollback.sh"
