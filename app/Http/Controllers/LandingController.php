<?php

namespace App\Http\Controllers;

use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

class LandingController extends Controller
{
    /**
     * Отдаёт SEO-посадочную страницу по её slug.
     *
     * Структурные данные (slug, preset, og_image, priority, changefreq)
     * берутся из config/landings.php, а тексты — из lang/{locale}/landings.php,
     * где текущая локаль уже установлена middleware SetLocale (по браузеру
     * или явному выбору пользователя). Обе части совмещаются рекурсивно,
     * поэтому в lang-файле достаточно указать только переведённые поля.
     */
    public function show(string $slug = 'home'): View
    {
        $structure = config("landings.{$slug}");

        abort_unless($structure !== null, Response::HTTP_NOT_FOUND);

        $translated = trans("landings.{$slug}");
        $translated = is_array($translated) ? $translated : [];

        $meta = array_replace_recursive($structure, $translated);

        return view('landings.show', ['meta' => $meta]);
    }
}
