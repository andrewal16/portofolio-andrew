#!/bin/bash
set -e

echo "========================================="
echo "🚀 Starting Laravel Deployment Setup..."
echo "========================================="

cd /home/site/wwwroot

# ============================================================================
# 1. DETECT WEB SERVER (Apache or Nginx)
# ============================================================================
if command -v nginx &> /dev/null; then
    echo "🔍 Detected: Nginx"

    # Create Nginx config pointing to /public
    cat > /etc/nginx/sites-available/default << 'NGINX_CONF'
server {
    listen 8080 default_server;
    listen [::]:8080 default_server;

    root /home/site/wwwroot/public;
    index index.php index.html;

    server_name _;

    # Handle Laravel routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM (Azure uses 127.0.0.1:9000, fallback to unix socket)
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    # Block .env and dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
NGINX_CONF

    # Start PHP-FPM if not running
    if ! pgrep php-fpm > /dev/null; then
        # Try common PHP-FPM paths on Azure
        if command -v php-fpm8.2 &> /dev/null; then
            php-fpm8.2 -D
        elif command -v php-fpm &> /dev/null; then
            php-fpm -D
        fi
        sleep 2
        echo "✅ PHP-FPM started"
    else
        echo "✅ PHP-FPM already running"
    fi

    # Test and reload Nginx
    nginx -t
    if nginx -s reload 2>/dev/null; then
        echo "✅ Nginx reloaded"
    else
        nginx
        echo "✅ Nginx started fresh"
    fi

elif command -v apache2 &> /dev/null; then
    echo "🔍 Detected: Apache"

    # Point document root to /public
    sed -i 's|/home/site/wwwroot|/home/site/wwwroot/public|g' /etc/apache2/sites-available/000-default.conf

    # Enable mod_rewrite
    a2enmod rewrite

    # Allow .htaccess overrides
    cat > /etc/apache2/conf-available/laravel.conf << 'APACHE_CONF'
<Directory /home/site/wwwroot/public>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
APACHE_CONF

    a2enconf laravel
    apache2ctl restart
    echo "✅ Apache configured and restarted"

else
    echo "❌ No web server detected!"
    exit 1
fi

# ============================================================================
# 2. SET PERMISSIONS
# ============================================================================
echo "🔒 Setting permissions..."

mkdir -p storage/framework/{sessions,views,cache/data}
mkdir -p storage/logs
mkdir -p bootstrap/cache

chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Storage link
if [ ! -L public/storage ]; then
    php artisan storage:link --force 2>/dev/null || true
    echo "✅ Storage link created"
fi

echo "✅ Permissions set"

# ============================================================================
# 3. CACHE & MIGRATE
# ============================================================================
echo "⚡ Caching config..."

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Cache built"

echo "🗃️ Running migrations..."
php artisan migrate --force

echo "========================================="
echo "✅ Laravel app is ready!"
echo "========================================="