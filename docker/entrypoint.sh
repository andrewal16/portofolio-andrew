#!/bin/sh
set -e

echo "=========================================="
echo "🚀 Starting Laravel Deployment..."
echo "=========================================="

cd /var/www/html

# ------------------------------------------------
# 1. Ensure storage directories exist
# ------------------------------------------------
echo "📁 Creating storage directories..."
mkdir -p storage/logs \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# ------------------------------------------------
# 2. Handle Render's dynamic PORT
# ------------------------------------------------
PORT="${PORT:-10000}"
echo "🌐 Configuring Nginx on port $PORT..."
sed -i "s/listen 10000/listen $PORT/" /etc/nginx/http.d/default.conf

# ------------------------------------------------
# 3. Run Laravel optimizations
# ------------------------------------------------
echo "⚡ Caching Laravel config..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# ------------------------------------------------
# 4. Run database migrations
# ------------------------------------------------
echo "🗄️  Running database migrations..."
php artisan migrate --force --no-interaction

# ------------------------------------------------
# 5. Create storage link
# ------------------------------------------------
echo "🔗 Creating storage link..."
php artisan storage:link --force 2>/dev/null || true

# ------------------------------------------------
# 6. Start Supervisor (Nginx + PHP-FPM + Queue)
# ------------------------------------------------
echo "=========================================="
echo "✅ Laravel ready! Starting services..."
echo "=========================================="

exec /usr/bin/supervisord -c /etc/supervisord.conf