# TASKS.md — MicroCrop

**Основано на:** [SPECIFICATION.md](SPECIFICATION.md), [ARCHITECTURE.md](ARCHITECTURE.md)
**Версия:** 1.0
**Дата:** 2026-09-18

Чек-лист атомарных задач для реализации MVP. Задачи сгруппированы по фазам в порядке рекомендуемого выполнения; внутри фазы порядок также в целом последовательный.

---

### Phase 1: Environment & Project Setup

- [x] Task 1.1: Инициализировать Laravel 10/11 проект (`composer create-project laravel/laravel`), выбрать PHP 8.2+.
- [x] Task 1.2: Настроить `.env` под локальную БД (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=microcrop`, `DB_USERNAME=mysql`, `DB_PASSWORD=mysql`).
- [x] Task 1.3: Создать БД `microcrop` в MySQL 8.0 и проверить подключение (`php artisan migrate` на пустых миграциях/`php artisan db:show`).
- [x] Task 1.4: Установить и настроить Vite + React 18 внутри Laravel (`laravel/vite-plugin`, `@vitejs/plugin-react`) вместо стандартного Blade-only стека.
- [x] Task 1.5: Зафиксировать версию Node.js в `.nvmrc`/`package.json` (`engines.node: "18.x"`), задокументировать fallback на Node 16 с флагом `--openssl-legacy-provider`.
- [x] Task 1.6: Настроить CORS в Laravel (`config/cors.php`) для API-маршрутов `/api/*`.
- [x] Task 1.7: Настроить middleware для COOP/COEP заголовков (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) — обязательное условие для `SharedArrayBuffer` в многопоточном режиме FFmpeg.wasm.
- [x] Task 1.8: Настроить структуру Blade-layout (`resources/views/layouts/seo.blade.php`) как SSR-обёртку для React SPA (точка монтирования `#microcrop-app`).
- [x] Task 1.9: Настроить базовую структуру каталогов фронтенда (`resources/js/components`, `resources/js/hooks`, `resources/js/lib`, `resources/js/pages`).
- [ ] Task 1.10: Настроить линтинг/форматирование (ESLint + Prettier для JS/React, Laravel Pint для PHP).
- [x] Task 1.11: Настроить `.env.example` и `README.md` с инструкцией по локальному запуску (без секретов).
- [x] Task 1.12: Настроить git-репозиторий: `.gitignore` (node_modules, vendor, .env, storage/*.key), базовый CI-скелет (опционально). *(CI-скелет не создавался — опционален)*

---

### Phase 2: SEO & Meta Management

- [x] Task 2.1: Создать конфиг посадочных страниц `config/landings.php` (slug, title, description, h1, preset, og_image, faq).
- [x] Task 2.2: Реализовать `LandingController@show($slug)`, отдающий Blade-view с данными из конфига.
- [x] Task 2.3: Разработать механизм динамических мета-тегов в `layouts/seo.blade.php` (Title, Description, Canonical, Open Graph, Twitter Card).
- [x] Task 2.4: Добавить JSON-LD структурированные данные (`SoftwareApplication`, `FAQPage`) в layout.
- [x] Task 2.5: Создать посадочную страницу `/` (главная, свободный режим без пресета).
- [x] Task 2.6: Создать посадочную страницу `/crop-video-online` (общий крон/кроп-запрос).
- [x] Task 2.7: Создать посадочную страницу `/crop-for-reels` (пресет 9:16, под Reels/Shorts/TikTok/VK Клипы).
- [x] Task 2.8: Создать посадочную страницу `/trim-video` (пресет trim-only, без crop-контролов по умолчанию).
- [x] Task 2.9: Создать посадочную страницу `/circle-video-telegram` (пресет 1:1 + маска круга).
- [x] Task 2.10: Создать посадочную страницу `/crop-square-1-1` (пресет 1:1).
- [x] Task 2.11: Написать SEO-текстовый контент и FAQ-блоки для каждой посадочной страницы (индексируемый HTML в Blade, вне React-компонента). *(базовый контент по 2 FAQ на страницу; финальный копирайтинг — предмет дальнейшей доработки)*
- [x] Task 2.12: Реализовать `SitemapController@index`, генерирующий `sitemap.xml` из `config/landings.php`.
- [x] Task 2.13: Реализовать маршрут `/robots.txt` с указанием `Sitemap:` и `Disallow: /api/`, `/admin/`.
- [ ] Task 2.14: Подготовить OG-изображения (`/images/og/*.jpg`) для каждой посадочной страницы. *(требуются готовые дизайн-ассеты — вне текущей backend-сессии)*
- [ ] Task 2.15: Проверить корректность мета-тегов и OG-карточек через валидаторы (Google Rich Results Test, OpenGraph debugger). *(требует публичного/задеплоенного URL)*

---

### Phase 3: Database & Models (Laravel)

- [x] Task 3.1: Создать миграцию и модель `User` (email, password_hash nullable, email_verified_at) — под будущий личный кабинет/guest-flow. *(миграция — стандартная из скелета Laravel; добавлена связь `orders()`)*
- [x] Task 3.2: Создать миграцию и модель `Order` (user_id nullable, guest_email, product_type, amount, currency, status enum, payment_id, raw_response json).
- [x] Task 3.3: Создать миграцию и модель `AccessToken` (token_hash unique, order_id FK, expires_at, is_used, used_at). *(в примере в начале раздела фигурировало имя `ProToken` — реализовано как `AccessToken`/`access_tokens`, в соответствии с ARCHITECTURE.md §3.3)*
- [x] Task 3.4: Настроить связи Eloquent: `User hasMany Order`, `Order hasOne AccessToken`, `AccessToken belongsTo Order`.
- [x] Task 3.5: Настроить `casts` в моделях (`amount` → integer/копейки, `raw_response` → array, `status` → enum/строка с constants).
- [x] Task 3.6: Добавить индексы БД (`orders.status + created_at`, `access_tokens.token_hash + expires_at`) в миграциях.
- [ ] Task 3.7: (Опционально, v1.1) Создать миграцию и модель `LandingPage` для переноса `config/landings.php` в БД.
- [ ] Task 3.8: Написать Factory и Seeder для `Order`/`AccessToken` для тестового окружения.
- [x] Task 3.9: Прогнать `php artisan migrate` на локальной БД `microcrop` и проверить схему (`php artisan db:table orders` и т.д.). *(проверено `migrate:status` + sanity-тест моделей через tinker, включая cascade-delete)*

---

### Phase 4: Robokassa Payment Service (Backend)

- [x] Task 4.1: Добавить конфиг `config/robokassa.php` (merchant_login, password1, password2, base_url, is_test, prices по `product_type`).
- [x] Task 4.2: Создать `RobokassaService` с методом `buildPaymentUrl()` — формирование URL оплаты с MD5-подписью (`MerchantLogin:OutSum:InvId:Password1`).
- [x] Task 4.3: Реализовать в `RobokassaService` метод `verifyCallbackSignature()` — проверка входящей подписи (`OutSum:InvId:Password2`) с `hash_equals`.
- [x] Task 4.4: Создать `CreateOrderRequest` (Form Request) с валидацией `product_type`, `guest_email`.
- [x] Task 4.5: Реализовать `PaymentsController@create` (`POST /api/payments/create`) — создание `Order(status=pending)` и возврат `payment_url`.
- [x] Task 4.6: Реализовать `PaymentsController@callback` (`POST /api/payments/callback`) — валидация подписи, обновление `Order(status=paid)`, генерация `AccessToken`.
- [x] Task 4.7: Реализовать `PaymentsController@status` (`GET /api/payments/{order}/status`) — polling статуса заказа и одноразовая выдача raw-токена фронтенду.
- [x] Task 4.8: Исключить `POST /api/payments/callback` из CSRF-проверки. *(отдельное исключение не потребовалось: маршрут живёт в `routes/api.php`, middleware-группа `api` в Laravel 11 не включает CSRF по умолчанию — проверено вручную curl'ом.)*
- [x] Task 4.9: Настроить rate-limiting (`throttle:60,1`) на `/api/payments/create` и `/api/tokens/*`.
- [x] Task 4.10: Реализовать `TokensController@validate` (`POST /api/tokens/validate`) — проверка `token_hash` и срока действия.
- [x] Task 4.11: Зарегистрировать все маршруты в `routes/api.php` с префиксом `/api`.
- [x] Task 4.12: Настроить логирование неуспешных/подозрительных callback-запросов (невалидная подпись) через `Log::warning`.
- [ ] Task 4.13: Настроить интеграцию с приложением «Мой налог» / фискализацию чеков для самозанятого (НПД) через личный кабинет Robokassa (конфигурационный шаг, не код — требует реального аккаунта Robokassa).
- [x] Task 4.14: Написать Unit-тест на `RobokassaService::buildPaymentUrl()` (корректность подписи и параметров URL).
- [x] Task 4.15: Написать Unit-тест на `RobokassaService::verifyCallbackSignature()` (валидная/невалидная подпись).
- [x] Task 4.16: Написать Feature-тест на `POST /api/payments/create` (создание заказа, статус `pending`, корректный `payment_url`).
- [x] Task 4.17: Написать Feature-тест на `POST /api/payments/callback` (успешная оплата → `status=paid`, создан `AccessToken`; невалидная подпись → `400`).
- [x] Task 4.18: Написать Feature-тест на `POST /api/tokens/validate` (валидный/просроченный/несуществующий токен).

*Все 20 тестов (`php artisan test`) проходят; полный цикл create → callback → status → validate дополнительно проверен вручную через curl на реальном dev-сервере.*

---

### Phase 5: Frontend Core & FFmpeg.wasm Integration

- [x] Task 5.1: Установить `@ffmpeg/ffmpeg` (v0.12+) и `@ffmpeg/util` через npm. *(вместо `@ffmpeg/core-mt` использован однопоточный `@ffmpeg/core` — см. заметку под списком)*
- [x] Task 5.2: Настроить загрузку `core.wasm`/`worker.js` (self-hosted в `public/ffmpeg/`) с учётом COOP/COEP заголовков (Task 1.7).
- [x] Task 5.3: Разработать компонент `VideoUploader.jsx` (Drag-and-Drop зона + fallback `<input type="file">`).
- [x] Task 5.4: Добавить в `VideoUploader.jsx` клиентскую валидацию формата (MP4/MOV/WebM/AVI) и максимального размера файла с понятным сообщением об ошибке.
- [x] Task 5.5: Разработать компонент видео-плеера предпросмотра (`VideoPreview.jsx`) на базе `<video>` + `URL.createObjectURL`.
- [x] Task 5.6: Разработать компонент `CropOverlay.jsx` — рамка кадрирования с ресайзом за угловые маркеры и перетаскиванием.
- [x] Task 5.7: Реализовать пресеты соотношений сторон в `CropOverlay.jsx`: 16:9, 9:16, 1:1, Free.
- [x] Task 5.8: Реализовать пересчёт координат Crop Box из координат превью (CSS px) в координаты реального разрешения видео (для передачи в FFmpeg-фильтр `crop=w:h:x:y`).
- [x] Task 5.9: Разработать компонент `TimelineTrimmer.jsx` — таймлайн с двумя хендлами (начало/конец) и текстовым отображением `чч:мм:сс.мс`.
- [x] Task 5.10: Добавить в `TimelineTrimmer.jsx` возможность точного ручного ввода времени начала/конца.
- [ ] Task 5.11: (Опционально) Реализовать генерацию миниатюр кадров (thumbnails) для таймлайна.
- [x] Task 5.12: Написать хук `useFFmpeg.js` — инициализация `FFmpeg` инстанса, загрузка core в Web Worker, метод `load()`.
- [x] Task 5.13: Реализовать в `useFFmpeg.js` метод записи входного файла в virtual FS (`writeFile('input.mp4', ...)`).
- [x] Task 5.14: Реализовать модуль `lib/ffmpegPipeline.js` с функцией `buildFilterChain({ crop, hasProAccess, outputHeight })`, собирающей строку `-vf`.
- [x] Task 5.15: Реализовать формирование полной FFmpeg-команды (crop + trim `-ss`/`-to` + кодек `libx264`/`aac`) в `ffmpegPipeline.js`.
- [x] Task 5.16: Реализовать в `useFFmpeg.js` запуск `exec()` с командой и подписку на прогресс (`ffmpeg.on('progress', ...)`) для индикатора выполнения.
- [x] Task 5.17: Реализовать чтение результата из virtual FS (`readFile('output.mp4')`) и формирование `Blob`/download-ссылки.
- [x] Task 5.18: Загрузить шрифт в virtual FS ffmpeg.wasm перед рендером для корректной работы `drawtext`. *(шрифт `DejaVu Sans` — открытая TTF-лицензия, вместо `Inter-Regular.ttf`: у Inter нет официальной npm-дистрибуции в формате `.ttf`; см. `public/fonts/watermark-regular.ttf` + `DEJAVU-LICENSE.txt`)*
- [x] Task 5.19: Реализовать наложение водяного знака "microcrop" через `drawtext` для бесплатного режима — **проверено визуально**: рендер тестового клипа дал видимый полупрозрачный знак «microcrop» в правом нижнем углу.
- [x] Task 5.20: Реализовать адаптивный расчёт `fontsize`/отступов водяного знака относительно `outputHeight` — проверено на двух разрешениях выхода (324px и 288px), знак пропорционально масштабируется.
- [ ] Task 5.21: Разработать компонент `RenderingScreen.jsx` — экран ожидания рендера с прогресс-баром и слотом для рекламного блока. *(сейчас прогресс встроен как текст кнопки в `EditorPage.jsx`; отдельный экран с ad-слотом — часть Phase 6.)*
- [ ] Task 5.22: Реализовать обработку ошибок рендера с понятным UI-сообщением и возможностью повторить попытку. *(сообщение об ошибке показывается; повторная попытка = просто повторный клик, отдельного retry-UX нет.)*
- [x] Task 5.23: Реализовать кнопку «Скачать» с именем файла вида `microcrop_<timestamp>.mp4`.
- [x] Task 5.24: Собрать единый экран/страницу редактора (`EditorPage.jsx`), объединяющий Uploader → Preview/CropOverlay → TimelineTrimmer → Render → Download.
- [x] Task 5.25: Реализовать применение `preset` (из `data-preset` атрибута Blade-страницы) как начальной конфигурации `CropOverlay` при монтировании React-приложения.
- [x] Task 5.26: Проверить, что рендер выполняется в Web Worker и не блокирует UI-поток — подтверждено сквозным браузерным тестом (Drag&Drop → crop → trim → render → скачивание) с реальным видеофайлом.

**Важное отступление от изначального плана (см. ARCHITECTURE.md/Task 5.1–5.2):** многопоточное ядро `@ffmpeg/core-mt` в связке с воркером `@ffmpeg/ffmpeg` оказалось ненадёжным — при загрузке multi-threaded core он сам создаёт пул internal pthread-воркеров через blob: URL, и эта цепочка "воркер в воркере" молча зависала без единой ошибки в консоли (проверено в реальном браузере). Переключение на однопоточную сборку `@ffmpeg/core` полностью решило проблему: полный цикл (crop 9:16 + trim 1с–3с + водяной знак) подтверждён и на уровне видимого результата (скачанный файл проверен через `ffprobe`: точные 162×288px, длительность 2.000000s), и визуально (кадр с водяным знаком экспортирован и просмотрен). COOP/COEP-заголовки оставлены как есть — не мешают однопоточному режиму и позволяют вернуться к `core-mt` позже, если проблема будет решена на стороне библиотеки. Также обнаружен и исправлен сопутствующий баг из Phase 2: статический `public/robots.txt` (дефолтный файл скелета Laravel) перекрывал наш динамический маршрут `/robots.txt` — файл удалён.

---

### Phase 6: Monetization (РСЯ Ads & PRO Flow)

- [x] Task 6.1: Создать компонент `YandexAdBlock.jsx` с параметром `placement` (`header`/`sidebar`/`renderScreen`) и инициализацией через `window.yaContextCb`.
- [x] Task 6.2: Реализовать однократную асинхронную загрузку скрипта РСЯ (`https://an.yandex.ru/system/context.js`) в точке входа приложения.
- [x] Task 6.3: Реализовать таймаут-стражу (~3с) и fallback-состояние в `YandexAdBlock.jsx` для случая блокировки рекламы (AdBlock) — проверено визуально (заглушка «Реклама» при отсутствии реального block ID).
- [x] Task 6.4: Обернуть инициализацию `Ya.Context.AdvManager.render()` в `try/catch`, чтобы сбой рекламного скрипта не ронял остальное приложение.
- [x] Task 6.5: Разместить `YandexAdBlock` в шапке (`header`) общего layout — через React-портал в `#microcrop-ad-header` (Blade остаётся статичным для SEO, слот монтируется из `app.jsx`).
- [x] Task 6.6: Разместить `YandexAdBlock` в боковой панели (`sidebar`) редактора, скрываемой на мобильной раскладке (`<1024px`, класс `hidden lg:block`).
- [x] Task 6.7: Разместить `YandexAdBlock` на экране ожидания рендера — реализован `RenderingScreen.jsx` (закрывает и Task 5.21) с прогресс-баром, спиннером и ad-слотом.
- [x] Task 6.8: Разработать модальное окно `ProUpsellModal.jsx` — предложение купить PRO-доступ с преимуществами и ценой (199 ₽).
- [x] Task 6.9: Реализовать вызов `POST /api/payments/create` из `ProUpsellModal.jsx` и редирект пользователя на полученный `payment_url` Robokassa — проверено сквозным тестом (создан реальный `Order`, браузер перешёл на auth.robokassa.ru).
- [x] Task 6.10: Реализовать экран/состояние «Ожидание оплаты» с polling `GET /api/payments/{order_id}/status` после возврата пользователя с Robokassa — индикатор «Ожидаем оплату…» в шапке.
- [x] Task 6.11: Реализовать сохранение полученного raw-токена в `localStorage` и очистку `?microcrop_token=` из URL (`history.replaceState`) при возврате через query-параметр.
- [x] Task 6.12: Написать хук `useProAccess.js` — проверка токена из `localStorage` через `POST /api/tokens/validate` при старте сессии редактора.
- [x] Task 6.13: Связать результат `useProAccess.js` (`hasProAccess`) с рендером (`useFFmpeg.render()` → `buildFilterChain()`) — отключение фильтра `drawtext` при валидном PRO-токене. **Проверено сквозным тестом**: симулирован реальный callback Robokassa → выдан токен → PRO-бейдж в шапке → экспортированный кадр не содержит водяного знака (сравнение с Free-рендером того же клипа).
- [x] Task 6.14: Реализовать скрытие рекламных блоков на экранах, где это мешает PRO-опыту — `YandexAdBlock` (header/sidebar/renderScreen) не рендерится вовсе при `hasProAccess === true`, подтверждено визуально.
- [ ] Task 6.15: Реализовать обработку истёкшего/использованного токена — повторное предложение оплаты через `ProUpsellModal.jsx`. *(`useProAccess` уже удаляет истёкший токен из localStorage и возвращает `hasProAccess=false`, из-за чего кнопка «Купить PRO» появляется автоматически; отдельного уведомления «токен истёк, оформите заново» нет.)*
- [x] Task 6.16: Добавить UI-индикатор текущего статуса пользователя (Free / PRO до `expires_at`) в шапке редактора — `HeaderStatus.jsx`, смонтирован порталом в `#microcrop-header-status`.

**Дизайн/стилизация (сверх исходного объёма Phase 6, по вашему запросу):** полный визуальный редизайн на Tailwind CSS — Hero-секция с градиентным заголовком, карточки с тенями/скруглениями, `VideoUploader` как акцентная drag-and-drop зона с иконкой и hover/active-эффектами, `CropOverlay` с направляющими по третям и стеклянной панелью пресетов, `TimelineTrimmer` с градиентным треком, единая система кнопок (`.btn-primary`/`.btn-secondary`/`.btn-success`/`.btn-pro`) со спиннером состояния загрузки. **Важно:** попутно обнаружен и исправлен баг конфигурации — `tailwind.config.js` не сканировал `.jsx`-файлы (`content: ['./resources/**/*.js', ...]` не покрывал JSX), из-за чего все Tailwind-классы в компонентах вырезались бы при сборке; добавлен `./resources/**/*.jsx` в `content`.

---

### Phase 7: E2E Testing & Polish

- [ ] Task 7.1: Проверить полный цикл: загрузка видео → Crop (все пресеты 16:9/9:16/1:1/Free) → Trim → рендер → скачивание файла с водяным знаком (Free-режим).
- [ ] Task 7.2: Проверить полный цикл рендера без водяного знака после валидного PRO-токена.
- [ ] Task 7.3: Провести тестовый платёж через Robokassa в тестовом режиме (`IsTest=1`) и убедиться, что callback корректно создаёт `AccessToken`.
- [ ] Task 7.4: Проверить обработку невалидной/поддельной подписи в `callback` (должен вернуть `400`, не создавать токен).
- [ ] Task 7.5: Проверить отображение рекламных блоков РСЯ во всех трёх точках размещения (header, sidebar, renderScreen) на десктопе и мобильной раскладке.
- [ ] Task 7.6: Проверить сценарий с включённым AdBlock — приложение и рендер видео должны продолжать работать без ошибок.
- [ ] Task 7.7: Проверить SEO-страницы на корректность мета-тегов, OG-карточек и наличие индексируемого текстового контента (просмотр исходного HTML без выполнения JS).
- [ ] Task 7.8: Проверить корректность генерации `sitemap.xml` и `robots.txt` (валидные XML/текст, актуальный список URL).
- [ ] Task 7.9: Проверить работу `SharedArrayBuffer`/многопоточного режима FFmpeg.wasm в целевых браузерах (Chrome, Firefox, Edge, Safari) — корректность COOP/COEP заголовков.
- [ ] Task 7.10: Проверить поведение при превышении лимита размера файла и при неподдерживаемом формате (понятная ошибка, без зависания вкладки).
- [ ] Task 7.11: Провести нагрузочную проверку рендера крупного файла (близко к максимально допустимому размеру) — отсутствие зависания UI-потока.
- [ ] Task 7.12: Прогнать полный набор PHP Unit/Feature тестов (`php artisan test`) и убедиться в отсутствии регрессий.
- [ ] Task 7.13: Проверить адаптивность интерфейса редактора и посадочных страниц на мобильных устройствах (виджет загрузки, Crop Box, таймлайн, модальные окна оплаты).
- [ ] Task 7.14: Финальный аудит безопасности: проверка, что raw PRO-токен не попадает в логи/историю браузера, что `access_tokens.token_hash` не хранит значение в открытом виде.
- [ ] Task 7.15: Подготовить чек-лист пред-релизного деплоя (переключение Robokassa из тестового в боевой режим, проверка `.env` продакшена, HTTPS, реальные ad-block ID РСЯ).

---

*Чек-лист синхронизирован с [SPECIFICATION.md](SPECIFICATION.md) и [ARCHITECTURE.md](ARCHITECTURE.md). По мере реализации отмечайте задачи `[x]` и уточняйте состав при появлении новых требований (v1.1/v2).*
