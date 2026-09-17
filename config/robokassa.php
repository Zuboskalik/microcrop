<?php

/*
|--------------------------------------------------------------------------
| Robokassa Payment Gateway
|--------------------------------------------------------------------------
|
| См. ARCHITECTURE.md §6 (RobokassaService, PaymentsController). Продавец
| зарегистрирован как самозанятый (НПД) — чек выставляется через
| интеграцию Robokassa с приложением «Мой налог» (настраивается в ЛК
| Robokassa, не в коде — см. TASKS.md Task 4.13).
|
*/

return [

    'merchant_login' => env('ROBOKASSA_MERCHANT_LOGIN'),

    'password1' => env('ROBOKASSA_PASSWORD1'),

    'password2' => env('ROBOKASSA_PASSWORD2'),

    'is_test' => env('ROBOKASSA_IS_TEST', true),

    'base_url' => env('ROBOKASSA_BASE_URL', 'https://auth.robokassa.ru/Merchant/Index.aspx'),

    // Цены в копейках по product_type (см. SPECIFICATION.md §1.4 / ARCHITECTURE.md §3.2).
    'prices' => [
        'remove_watermark' => (int) env('ROBOKASSA_PRICE_REMOVE_WATERMARK', 19900),
        'fast_render' => (int) env('ROBOKASSA_PRICE_FAST_RENDER', 9900),
        'social_presets' => (int) env('ROBOKASSA_PRICE_SOCIAL_PRESETS', 9900),
    ],

    // Срок жизни PRO-токена после успешной оплаты (часы).
    'token_ttl_hours' => (int) env('ROBOKASSA_TOKEN_TTL_HOURS', 48),

];
