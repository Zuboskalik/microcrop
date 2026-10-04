<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'show'])->defaults('slug', 'home')->name('home');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::get('/robots.txt', function () {
    return response(
        "User-agent: *\n".
        "Disallow: /api/\n".
        "Disallow: /admin/\n".
        "Clean-param: lang\n".
        'Sitemap: '.url('/sitemap.xml')."\n",
        200
    )->header('Content-Type', 'text/plain');
})->name('robots');

// Посадочные SEO-страницы (см. config/landings.php и ARCHITECTURE.md §2.1).
// Регистрируется последним, чтобы не перехватывать /sitemap.xml и /robots.txt.
Route::get('/{slug}', [LandingController::class, 'show'])
    ->where('slug', implode('|', array_filter(array_column(config('landings') ?? [], 'slug'))))
    ->name('landing');
