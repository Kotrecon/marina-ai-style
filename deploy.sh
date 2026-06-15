#!/bin/bash

# Stop on error
set -e

PROJECT_DIR="/root/marina-ai-style"
PUBLISH_DIR="$PROJECT_DIR/publish"

echo "=== Marina AI Style Deploy ==="

# 1. Build
echo "[1/4] Building..."
cd "$PROJECT_DIR/backend"
dotnet publish -c Release -o "$PUBLISH_DIR"

# 2. Create systemd service
echo "[2/4] Creating service..."
cat > /etc/systemd/system/marina.service << EOF
[Unit]
Description=Marina AI Style
After=network.target postgresql.service

[Service]
WorkingDirectory=$PUBLISH_DIR
ExecStart=/usr/bin/dotnet $PUBLISH_DIR/MarinaAiStyle.dll
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5000

[Install]
WantedBy=multi-user.target
EOF

# 3. Start service
echo "[3/4] Starting service..."
systemctl daemon-reload
systemctl enable marina
systemctl restart marina

# 4. Open firewall
echo "[4/4] Opening port 5000..."
ufw allow 5000/tcp 2>/dev/null || true

echo ""
echo "=== Done! ==="
echo "Open in browser: http://201.51.7.47:5000"
echo ""
echo "Commands:"
echo "  systemctl status marina    - check status"
echo "  systemctl restart marina   - restart"
echo "  journalctl -u marina -f    - view logs"
