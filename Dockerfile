FROM php:8.3-cli-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        ca-certificates \
        gnupg \
        unzip \
        zip \
        procps \
        libpq-dev \
        libsqlite3-dev \
        libcurl4-openssl-dev \
        libxml2-dev \
        libzip-dev \
        libonig-dev \
        libicu-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        pkg-config \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo \
        pdo_pgsql \
        pdo_sqlite \
        pgsql \
        curl \
        xml \
        dom \
        zip \
        mbstring \
        intl \
        gd \
        bcmath \
        opcache \
        pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest

WORKDIR /app

COPY . .

RUN npm install

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000 5173

ENTRYPOINT ["entrypoint.sh"]
CMD ["serve"]
