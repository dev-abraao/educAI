#!/usr/bin/env bash
set -e

cd /app

git config --global --add safe.directory /app

if [ ! -f .env ]; then
    echo "==> Criando .env a partir do .env.example"
    cp .env.example .env
fi

if [ ! -d vendor ] || [ ! -f vendor/autoload.php ]; then
    echo "==> Instalando dependências PHP (composer install)"
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
    echo "==> Gerando APP_KEY"
    php artisan key:generate --force
fi

echo "==> Aguardando PostgreSQL em ${DB_HOST}:${DB_PORT}"
until php -r "exit(@fsockopen(getenv('DB_HOST'), (int)getenv('DB_PORT')) ? 0 : 1);" 2>/dev/null; do
    sleep 1
done
echo "==> PostgreSQL disponível"

echo "==> Rodando migrations"
php artisan migrate --force --seed || true


case "$1" in
    serve)
        echo "==> Iniciando servidor Laravel + Vite"
        npx concurrently -k -n laravel,vite -c "blue,magenta" \
            "php artisan serve --host=0.0.0.0 --port=8000" \
            "npm run dev -- --host=0.0.0.0"
        ;;
    queue)
        exec php artisan queue:listen --tries=1 --timeout=0
        ;;
    bash|sh)
        exec bash
        ;;
    *)
        exec "$@"
        ;;
esac
