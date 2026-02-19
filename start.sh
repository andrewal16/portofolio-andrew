#!/bin/bash
# Handle error manual, jangan pakai set -e

echo "==========================================="
echo "🚀 Starting Laravel Deployment Setup v2..."
echo "==========================================="

cd /home/site/wwwroot || exit 1

# ============================================================================
# 1. CLEANUP OLD NGINX CONFIGS (dari percobaan sebelumnya)
# ============================================================================
rm -f /home/site/nginx/default.conf 2>/dev/null
rm -rf /home/site/nginx 2>/dev/null
echo "✅ Old nginx configs cleaned"

# ============================================================================
# 2. CONFIGURE NGINX — write to /home/site/default
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

# Debug: verify file content
echo "--- Nginx root verification ---"
grep "root " /home/site/default
echo "--- End verification ---"

# Reload nginx
nginx -s reload 2>/dev/null && echo "✅ Nginx reloaded" || echo "⚠️ Nginx reload skipped (will pick up on start)"

# ============================================================================
# 3. PERMISSIONS
# ============================================================================
mkdir -p storage/framework/{sessions,views,cache/data}
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "✅ Permissions set"

# ============================================================================
# 4. STORAGE LINK
# ============================================================================
if [ ! -L public/storage ]; then
    php artisan storage:link --force 2>/dev/null || true
    echo "✅ Storage linked"
fi

# ============================================================================
# 5. GENERATE .env — TANPA DB_URL (penyebab error array_diff_key)
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

echo "✅ .env generated (DB_URL excluded intentionally)"

# ============================================================================
# 6. LARAVEL OPTIMIZATIONS
# ============================================================================
echo "⚡ Running Laravel optimizations..."
php artisan config:clear 2>&1
php artisan config:cache 2>&1 && echo "✅ Config cached" || echo "⚠️ Config cache failed"
php artisan route:cache 2>&1 && echo "✅ Routes cached" || echo "⚠️ Route cache failed"
php artisan view:cache 2>&1 && echo "✅ Views cached" || echo "⚠️ View cache failed"

# ============================================================================
# 7. DATABASE MIGRATIONS
# ============================================================================
echo "🗃️ Testing database connection..."
php artisan db:monitor 2>&1 || echo "⚠️ DB monitor not available"

echo "🗃️ Running migrations..."
php artisan migrate --force 2>&1 && echo "✅ Migrations done" || echo "⚠️ Migration failed"

echo "==========================================="
echo "🎉 Laravel ready! Nginx root → /home/site/wwwroot/public"
echo "==========================================="
