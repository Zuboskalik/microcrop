# MicroCrop

Веб-сервис онлайн-кроппинга и кадрирования видео, работающий полностью в браузере (FFmpeg.wasm) — без загрузки файлов на сервер.

Документация:
- [SPECIFICATION.md](SPECIFICATION.md) — продуктовая спецификация
- [ARCHITECTURE.md](ARCHITECTURE.md) — техническая архитектура
- [TASKS.md](TASKS.md) — чек-лист задач реализации

## Стек

- Backend: Laravel 11 (PHP 8.2+)
- Database: MySQL 8.0
- Frontend: React 18 + Vite (SPA внутри Blade SEO-обёртки)
- Processing: `@ffmpeg/ffmpeg` (FFmpeg.wasm)
- Payments: Robokassa
- Ads: Яндекс РСЯ

## Локальный запуск

1. Установите зависимости:

   ```bash
   composer install
   npm install
   ```

2. Скопируйте `.env.example` в `.env` (если файла `.env` ещё нет) и укажите свои значения. Локальная БД по умолчанию:

   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=microcrop
   DB_USERNAME=mysql
   DB_PASSWORD=mysql
   ```

   Создайте БД `microcrop` в MySQL 8.0, если её ещё нет:

   ```sql
   CREATE DATABASE microcrop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Сгенерируйте ключ приложения (если не сгенерирован) и накатите миграции:

   ```bash
   php artisan key:generate
   php artisan migrate
   ```

4. Запустите dev-серверы (Laravel + Vite):

   ```bash
   php artisan serve
   npm run dev
   ```

   Приложение будет доступно на `http://localhost:8000`.

### Node.js

Требуется Node.js 18.x (или 20+). При использовании Node 16 добавьте флаг `--openssl-legacy-provider` к скриптам сборки.

### FFmpeg.wasm и SharedArrayBuffer

Для многопоточного режима FFmpeg.wasm браузеру нужны заголовки `Cross-Origin-Opener-Policy: same-origin` и `Cross-Origin-Embedder-Policy: require-corp`. Они уже выставляются middleware `App\Http\Middleware\CrossOriginIsolationHeaders` (Laravel) и настройками dev-сервера Vite (`vite.config.js`).
