@extends('layouts.seo')

@section('content')
    @if(!empty($meta['intro']))
        <p class="landing-intro">{{ $meta['intro'] }}</p>
    @endif

    @if(!empty($meta['faq']))
        <section class="landing-faq" aria-label="Частые вопросы">
            <h2>Частые вопросы</h2>
            @foreach($meta['faq'] as $item)
                <article class="landing-faq__item">
                    <h3>{{ $item['q'] }}</h3>
                    <p>{{ $item['a'] }}</p>
                </article>
            @endforeach
        </section>

        <script type="application/ld+json">
            {!! json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => collect($meta['faq'])->map(fn ($item) => [
                    '@type' => 'Question',
                    'name' => $item['q'],
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $item['a'],
                    ],
                ])->values()->all(),
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>
    @endif
@endsection
