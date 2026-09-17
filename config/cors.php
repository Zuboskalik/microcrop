<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sitemap.xml', 'robots.txt'],

    'allowed_methods' => ['*'],

    // React SPA живёт на том же origin (смонтирован в Blade), но во время
    // локальной разработки Vite dev server крутится на отдельном порту —
    // разрешаем его явно через .env, а не через '*'.
    'allowed_origins' => array_filter([
        env('APP_URL', 'http://localhost:8000'),
        env('VITE_DEV_SERVER_URL', 'http://localhost:5173'),
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
