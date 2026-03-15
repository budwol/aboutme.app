#!/bin/bash
set -euo pipefail

echo "---------------------------------------------"
echo " Bootstrap Initialization"
echo ""
echo "INFO:"
echo "A default logo.svg is included in the project."
echo "You can replace it with your own file at:"
echo "   ../public/logo.svg"
echo ""
echo "After replacing the file, simply run:"
echo "   ./scripts/init.sh"
echo ""

APP_DATA_FILE="../app-data.json"
NGINX_CONF_FILE="../nginx/site.conf"

echo "Updating nginx CSP based on siteUrl..."

if command -v jq >/dev/null 2>&1; then
  SITE_URL="$(jq -r '.siteUrl' "$APP_DATA_FILE")"
  PROFILE_NAME="$(jq -r '.profile.name' "$APP_DATA_FILE")"
else
  SITE_URL="$(node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('$APP_DATA_FILE','utf8')); process.stdout.write(d.siteUrl);")"
  PROFILE_NAME="$(node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('$APP_DATA_FILE','utf8')); process.stdout.write(d.profile?.name || '');")"
fi

# --- FORCE HTTPS ---
SITE_URL="${SITE_URL#http://}"
SITE_URL="${SITE_URL#https://}"
SITE_URL="https://${SITE_URL}"

HOST="${SITE_URL#https://}"
HOST="${HOST%%/*}"
HOST="${HOST%%:*}"

HOST_NO_WWW="${HOST#www.}"

IFS='.' read -ra PARTS <<< "$HOST_NO_WWW"
COUNT=${#PARTS[@]}

if [[ $COUNT -ge 2 ]]; then
  BASE_DOMAIN="${PARTS[$((COUNT-2))]}.${PARTS[$((COUNT-1))]}"
else
  BASE_DOMAIN="$HOST_NO_WWW"
fi

ALLOW_DOMAIN="https://${HOST_NO_WWW} https://*.${BASE_DOMAIN}"

CSP_LINE="add_header Content-Security-Policy \"default-src 'self'; connect-src 'self' ${ALLOW_DOMAIN} https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' ${ALLOW_DOMAIN}; script-src-elem 'self' 'unsafe-inline' ${ALLOW_DOMAIN}; style-src 'self' 'unsafe-inline' ${ALLOW_DOMAIN} https://cdnjs.cloudflare.com; font-src 'self' data: ${ALLOW_DOMAIN} https://cdnjs.cloudflare.com; img-src 'self' data: ${ALLOW_DOMAIN}; frame-src 'self' ${ALLOW_DOMAIN}; frame-ancestors 'self'; object-src 'none';\" always;"

if sed --version >/dev/null 2>&1; then
  sed -i -E "s|^[[:space:]]*add_header[[:space:]]+Content-Security-Policy.*|    ${CSP_LINE}|" "$NGINX_CONF_FILE"
else
  sed -i '' -E "s|^[[:space:]]*add_header[[:space:]]+Content-Security-Policy.*|    ${CSP_LINE}|" "$NGINX_CONF_FILE"
fi

echo "CSP updated for ${ALLOW_DOMAIN}"
echo ""

SITEMAP_FILE="../public/sitemap.xml"

echo "Updating sitemap.xml based on siteUrl..."

BASE_URL="https://${HOST}"
TODAY="$(date +%Y-%m-%d)"

if sed --version >/dev/null 2>&1; then
  sed -i -E "s|<loc>https://[^<]+</loc>|<loc>${BASE_URL}/</loc>|" "$SITEMAP_FILE"
  sed -i -E "s|href=\"https://[^\"]+\"|href=\"${BASE_URL}/\"|g" "$SITEMAP_FILE"
  sed -i -E "s|<lastmod>[^<]+</lastmod>|<lastmod>${TODAY}</lastmod>|" "$SITEMAP_FILE"
else
  sed -i '' -E "s|<loc>https://[^<]+</loc>|<loc>${BASE_URL}/</loc>|" "$SITEMAP_FILE"
  sed -i '' -E "s|href=\"https://[^\"]+\"|href=\"${BASE_URL}/\"|g" "$SITEMAP_FILE"
  sed -i '' -E "s|<lastmod>[^<]+</lastmod>|<lastmod>${TODAY}</lastmod>|" "$SITEMAP_FILE"
fi

echo "Sitemap updated for ${BASE_URL}"
echo ""

ROBOTS_FILE="../public/robots.txt"

echo "Updating robots.txt..."

if sed --version >/dev/null 2>&1; then
  sed -i -E "s|^Sitemap: https://.*|Sitemap: ${BASE_URL}/sitemap.xml|g" "$ROBOTS_FILE"
else
  sed -i '' -E "s|^Sitemap: https://.*|Sitemap: ${BASE_URL}/sitemap.xml|g" "$ROBOTS_FILE"
fi

echo "robots.txt updated"
echo ""

WEBMANIFEST_FILE="../public/site.webmanifest"

echo "Updating site.webmanifest..."

HOST_NO_WWW="${HOST#www.}"

IFS='.' read -ra PARTS <<< "$HOST_NO_WWW"
COUNT=${#PARTS[@]}

if [[ $COUNT -eq 2 ]]; then
  SECOND_LEVEL="${PARTS[0]}"
  ID_VALUE="com.${SECOND_LEVEL}.app"
else
  SECOND_LEVEL_INDEX=$((COUNT-2))
  SECOND_LEVEL="${PARTS[$SECOND_LEVEL_INDEX]}"
  SUBDOMAIN_PART="${PARTS[0]}"
  ID_VALUE="com.${SECOND_LEVEL}.${SUBDOMAIN_PART}"
fi

SCOPE_URL="${BASE_URL}/"

if sed --version >/dev/null 2>&1; then
  sed -i -E "s|^[[:space:]]*\"id\"[[:space:]]*:[[:space:]]*\"[^\"]*\"|  \"id\": \"${ID_VALUE}\"|g" "$WEBMANIFEST_FILE"
  sed -i -E "s|^[[:space:]]*\"description\"[[:space:]]*:[[:space:]]*\"[^\"]*\"|  \"description\": \"${PROFILE_NAME}\"|g" "$WEBMANIFEST_FILE"
  sed -i -E "s|^[[:space:]]*\"scope\"[[:space:]]*:[[:space:]]*\"[^\"]*\"|  \"scope\": \"${SCOPE_URL}\"|g" "$WEBMANIFEST_FILE"
else
  sed -i '' -E "s|^[[:space:]]*\"id\"[[:space:]]*:[[:space:]]*\"[^\"]*\"|  \"id\": \"${ID_VALUE}\"|g" "$WEBMANIFEST_FILE"
  sed -i '' -E "s|^[[:space:]]*\"description\"[[:space:]]*:[[:space:]]*\"[^\"]*\"|  \"description\": \"${PROFILE_NAME}\"|g" "$WEBMANIFEST_FILE"
  sed -i '' -E "s|^[[:space:]]*\"scope\"[[:space:]]*:[[:space:]]*\"[^\"]*\"|  \"scope\": \"${SCOPE_URL}\"|g" "$WEBMANIFEST_FILE"
fi

echo "webmanifest updated: ${ID_VALUE}"
echo ""

echo "Starting logo conversion..."
echo ""

./svgToPng.sh ../public/logo.svg && ./resizeImage.sh ../public/logo.png ;

echo ""
echo "Logo successfully processed."
echo "Bootstrap completed."
echo "---------------------------------------------"