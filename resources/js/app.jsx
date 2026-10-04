import './bootstrap';
import '../css/app.css';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import EditorPage from './pages/EditorPage.jsx';
import HeaderStatus from './components/HeaderStatus.jsx';
import YandexAdBlock from './components/YandexAdBlock.jsx';
import { useProAccess } from './hooks/useProAccess.js';
import { I18nProvider } from './i18n/I18nProvider.jsx';

/**
 * Разово подключает скрипт РСЯ (см. ARCHITECTURE.md §5.2, TASKS.md Task 6.2).
 * Ошибка загрузки (AdBlock/сеть) не выбрасывается дальше — каждый
 * YandexAdBlock сам показывает fallback по таймауту, если window.Ya не
 * появится (см. YandexAdBlock.jsx).
 */
function loadYandexRtbScript() {
    if (document.getElementById('yandex-rtb-script')) return;

    const script = document.createElement('script');
    script.id = 'yandex-rtb-script';
    script.src = 'https://an.yandex.ru/system/context.js';
    script.async = true;
    script.onerror = () => console.warn('Yandex RTB script failed to load (AdBlock?)');
    document.head.appendChild(script);
}

/**
 * Единая точка входа: один раз проверяет PRO-доступ (useProAccess) и
 * "расставляет" зависящие от него части интерфейса, смонтированные Blade
 * в разных местах страницы (шапка, рекламные слоты) — через порталы,
 * чтобы у всех была общая, а не своя копия состояния.
 */
function App({ preset, mode }) {
    const proAccess = useProAccess();

    useEffect(() => {
        if (!proAccess.hasProAccess) {
            loadYandexRtbScript();
        }
    }, [proAccess.hasProAccess]);

    return (
        <>
            {/* Временно отключено вместе с покупкой PRO: индикатор статуса и
                кнопка «Купить PRO» в шапке. Оставлено закомментированным на
                случай будущего возвращения.
            {renderPortal('microcrop-header-status', <HeaderStatus proAccess={proAccess} />)}
            */}
            {!proAccess.hasProAccess
                ? renderPortal('microcrop-ad-header', <YandexAdBlock placement="header" className="ad-slot h-full w-full" />)
                : null}
            {!proAccess.hasProAccess
                ? renderPortal('microcrop-ad-sidebar', <YandexAdBlock placement="sidebar" className="ad-slot h-full w-full" />)
                : null}

            <EditorPage preset={preset} mode={mode} proAccess={proAccess} />
        </>
    );
}

function renderPortal(elementId, node) {
    const el = document.getElementById(elementId);
    return el ? createPortal(node, el) : null;
}

const mountEl = document.getElementById('microcrop-app');

if (mountEl) {
    // preset приходит из Blade-обёртки посадочной страницы (см. ARCHITECTURE.md §2.1/§2.3):
    // задаёт стартовое соотношение сторон Crop Box для конкретного SEO-лендинга.
    let preset = null;
    try {
        preset = JSON.parse(mountEl.dataset.preset ?? 'null');
    } catch {
        preset = null;
    }

    // data-locale проставляет Blade (уже разрешённый SetLocale middleware язык
    // сервера), чтобы клиентский редактор стартовал на том же языке; если атрибута
    // нет — I18nProvider сам определит язык браузера.
    const initialLocale = mountEl.dataset.locale || null;

    // data-mode проставляет Blade (см. layouts/seo.blade.php из $meta['mode']):
    // 'image' переключает редактор на обработку изображений (Canvas), иначе —
    // режим видео (FFmpeg.wasm) по умолчанию.
    const mode = mountEl.dataset.mode === 'image' ? 'image' : 'video';

    createRoot(mountEl).render(
        <I18nProvider initialLocale={initialLocale}>
            <App preset={preset} mode={mode} />
        </I18nProvider>,
    );
}
