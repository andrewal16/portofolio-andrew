#!/bin/bash
set -e

echo "🚀 Starting Laravel setup..."

cd /home/site/wwwroot

# ============================================================================
# 1. CONFIGURE NGINX — Point to /public, port 8080
# ============================================================================
cat > /etc/nginx/sites-available/default << 'EOF'
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
        fastcgi_pass unix:/run/php/php-fpm.sock;
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
EOF

echo "✅ Nginx config updated"

# ============================================================================
# 2. PERMISSIONS
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
# 3. LARAVEL OPTIMIZATIONS
# ============================================================================
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✅ Cache built"

php artisan migrate --force 2>&1 || echo "⚠️ Migration failed - check DB connection"
echo "✅ Migrations step done"

# ============================================================================
# 4. RELOAD NGINX (Azure starts it before this script)
# ============================================================================
nginx -s reload 2>/dev/null || true
echo "✅ Nginx reloaded with new config"

echo "🎉 Laravel ready!"