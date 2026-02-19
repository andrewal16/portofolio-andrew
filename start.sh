#!/bin/bash

echo "==========================================="
echo "🚀 Starting Laravel Deployment Setup..."
echo "==========================================="

cd /home/site/wwwroot || exit 1

# ============================================================================
# 1. CUSTOM NGINX CONFIG
# ============================================================================
# Azure App Service PHP Linux: custom nginx config di /home/site/default
# Nginx sudah jalan SEBELUM script ini, jadi HARUS reload setelah tulis config
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
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location /build/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    client_max_body_size 20M;
}
NGINXEOF

echo "✅ Nginx config written to /home/site/default"

# KRITIS: Reload nginx karena dia sudah jalan sebelum script ini
sleep 1
nginx -s reload 2>&1 && echo "✅ Nginx reloaded with custom config" || echo "⚠️ Nginx reload failed"

# Verifikasi root sudah benar
echo "--- Nginx root check ---"
nginx -T 2>&1 | grep "root " | head -3
echo "---"

# ============================================================================
# 2. PERMISSIONS
# ============================================================================
mkdir -p storage/framework/{sessions,views,cache/data}
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "✅ Permissions set"

# ============================================================================
# 3. STORAGE SYMLINK
# ============================================================================
if [ ! -L public/storage ]; then
    php artisan storage:link --force 2>/dev/null || true
    echo "✅ Storage linked"
else
    echo "✅ Storage symlink already exists"
fi

# ============================================================================
# 4. FIX DATABASE: Unset DB_URL
# ============================================================================
# Neon DB URL mengandung "options=endpoint=..." yang crash di Laravel.
# Laravel akan fallback ke individual vars: DB_HOST, DB_PORT, DB_DATABASE, dll
# yang sudah di-set di Azure App Settings.
# ============================================================================
if [ -n "$DB_URL" ]; then
    echo "⚠️ DB_URL detected - unsetting to prevent Laravel options parsing error"
    unset DB_URL
fi

# ============================================================================
# 5. LARAVEL OPTIMIZATIONS
# ============================================================================
php artisan config:cache 2>&1 && echo "✅ Config cached" || echo "⚠️ Config cache failed"
php artisan route:cache 2>&1 && echo "✅ Routes cached" || echo "⚠️ Route cache failed"
php artisan view:cache 2>&1 && echo "✅ Views cached" || echo "⚠️ View cache failed"

# ============================================================================
# 6. DATABASE MIGRATIONS
# ============================================================================
echo "🗃️ Running migrations..."
php artisan migrate --force 2>&1 && echo "✅ Migrations complete" || echo "⚠️ Migration failed"

echo "==========================================="
echo "🎉 Laravel ready!"
echo "==========================================="
