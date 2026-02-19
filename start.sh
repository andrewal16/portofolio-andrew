#!/bin/bash

echo "==========================================="
echo "🚀 Starting Laravel Deployment Setup..."
echo "==========================================="

cd /home/site/wwwroot || exit 1

# ============================================================================
# 1. CUSTOM NGINX CONFIG
# ============================================================================
# PENTING: Azure App Service PHP Linux membaca custom nginx config dari
# /home/site/default (BUKAN /home/site/nginx/default.conf)
# ============================================================================

cat > /home/site/default << 'NGINXEOF'
server {
    listen 8080 default_server;
    listen [::]:8080 default_server;

    # KUNCI: document root harus mengarah ke folder public Laravel
    root /home/site/wwwroot/public;
    index index.php index.html;

    server_name _;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    charset utf-8;

    # Semua request yang bukan file/folder → diarahkan ke index.php (Laravel)
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    # PHP-FPM handler
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    # Block dotfiles (kecuali .well-known)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets (Vite build output)
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

    # Increase max upload size
    client_max_body_size 20M;
}
NGINXEOF

echo "✅ Nginx config written to /home/site/default"

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
# 4. LARAVEL OPTIMIZATIONS
# ============================================================================
php artisan config:cache 2>&1 && echo "✅ Config cached" || echo "⚠️ Config cache failed"
php artisan route:cache 2>&1 && echo "✅ Routes cached" || echo "⚠️ Route cache failed"
php artisan view:cache 2>&1 && echo "✅ Views cached" || echo "⚠️ View cache failed"

# ============================================================================
# 5. DATABASE MIGRATIONS
# ============================================================================
echo "🗃️ Running migrations..."
php artisan migrate --force 2>&1 || echo "⚠️ Migration failed (mungkin sudah up-to-date)"

echo "==========================================="
echo "🎉 Laravel ready!"
echo "==========================================="
