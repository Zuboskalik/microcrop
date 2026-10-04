<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Определяет язык интерфейса для каждого web-запроса:
 *
 *   1. ?lang=xx в query-строке — явный выбор пользователя (переключатель),
 *      запоминается в сессии и используется при последующих заходах;
 *   2. сохранённый в сессии язык;
 *   3. Accept-Language браузера (стандартный способ, которым это делают
 *      фреймворки);
 *   4. fallback-локаль приложения.
 *
 * Поддерживаемые локали берутся из config/app.php (supported_locales).
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = $this->supportedLocales();
        $locale = $this->resolveLocale($request, $supported);

        // Запоминаем выбор, пришедший явно через ?lang=, чтобы он сохранился
        // между переходами по страницам без параметра.
        if ($request->query('lang') !== null || $request->session()->has('locale')) {
            $request->session()->put('locale', $locale);
        }

        app()->setLocale($locale);

        return $next($request);
    }

    /**
     * @param  array<int, string>  $supported
     */
    private function resolveLocale(Request $request, array $supported): string
    {
        $fallback = config('app.fallback_locale', 'en');

        $fromQuery = $request->query('lang');

        if (is_string($fromQuery) && in_array($fromQuery, $supported, true)) {
            return $fromQuery;
        }

        $fromSession = $request->session()->get('locale');

        if (is_string($fromSession) && in_array($fromSession, $supported, true)) {
            return $fromSession;
        }

        $fromBrowser = $this->preferredLocaleFromBrowser($request, $supported);

        if ($fromBrowser !== null) {
            return $fromBrowser;
        }

        return in_array($fallback, $supported, true) ? $fallback : ($supported[0] ?? 'en');
    }

    /**
     * Разбирает заголовок Accept-Language (например «en-US,en;q=0.9,ru;q=0.8»)
     * и возвращает первый поддерживаемый язык.
     *
     * @param  array<int, string>  $supported
     */
    private function preferredLocaleFromBrowser(Request $request, array $supported): ?string
    {
        $header = $request->header('Accept-Language');

        if (!$header) {
            return null;
        }

        $candidates = [];

        foreach (explode(',', $header) as $part) {
            $segments = explode(';q=', trim($part));
            $tag = strtolower(trim($segments[0]));
            $quality = isset($segments[1]) ? (float) $segments[1] : 1.0;

            if ($tag !== '') {
                $candidates[] = ['tag' => $tag, 'q' => $quality];
            }
        }

        usort($candidates, static fn (array $a, array $b) => $b['q'] <=> $a['q']);

        foreach ($candidates as $candidate) {
            $short = explode('-', $candidate['tag'])[0];

            if (in_array($short, $supported, true)) {
                return $short;
            }
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function supportedLocales(): array
    {
        return config('app.supported_locales', ['en', 'ru']);
    }
}
