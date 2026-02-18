#!/bin/bash
# JANGAN pakai set -e, handle error manual

echo "==========================================="
echo "🚀 Starting Laravel Deployment Setup..."
echo "==========================================="

cd /home/site/wwwroot

# ============================================================================
# 1. CONFIGURE NGINX
# ============================================================================
mkdir -p /home/site/nginx

cat > /home/site/nginx/default.conf << 'NGINXEOF'
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

echo "✅ Nginx config updated"

# ============================================================================
# 2. RELOAD NGINX SEGERA (jangan tunggu akhir script)
# ============================================================================
nginx -s reload 2>/dev/null && echo "✅ Nginx reloaded" || echo "⚠️ Nginx reload failed"

# ============================================================================
# 3. PERMISSIONS
# ============================================================================
mkdir -p storage/framework/{sessions,views,cache/data}
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

if [ ! -L public/storage ]; then
    php artisan storage:link --force 2>/dev/null || true
fi

echo "✅ Permissions set"

# ============================================================================
# 4. GENERATE .env DARI AZURE APP SETTINGS (jika belum ada)
# ============================================================================
if [ ! -f .env ]; then
    echo "⚠️ No .env found, creating from Azure env vars..."
    cat > .env << ENVEOF
APP_NAME="${APP_NAME:-Laravel}"
APP_ENV="${APP_ENV:-production}"
APP_KEY="${APP_KEY}"
APP_DEBUG=${APP_DEBUG:-false}
APP_URL="${APP_URL:-https://portofolio-andrew.azurewebsites.net}"

DB_CONNECTION="${DB_CONNECTION:-pgsql}"
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE}"
DB_USERNAME="${DB_USERNAME}"
DB_PASSWORD="${DB_PASSWORD}"

SESSION_DRIVER="${SESSION_DRIVER:-file}"
CACHE_STORE="${CACHE_STORE:-file}"
QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"
ENVEOF
    echo "✅ .env created from Azure environment"
fi

# ============================================================================
# 5. LARAVEL OPTIMIZATIONS (dengan error handling)
# ============================================================================
php artisan config:cache 2>&1 && echo "✅ Config cached" || echo "⚠️ Config cache failed"
php artisan route:cache 2>&1 && echo "✅ Routes cached" || echo "⚠️ Route cache failed"
php artisan view:cache 2>&1 && echo "✅ Views cached" || echo "⚠️ View cache failed"

# ============================================================================
# 6. DATABASE MIGRATIONS
# ============================================================================
echo "🗃️ Running migrations..."
php artisan migrate --force 2>&1 || echo "⚠️ Migration failed"

echo "==========================================="
echo "🎉 Laravel ready!"
echo "==========================================="