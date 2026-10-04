<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Включает cross-origin isolation, необходимую браузеру для выдачи
 * SharedArrayBuffer — задел на многопоточный режим FFmpeg.wasm (см.
 * ARCHITECTURE.md §1, SPECIFICATION.md §4.7). Сейчас используется
 * однопоточное ядро (@ffmpeg/core, см. TASKS.md Phase 5), которому
 * SharedArrayBuffer не требуется.
 *
 * COEP: 'credentialless' (а не 'require-corp') — иначе сторонние
 * cross-origin скрипты без заголовка Cross-Origin-Resource-Policy
 * (например, РСЯ) браузер молча блокирует (обнаружено в Phase 7,
 * см. TASKS.md Task 7.5/7.6). 'credentialless' сохраняет
 * cross-origin isolation (crossOriginIsolated=true), но грузит внешние
 * ресурсы без credentials вместо жёсткой блокировки — этого достаточно
 * и для рекламных скриптов, и на будущее для core-mt.
 */
class CrossOriginIsolationHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // По умолчанию выключено: однопоточное ядро FFmpeg.wasm isolation не
        // требует, а COOP/COEP могут ломать iframe рекламы РСЯ.
        if (! config('app.cross_origin_isolation')) {
            return $response;
        }

        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Embedder-Policy', 'credentialless');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

        return $response;
    }
}
