import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import EditorPage from './pages/EditorPage.jsx';

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

    createRoot(mountEl).render(<EditorPage preset={preset} />);
}
