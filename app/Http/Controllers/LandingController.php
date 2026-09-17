<?php

namespace App\Http\Controllers;

use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

class LandingController extends Controller
{
    /**
     * Отдаёт SEO-посадочную страницу по её slug из config/landings.php.
     * Общий источник данных для страницы и sitemap.xml (см. SitemapController).
     */
    public function show(string $slug = 'home'): View
    {
        $meta = config("landings.{$slug}");

        abort_unless($meta !== null, Response::HTTP_NOT_FOUND);

        return view('landings.show', ['meta' => $meta]);
    }
}
