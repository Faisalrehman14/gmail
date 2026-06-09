#!/bin/bash
# Easy Gmail SMTP setup for Railway — run after: railway login && railway link

echo "=== MailFlow Gmail Setup ==="
echo ""

read -p "Gmail address: " GMAIL
read -sp "Gmail App Password (16 chars, no spaces): " APP_PASS
echo ""
read -p "Railway app URL [https://gmail-production-9795.up.railway.app]: " APP_URL
APP_URL=${APP_URL:-https://gmail-production-9795.up.railway.app}

# Remove spaces from app password
APP_PASS=$(echo "$APP_PASS" | tr -d ' ')

echo ""
echo "Setting Railway variables..."

railway variables set \
  SMTP_HOST=smtp.gmail.com \
  SMTP_PORT=587 \
  SMTP_SECURE=false \
  SMTP_USER="$GMAIL" \
  SMTP_PASS="$APP_PASS" \
  SMTP_FROM_EMAIL="$GMAIL" \
  SMTP_FROM_NAME=MailFlow \
  SMTP_NAME=Gmail \
  NEXT_PUBLIC_APP_URL="$APP_URL" \
  ENABLE_INLINE_WORKER=true

echo ""
echo "Done! Railway will redeploy automatically."
echo "Wait 2-3 minutes, then go to Settings → Send Test"
