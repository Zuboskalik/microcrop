@extends('layouts.seo')

@section('content')
    @if(!empty($meta['faq']))
        <section class="mx-auto max-w-2xl" aria-label="{{ __('messages.faq.ariaLabel') }}">
            <h2 class="text-center text-2xl font-bold text-slate-900">{{ __('messages.faq.heading') }}</h2>
            <div class="mt-6 space-y-4">
                @foreach($meta['faq'] as $item)
                    <article class="card p-5">
                        <h3 class="font-semibold text-slate-900">{{ $item['q'] }}</h3>
                        <p class="mt-1 text-sm text-slate-500">{{ $item['a'] }}</p>
                    </article>
                @endforeach
            </div>
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
