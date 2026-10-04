# MicroCrop

**MicroCrop** — веб-сервис онлайн-кадрирования и обрезки видео, вся обработка которого происходит **на стороне клиента**, прямо в браузере пользователя. Видеофайл никогда не загружается на сервер: кадрирование, обрезка по времени, масштабирование и наложение водяного знака выполняются через **FFmpeg.wasm**, что делает сервис быстрым, приватным и практически бесплатным в эксплуатации.

Подробности продукта и архитектуры — в [SPECIFICATION.md](SPECIFICATION.md) и [ARCHITECTURE.md](ARCHITECTURE.md). Чек-лист реализации — в [TASKS.md](TASKS.md).

## Стек технологий

| Слой | Технологии |
|---|---|
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend | React 18 + Vite, Tailwind CSS (SPA внутри Blade SEO-обёртки) |
| Видеообработка | `@ffmpeg/ffmpeg` (FFmpeg.wasm), выполняется в браузере пользователя |
| База данных | MySQL 8.0 |
| Платежи | Robokassa (для самозанятых, НПД) |
| Монетизация | Рекламная сеть Яндекса (РСЯ) |

---

## Системные требования

- **PHP** >= 8.2, с расширениями: `pdo`, `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo` (стандартный набор для Laravel 11)
- **Composer** >= 2.x
- **Node.js** >= 18.x (совместим и с 20+) и npm
- **MySQL** 8.0
- Нативный **FFmpeg** не требуется — вся видеообработка происходит в браузере через FFmpeg.wasm

---

## Локальное развёртывание

### 1. Клонирование репозитория

```bash
git clone <repository-url> && cd microcrop
```

### 2. Установка зависимостей

```bash
composer install
npm install
```

> При установке npm-зависимостей автоматически сработает хук `postinstall` (`scripts/copy-ffmpeg-core.mjs`), который скопирует core-файлы FFmpeg.wasm (`@ffmpeg/core`) в `public/ffmpeg/core/`. Эти файлы не хранятся в git (см. `.gitignore`) — они воспроизводимы из npm-зависимости при каждой установке.

### 3. Настройка окружения

Скопируйте файл окружения и сгенерируйте ключ приложения:

```bash
cp .env.example .env
php artisan key:generate
```

Откройте `.env` и укажите параметры подключения к локальной базе данных:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=microcrop
DB_USERNAME=mysql
DB_PASSWORD=mysql
```

Настройте ключи Robokassa (см. [ARCHITECTURE.md §6](ARCHITECTURE.md)) — для локальной разработки достаточно тестовых значений с `IsTest=1`, реальные логин/пароли выдаются в личном кабинете Robokassa:

```env
ROBOKASSA_MERCHANT_LOGIN=microcrop_test
ROBOKASSA_PASSWORD1=test_password1
ROBOKASSA_PASSWORD2=test_password2
ROBOKASSA_IS_TEST=true
```

Настройте ID рекламных блоков РСЯ (см. [ARCHITECTURE.md §5](ARCHITECTURE.md)) — необязательно для локальной разработки: если оставить пустыми, компонент `YandexAdBlock` покажет аккуратную заглушку вместо баннера:

```env
VITE_YANDEX_AD_BLOCK_HEADER=
VITE_YANDEX_AD_BLOCK_SIDEBAR=
VITE_YANDEX_AD_BLOCK_RENDER=
```

> Полный список переменных окружения с комментариями — в файле [.env.example](.env.example).

### 4. Подготовка базы данных

Создайте базу данных `microcrop` в MySQL 8.0, если её ещё нет:

```sql
CREATE DATABASE microcrop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Запустите миграции:

```bash
php artisan migrate
```

Миграции создадут таблицы `users`, `cache`, `jobs` (стандартные для Laravel), а также прикладные таблицы `orders` и `access_tokens` (заказы Robokassa и выданные PRO-токены — см. [ARCHITECTURE.md §3](ARCHITECTURE.md)).

Сидеры (`php artisan db:seed`) в проекте не предусмотрены — сервис работает по гостевой модели без обязательной регистрации пользователей, наполнять базу тестовыми данными не требуется.

---

## Запуск в режиме разработки

Понадобятся два параллельных процесса — Laravel-сервер и Vite dev-сервер:

```bash
php artisan serve
```

Приложение будет доступно на **http://127.0.0.1:8000**.

```bash
npm run dev
```

Vite поднимет dev-сервер с горячей перезагрузкой (по умолчанию на `http://127.0.0.1:5173`) и автоматически подключится к странице через директиву `@vite()` в Blade-шаблонах.

### ⚠️ Важно: заголовки COOP/COEP и FFmpeg.wasm

Для работы `SharedArrayBuffer` (задел на будущий многопоточный режим FFmpeg.wasm) приложение выставляет заголовки:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: credentialless`

Это делают:
- middleware [`CrossOriginIsolationHeaders`](app/Http/Middleware/CrossOriginIsolationHeaders.php) — для всех ответов Laravel (web и api);
- секция `server.headers` в [`vite.config.js`](vite.config.js) — для ответов Vite dev-сервера.

Сейчас видео обрабатывается однопоточной сборкой `@ffmpeg/core`, которой `SharedArrayBuffer` не требуется, поэтому используется режим `credentialless`, а не строгий `require-corp`: он сохраняет cross-origin isolation, но не блокирует загрузку сторонних скриптов (например, РСЯ) без заголовка `Cross-Origin-Resource-Policy`.

**Важно про `php artisan serve`:** встроенный PHP-сервер отдаёт уже существующие статические файлы (например, `public/build/*`, `public/ffmpeg/*`) напрямую, в обход Laravel и его middleware — поэтому такие ответы НЕ будут содержать эти заголовки при локальном запуске через `php artisan serve` напрямую. Сам FFmpeg.wasm при этом продолжает работать (используются `Blob URL`, не подверженные этому ограничению), но если понадобится точная проверка заголовков на статике — либо используйте `npm run dev` (Vite отдаёт JS/CSS сам, с нужными заголовками), либо настройте полноценный веб-сервер (nginx/Apache) с явным проставлением этих заголовков для всех ответов, как это будет сделано в продакшене.

---

## Тестирование

Backend покрыт Unit- и Feature-тестами (сервис Robokassa, API платежей и PRO-токенов):

```bash
php artisan test
```

или напрямую через PHPUnit:

```bash
./vendor/bin/phpunit
```

На момент написания набор включает 20 тестов (`Tests\Unit\RobokassaServiceTest`, `Tests\Feature\PaymentsApiTest`, `Tests\Feature\TokensApiTest` и др.) и использует отдельную in-memory SQLite-базу для тестового окружения (см. `phpunit.xml`) — реальная MySQL-база разработки не затрагивается.

---

## Архитектура и основные возможности

Кратко (подробности — в [ARCHITECTURE.md](ARCHITECTURE.md)):

- **Локальный рендеринг видео.** Весь пайплайн — загрузка файла, кадрирование (drag-and-drop рамка с пресетами 16:9/9:16/1:1/Free и точный ввод размеров/отступов), обрезка по времени, масштабирование — выполняется в браузере через `@ffmpeg/ffmpeg`. Файл пользователя никогда не покидает его устройство.
- **Водяной знак на бесплатном тарифе.** Полупрозрачная надпись «microcrop» накладывается в правом нижнем углу экспортируемого видео через FFmpeg-фильтр `drawtext` (см. [ffmpegPipeline.js](resources/js/lib/ffmpegPipeline.js)) — если у пользователя нет действующего PRO-токена.
- **Оплата PRO-доступа через Robokassa.** Разовый платёж снимает водяной знак и отключает рекламу. Backend ([RobokassaService](app/Services/RobokassaService.php), [PaymentsController](app/Http/Controllers/Api/PaymentsController.php)) формирует ссылку на оплату, принимает и проверяет подпись ResultURL-callback'а, выдаёт PRO-токен; на клиенте хранится только сам токен, на сервере — лишь его sha256-хэш.
- **Рекламные блоки РСЯ.** Компонент [`YandexAdBlock`](resources/js/components/YandexAdBlock.jsx) размещается в шапке, боковой панели и на экране рендеринга; при блокировке рекламы (AdBlock) или отсутствии настроенного ID блока аккуратно скрывается в fallback-заглушку, не ломая интерфейс.
- **SEO-оптимизация.** Набор посадочных страниц под частотные запросы (`/crop-for-reels`, `/trim-video`, `/circle-video-telegram` и др.) с уникальными мета-тегами, Open Graph, JSON-LD (`SoftwareApplication`, `FAQPage`) и автогенерацией `sitemap.xml`/`robots.txt` (см. [config/landings.php](config/landings.php), [SitemapController](app/Http/Controllers/SitemapController.php)).

---

## Структура проекта (ключевые каталоги)

```
app/
├─ Http/Controllers/Api/     # PaymentsController, TokensController
├─ Http/Controllers/         # LandingController, SitemapController
├─ Http/Middleware/          # CrossOriginIsolationHeaders (COOP/COEP)
├─ Models/                   # Order, AccessToken, User
└─ Services/                 # RobokassaService

resources/
├─ js/
│  ├─ components/            # VideoUploader, CropOverlay, TimelineTrimmer,
│  │                          # CropDimensionFields, ResizeControls, RenderingScreen,
│  │                          # YandexAdBlock, ProUpsellModal, HeaderStatus
│  ├─ hooks/                 # useFFmpeg, useProAccess
│  ├─ lib/                   # ffmpegPipeline (сборка FFmpeg-фильтров и команд)
│  ├─ pages/                 # EditorPage
│  └─ app.jsx                # точка входа React SPA
└─ views/                    # layouts/seo.blade.php, landings/show.blade.php

config/
├─ landings.php               # конфиг SEO-посадочных страниц
└─ robokassa.php               # конфиг платёжного шлюза

database/migrations/          # orders, access_tokens и стандартные таблицы Laravel
scripts/copy-ffmpeg-core.mjs   # копирует core-файлы FFmpeg.wasm в public/ffmpeg
tests/                         # Unit- и Feature-тесты
```

---

*Документ синхронизирован с [SPECIFICATION.md](SPECIFICATION.md), [ARCHITECTURE.md](ARCHITECTURE.md) и [TASKS.md](TASKS.md).*
