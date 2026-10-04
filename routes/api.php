<?php

use App\Http\Controllers\Api\PaymentsController;
use App\Http\Controllers\Api\TokensController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Маршруты платежей (Robokassa) и PRO-токенов — см. ARCHITECTURE.md §6.
| Middleware-группа 'api' (см. bootstrap/app.php) не включает CSRF-проверку,
| поэтому /payments/callback (вызывается сервером Robokassa) не нуждается
| в отдельном исключении из VerifyCsrfToken.
|
*/

Route::prefix('payments')->middleware('throttle:60,1')->group(function () {
    Route::post('/create', [PaymentsController::class, 'create']);
    Route::post('/callback', [PaymentsController::class, 'callback']);
    Route::get('/{order}/status', [PaymentsController::class, 'status']);
});

Route::prefix('tokens')->middleware('throttle:60,1')->group(function () {
    Route::post('/validate', [TokensController::class, 'validate']);
});
