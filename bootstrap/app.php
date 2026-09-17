<?php

use App\Http\Middleware\CrossOriginIsolationHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // COOP/COEP нужны и на страницах редактора (web), и на API-ответах,
        // чтобы cross-origin isolation не терялась при XHR/fetch к /api/*.
        $middleware->web(append: [
            CrossOriginIsolationHeaders::class,
        ]);

        $middleware->api(append: [
            CrossOriginIsolationHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
