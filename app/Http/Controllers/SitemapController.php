<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Генерирует sitemap.xml из единого конфига посадочных страниц
     * (config/landings.php) — см. ARCHITECTURE.md §2.5.
     */
    public function index(): Response
    {
        $urls = collect(config('landings'))
            ->map(function (array $meta) {
                return [
                    'loc' => url('/'.$meta['slug']),
                    'changefreq' => $meta['changefreq'] ?? 'weekly',
                    'priority' => $meta['priority'] ?? '0.5',
                ];
            })
            ->values();

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'text/xml; charset=UTF-8');
    }
}
