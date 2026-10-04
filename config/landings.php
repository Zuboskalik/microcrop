<?php

/*
|--------------------------------------------------------------------------
| Посадочные SEO-страницы MicroCrop
|--------------------------------------------------------------------------
|
| Единый источник СТРУКТУРНЫХ данных для LandingController (рендер страницы)
| и SitemapController (генерация sitemap.xml) — см. ARCHITECTURE.md §2.
|
| Здесь хранится только то, что не зависит от языка: slug, preset (стартовая
| конфигурация Crop Box / таймлайна), og_image, priority, changefreq.
| Тексты (title, description, h1, intro, faq и подписи preset) лежат в
| lang/{locale}/landings.php с теми же ключами. LandingController совмещает
| обе части через array_replace_recursive.
|
| Ключ записи совпадает с её slug (кроме 'home' для главной '/').
|
*/

return [

    'home' => [
        'slug' => '',
        'preset' => null,
        'og_image' => '/images/og/home.jpg',
        'priority' => '1.0',
        'changefreq' => 'daily',
    ],

    'image' => [
        'slug' => 'image',
        // Режим редактора: 'image' переключает React-приложение на обработку
        // растровых изображений (png/jpg/jpeg/webp) — кадрирование и ресайз
        // через Canvas вместо FFmpeg.wasm (см. resources/js/lib/imagePipeline.js).
        'mode' => 'image',
        'preset' => null,
        'og_image' => '/images/og/image.jpg',
        'priority' => '0.9',
        'changefreq' => 'weekly',
    ],

    'crop-video-online' => [
        'slug' => 'crop-video-online',
        'preset' => null,
        'og_image' => '/images/og/crop-video-online.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

    'crop-for-reels' => [
        'slug' => 'crop-for-reels',
        'preset' => ['ratio' => '9:16'],
        'og_image' => '/images/og/crop-for-reels.jpg',
        'priority' => '0.9',
        'changefreq' => 'weekly',
    ],

    'crop-for-shorts' => [
        'slug' => 'crop-for-shorts',
        'preset' => ['ratio' => '9:16'],
        'og_image' => '/images/og/crop-for-shorts.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

    'crop-for-tiktok' => [
        'slug' => 'crop-for-tiktok',
        'preset' => ['ratio' => '9:16'],
        'og_image' => '/images/og/crop-for-tiktok.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

    'crop-for-vk-clips' => [
        'slug' => 'crop-for-vk-clips',
        'preset' => ['ratio' => '9:16'],
        'og_image' => '/images/og/crop-for-vk-clips.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

    'trim-video' => [
        'slug' => 'trim-video',
        'preset' => ['mode' => 'trim-only'],
        'og_image' => '/images/og/trim-video.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

    'circle-video-telegram' => [
        'slug' => 'circle-video-telegram',
        'preset' => ['ratio' => '1:1', 'mask' => 'circle'],
        'og_image' => '/images/og/circle-video-telegram.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

    'crop-square-1-1' => [
        'slug' => 'crop-square-1-1',
        'preset' => ['ratio' => '1:1'],
        'og_image' => '/images/og/crop-square-1-1.jpg',
        'priority' => '0.8',
        'changefreq' => 'weekly',
    ],

];
