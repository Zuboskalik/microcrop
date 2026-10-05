@php
    $supported = config('app.supported_locales', ['en', 'ru']);
    $current = app()->getLocale();
    $labels = ['en' => 'EN', 'ru' => 'RU'];
    $titles = ['en' => 'English', 'ru' => 'Русский'];
@endphp

{{-- Переключатель языка в углу страницы. Выбор сохраняется в сессии (сервер)
     и в localStorage (клиент, чтобы React-редактор подхватил тот же язык). --}}
<div class="inline-flex h-[50px] items-center gap-0.5 rounded-full border border-slate-200 bg-white/70 p-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm"
     role="group" aria-label="{{ __('messages.language') }}">
    @foreach($supported as $locale)
        @php($isCurrent = $locale === $current)
        <a
            href="{{ url()->current() }}?lang={{ $locale }}"
            hreflang="{{ $locale }}"
            @if($isCurrent) aria-current="true" @endif
            onclick="try { localStorage.setItem('microcrop_locale', '{{ $locale }}'); } catch (e) {}"
            class="flex h-full items-center rounded-full px-4 transition-colors
                {{ $isCurrent
                    ? 'bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' }}"
            title="{{ $titles[$locale] ?? strtoupper($locale) }}"
        >
            {{ $labels[$locale] ?? strtoupper($locale) }}
        </a>
    @endforeach
</div>
