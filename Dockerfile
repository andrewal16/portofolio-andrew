# ============================================================
# Stage 1: Build frontend assets (Node.js)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --include=optional

# Copy source files needed for build
COPY resources ./resources
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY public ./public

# Build frontend assets
RUN npm run build

# ============================================================
# Stage 2: PHP Application
# ============================================================
FROM php:8.2-fpm-alpine AS app

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        bcmath \
        gd \
        intl \
        opcache \
        pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for caching
COPY composer.json composer.lock ./

# Install PHP dependencies (no dev)
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# Copy entire application
COPY . .

# Re-run composer scripts after full copy
RUN composer dump-autoload --optimize

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/public/build ./public/build

# ============================================================
# Nginx config
# ============================================================
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# ============================================================
# Supervisor config
# ============================================================
COPY docker/supervisord.conf /etc/supervisord.conf

# ============================================================
# PHP production config
# ============================================================
COPY docker/php.ini /usr/local/etc/php/conf.d/99-production.ini

# ============================================================
# Entrypoint script
# ============================================================
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Create nginx pid directory
RUN mkdir -p /run/nginx

# Expose port (Render uses $PORT, default 10000)
EXPOSE 10000

ENTRYPOINT ["/entrypoint.sh"]