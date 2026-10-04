<!DOCTYPE html>
@php
    $locale = app()->getLocale();
    $ogLocales = ['en' => 'en_US', 'ru' => 'ru_RU'];
@endphp
<html lang="{{ $locale }}">
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
    <meta property="og:locale" content="{{ $ogLocales[$locale] ?? str_replace('-', '_', $locale) }}">

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

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
    <header class="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <a href="{{ url('/') }}" class="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-md shadow-brand-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-4.5 w-4.5">
                        <path d="M6 3v14a2 2 0 0 0 2 2h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18 21V7a2 2 0 0 0-2-2H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <span class="gradient-heading">MicroCrop</span>
            </a>

            <div class="flex items-center gap-3">
                <div id="microcrop-header-status" class="hidden sm:block"></div>

                @include('partials.language-switcher')

                <div id="microcrop-ad-header" class="hidden h-[60px] w-[320px] shrink-0 md:block"></div>
            </div>
        </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-10">
        <section class="mx-auto max-w-2xl text-center">
            <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
                <span class="gradient-heading">{{ $meta['h1'] }}</span>
            </h1>
            @if(!empty($meta['intro']))
                <p class="mt-4 text-base text-slate-500">{{ $meta['intro'] }}</p>
            @endif
        </section>

        <div class="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            {{-- Точка монтирования React-редактора (Phase 5/6) --}}
            <div id="microcrop-app" data-preset='@json($meta['preset'] ?? null)' data-locale="{{ $locale }}"></div>

            <aside id="microcrop-ad-sidebar" class="hidden min-h-[600px] lg:block"></aside>
        </div>

        {{-- Индексируемый текстовый SEO-контент страницы (FAQ и т.п.) --}}
        <div class="mt-16">
            @yield('content')
        </div>
    </main>

    <footer class="mt-10 border-t border-slate-200/70 py-8 text-center text-sm text-slate-400">
        {{ __('messages.footer', ['year' => date('Y')]) }}
    </footer>
</body>
</html>
