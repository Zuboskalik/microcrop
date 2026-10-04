@php
    $currentMode = (($meta['mode'] ?? 'video') === 'image') ? 'image' : 'video';
    $locale = app()->getLocale();

    // Переключатель "Видео" / "Изображение" — переход между главной ('/') и
    // страницей обработки изображений ('/image'). Язык переносим явным
    // параметром ?lang=, чтобы выбор сохранился и без опоры на сессию.
    $modes = [
        ['key' => 'video', 'url' => url('/'), 'label' => __('messages.modeSwitcher.video')],
        ['key' => 'image', 'url' => url('/image'), 'label' => __('messages.modeSwitcher.image')],
    ];
@endphp

{{-- Переключатель типа обработки в шапке, справа от логотипа (дизайн как у
     переключателя языка, см. partials/language-switcher.blade.php). --}}
<div class="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/70 p-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm"
     role="group" aria-label="{{ __('messages.modeSwitcher.ariaLabel') }}">
    @foreach($modes as $mode)
        @php($isActive = $mode['key'] === $currentMode)
        <a
            href="{{ $mode['url'] }}?lang={{ $locale }}"
            @if($isActive) aria-current="page" @endif
            class="rounded-full px-2.5 py-1 transition-colors
                {{ $isActive
                    ? 'bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' }}"
        >
            {{ $mode['label'] }}
        </a>
    @endforeach
</div>
