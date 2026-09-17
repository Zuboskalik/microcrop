<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Маршруты платежей (Robokassa) и PRO-токенов. Реализация контроллеров —
| Phase 4 (см. TASKS.md). Пока это заглушка, чтобы каркас API был готов
| и middleware/CORS можно было проверить сквозным запросом.
|
*/

Route::prefix('payments')->group(function () {
    // Route::post('/create', [PaymentsController::class, 'create']);
    // Route::post('/callback', [PaymentsController::class, 'callback']);
    // Route::get('/{order}/status', [PaymentsController::class, 'status']);
});

Route::prefix('tokens')->group(function () {
    // Route::post('/validate', [TokensController::class, 'validate']);
});
