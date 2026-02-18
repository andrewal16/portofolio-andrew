#!/bin/bash
set -e

echo "========================================="
echo "🚀 Starting Laravel Deployment Setup..."
echo "========================================="

# ============================================================================
# 1. CONFIGURE APACHE — Point document root to /public
# ============================================================================
echo "📁 Configuring Apache document root..."

# Update Apache to serve from /home/site/wwwroot/public
sed -i 's|/home/site/wwwroot|/home/site/wwwroot/public|g' /etc/apache2/sites-available/000-default.conf

# Enable mod_rewrite for Laravel routing
a2enmod rewrite

# Allow .htaccess overrides (required for Laravel routing)
cat > /etc/apache2/conf-available/laravel.conf << 'EOF'
<Directory /home/site/wwwroot/public>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
EOF

a2enconf laravel

echo "✅ Apache configured successfully"

# ============================================================================
# 2. SET PERMISSIONS
# ============================================================================
echo "🔒 Setting file permissions..."

cd /home/site/wwwroot

# Storage & cache directories need to be writable
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Create storage link if not exists
if [ ! -L public/storage ]; then
    php artisan storage:link --force
    echo "✅ Storage link created"
fi

echo "✅ Permissions set"

# ============================================================================
# 3. CACHE CONFIGURATION (Production optimizations)
# ============================================================================
echo "⚡ Caching configuration for production..."

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Cache built"

# ============================================================================
# 4. RUN MIGRATIONS
# ============================================================================
echo "🗃️ Running database migrations..."

php artisan migrate --force

echo "✅ Migrations complete"

# ============================================================================
# 5. RESTART APACHE
# ============================================================================
echo "🔄 Restarting Apache..."

apache2ctl restart

echo "========================================="
echo "✅ Laravel app is ready!"
echo "========================================="
