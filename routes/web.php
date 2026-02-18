#!/bin/bash

echo "=== Starting Laravel Setup ==="

# Configure nginx document root to /public
mkdir -p /home/site/nginx
cat > /home/site/nginx/default.conf << 'EOF'
server {
    listen 8080;
    root /home/site/wwwroot/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
EOF

# Set permissions
chmod -R 775 /home/site/wwwroot/storage
chmod -R 775 /home/site/wwwroot/bootstrap/cache

# Laravel setup
cd /home/site/wwwroot
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

echo "=== Setup Complete ==="
