#!/bin/bash
# Handle error manual, jangan pakai set -e

echo "==========================================="
echo "🚀 Starting Laravel Deployment Setup..."
echo "==========================================="

cd /home/site/wwwroot || exit 1

# ============================================================================
# 1. CONFIGURE NGINX — CRITICAL FIX
# ============================================================================
# Azure PHP Linux container reads custom config from /home/site/default
# NOT from /home/site/nginx/default.conf
# ============================================================================
cat > /home/site/default << 'NGINXEOF'
server {
    listen 8080 default_server;
    listen [::]:8080 default_server;

    root /home/site/wwwroot/public;
    index index.php index.html;

    server_name _;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
NGINXEOF

echo "✅ Nginx config written to /home/site/default"

# Reload nginx (mungkin belum jalan saat startup, tapi kita coba)
nginx -s reload 2>/dev/null && echo "✅ Nginx reloaded" || echo "⚠️ Nginx reload skipped (will pick up config on start)"

# ============================================================================
# 2. PERMISSIONS
# ============================================================================
mkdir -p storage/framework/{sessions,views,cache/data}
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "✅ Permissions set"

# ============================================================================
# 3. STORAGE LINK
# ============================================================================
if [ ! -L public/storage ]; then
    php artisan storage:link --force 2>/dev/null || true
    echo "✅ Storage linked"
fi

# ============================================================================
# 4. GENERATE .env DARI AZURE APP SETTINGS (jika belum ada)
# ============================================================================
# Selalu regenerate .env dari Azure env vars untuk memastikan sync
# Azure App Settings = source of truth
# ============================================================================
echo "📝 Generating .env from Azure environment variables..."
cat > .env << ENVEOF
APP_NAME="${APP_NAME:-Laravel}"
APP_ENV="${APP_ENV:-production}"
APP_KEY="${APP_KEY}"
APP_DEBUG=${APP_DEBUG:-false}
APP_URL="${APP_URL:-https://portofolio-andrew.azurewebsites.net}"

LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION="${DB_CONNECTION:-pgsql}"
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE}"
DB_USERNAME="${DB_USERNAME}"
DB_PASSWORD="${DB_PASSWORD}"
DB_SSLMODE="${DB_SSLMODE:-require}"
DB_URL="${DB_URL}"

FILESYSTEM_DISK="${FILESYSTEM_DISK:-local}"

CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}"
CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY}"
CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET}"

MAIL_MAILER="${MAIL_MAILER:-smtp}"
MAIL_HOST="${MAIL_HOST}"
MAIL_PORT="${MAIL_PORT:-587}"
MAIL_USERNAME="${MAIL_USERNAME}"
MAIL_PASSWORD="${MAIL_PASSWORD}"
MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS}"
MAIL_FROM_NAME="${MAIL_FROM_NAME:-Laravel}"

SESSION_DRIVER="${SESSION_DRIVER:-file}"
CACHE_STORE="${CACHE_STORE:-file}"
QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"

VITE_TINYMCE_API_KEY="${VITE_TINYMCE_API_KEY}"
ENVEOF

echo "✅ .env generated from Azure environment"

# ============================================================================
# 5. LARAVEL OPTIMIZATIONS
# ============================================================================
echo "⚡ Running Laravel optimizations..."
php artisan config:cache 2>&1 && echo "✅ Config cached" || echo "⚠️ Config cache failed"
php artisan route:cache 2>&1 && echo "✅ Routes cached" || echo "⚠️ Route cache failed"
php artisan view:cache 2>&1 && echo "✅ Views cached" || echo "⚠️ View cache failed"

# ============================================================================
# 6. DATABASE MIGRATIONS
# ============================================================================
echo "🗃️ Running migrations..."
php artisan migrate --force 2>&1 && echo "✅ Migrations done" || echo "⚠️ Migration failed (check DB connection)"

echo "==========================================="
echo "🎉 Laravel ready! Nginx root → /home/site/wwwroot/public"
echo "==========================================="
