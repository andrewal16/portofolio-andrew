#!/bin/bash
echo "=== Starting Laravel Setup ==="

# ── Backup & Update Nginx Config ─────────────────────────────────────────
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 8080;
    listen [::]:8080;
    root /home/site/wwwroot/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# ── Permission ────────────────────────────────────────────────────────────
chmod -R 775 /home/site/wwwroot/storage
chmod -R 775 /home/site/wwwroot/bootstrap/cache

# ── Laravel Commands ──────────────────────────────────────────────────────
cd /home/site/wwwroot

php artisan storage:link --force   # ← kamu lupa ini juga!
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# ── Restart Nginx ─────────────────────────────────────────────────────────
echo "=== Restarting Nginx ==="
service nginx restart              # ← INI YANG PALING PENTING, hilang sebelumnya!

echo "=== Setup Complete ==="
