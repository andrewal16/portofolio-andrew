#!/bin/bash

echo "Configuring Apache..."
sed -i 's|/home/site/wwwroot|/home/site/wwwroot/public|g' /etc/apache2/sites-enabled/000-default.conf

chmod -R 775 /home/site/wwwroot/storage
chmod -R 775 /home/site/wwwroot/bootstrap/cache

cd /home/site/wwwroot
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

apache2ctl start
```

### Step 2 — Pastikan file masuk ke dalam ZIP deployment

Cek di workflow anda, pastikan `startup.sh` **tidak terexclude** saat `zip`. Workflow anda saat ini sudah aman karena hanya exclude `*.git*`, `node_modules/*`, `tests/*`, dan `storage/logs/*`.

### Step 3 — Di Azure, Startup Command isi dengan:
```
bash /home/site/wwwroot/startup.sh
```

> ⚠️ Gunakan `bash /home/site/wwwroot/startup.sh` bukan hanya path-nya saja, agar lebih aman dan tidak perlu khawatir soal executable permission.

### Step 4 — Ubah CACHE_STORE di App Settings
```
CACHE_STORE = file
