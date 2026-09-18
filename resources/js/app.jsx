import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import EditorPage from './pages/EditorPage.jsx';
import HeaderStatus from './components/HeaderStatus.jsx';
import YandexAdBlock from './components/YandexAdBlock.jsx';
import { useProAccess } from './hooks/useProAccess.js';

/**
 * Единая точка входа: один раз проверяет PRO-доступ (useProAccess) и
 * "расставляет" зависящие от него части интерфейса, смонтированные Blade
 * в разных местах страницы (шапка, рекламные слоты) — через порталы,
 * чтобы у всех была общая, а не своя копия состояния.
 */
function App({ preset }) {
    const proAccess = useProAccess();

    return (
        <>
            {renderPortal('microcrop-header-status', <HeaderStatus proAccess={proAccess} />)}
            {!proAccess.hasProAccess
                ? renderPortal('microcrop-ad-header', <YandexAdBlock placement="header" className="ad-slot h-full w-full" />)
                : null}
            {!proAccess.hasProAccess
                ? renderPortal('microcrop-ad-sidebar', <YandexAdBlock placement="sidebar" className="ad-slot h-full w-full" />)
                : null}

            <EditorPage preset={preset} proAccess={proAccess} />
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

    createRoot(mountEl).render(<App preset={preset} />);
}
