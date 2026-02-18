#!/bin/bash

# Set document root ke /public folder
echo "Configuring Apache..."
sed -i 's|/home/site/wwwroot|/home/site/wwwroot/public|g' /etc/apache2/sites-enabled/000-default.conf

# Set permissions
chmod -R 775 /home/site/wwwroot/storage
chmod -R 775 /home/site/wwwroot/bootstrap/cache

# Run Laravel setup
cd /home/site/wwwroot
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Start Apache
apache2ctl start
```

Lalu di Azure **Configuration → General Settings → Startup Command**, isi:
```
/home/site/wwwroot/startup.sh
