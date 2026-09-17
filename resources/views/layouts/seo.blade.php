<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f172a">

    <title>{{ $meta['title'] }}</title>
    <meta name="description" content="{{ $meta['description'] }}">
    <link rel="canonical" href="{{ url()->current() }}">

    {{-- Open Graph --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MicroCrop">
    <meta property="og:title" content="{{ $meta['title'] }}">
    <meta property="og:description" content="{{ $meta['description'] }}">
    <meta property="og:url" content="{{ url()->current() }}">
    @if(!empty($meta['og_image']))
        <meta property="og:image" content="{{ asset($meta['og_image']) }}">
    @endif
    <meta property="og:locale" content="ru_RU">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['title'] }}">
    <meta name="twitter:description" content="{{ $meta['description'] }}">

    {{-- JSON-LD: описание приложения (см. ARCHITECTURE.md §2.4) --}}
    <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => 'MicroCrop',
            'applicationCategory' => 'MultimediaApplication',
            'operatingSystem' => 'Web',
            'url' => url()->current(),
            'offers' => [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'RUB',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
    </script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased">
    <header class="site-header">
        <div class="ad-slot ad-slot--header" data-ad-placement="header"></div>
    </header>

    <main>
        <h1>{{ $meta['h1'] }}</h1>

        {{-- Индексируемый текстовый SEO-контент страницы --}}
        @yield('content')

        {{-- Точка монтирования React-редактора (Phase 5) --}}
        <div id="microcrop-app" data-preset='@json($meta['preset'] ?? null)'></div>
    </main>

    <aside class="ad-slot ad-slot--sidebar" data-ad-placement="sidebar"></aside>
</body>
</html>
