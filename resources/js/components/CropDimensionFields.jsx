import { useId } from 'react';
import { useTranslation } from '../i18n/I18nProvider.jsx';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function NumberField({ label, value, onCommit, min = 0, max }) {
    const id = useId();

    return (
        <label htmlFor={id} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">{label}</span>
            <input
                id={id}
                type="number"
                inputMode="numeric"
                defaultValue={Math.round(value)}
                key={Math.round(value)}
                min={min}
                max={max}
                onBlur={(event) => {
                    const parsed = Number(event.target.value);
                    if (!Number.isFinite(parsed)) return;
                    onCommit(clamp(Math.round(parsed), min, max ?? Infinity));
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') event.target.blur();
                }}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
        </label>
    );
}

/**
 * Точный ручной ввод области кадрирования — ширина/высота и отступы от
 * каждого края кадра (слева/справа/сверху/снизу), в пикселях исходного
 * видео. Дублирует то, что можно сделать перетаскиванием рамки CropOverlay,
 * но даёт точность до пикселя.
 *
 * Модель: left/top/right/bottom — отступы от границ кадра до рамки
 * (left + width + right = naturalWidth, top + height + bottom = naturalHeight).
 * Изменение width/height двигает противоположный от "якоря" (x,y) край;
 * изменение отступа с одной стороны держит неподвижным противоположный отступ.
 *
 * @param {object} props
 * @param {number} props.naturalWidth
 * @param {number} props.naturalHeight
 * @param {{x:number,y:number,w:number,h:number}|null} props.crop  null = кадр целиком.
 * @param {(crop: {x:number,y:number,w:number,h:number}) => void} props.onChange
 */
export default function CropDimensionFields({ naturalWidth, naturalHeight, crop, onChange }) {
    const t = useTranslation();
    const current = crop ?? { x: 0, y: 0, w: naturalWidth, h: naturalHeight };
    const left = current.x;
    const top = current.y;
    const right = naturalWidth - current.x - current.w;
    const bottom = naturalHeight - current.y - current.h;

    const setWidth = (w) => onChange({ x: current.x, y: current.y, w: clamp(w, 1, naturalWidth - current.x), h: current.h });
    const setHeight = (h) => onChange({ x: current.x, y: current.y, w: current.w, h: clamp(h, 1, naturalHeight - current.y) });
    const setLeft = (newLeft) => {
        const w = clamp(naturalWidth - newLeft - right, 1, naturalWidth - newLeft);
        onChange({ x: newLeft, y: current.y, w, h: current.h });
    };
    const setRight = (newRight) => {
        const w = clamp(naturalWidth - current.x - newRight, 1, naturalWidth - current.x);
        onChange({ x: current.x, y: current.y, w, h: current.h });
    };
    const setTop = (newTop) => {
        const h = clamp(naturalHeight - newTop - bottom, 1, naturalHeight - newTop);
        onChange({ x: current.x, y: newTop, w: current.w, h });
    };
    const setBottom = (newBottom) => {
        const h = clamp(naturalHeight - current.y - newBottom, 1, naturalHeight - current.y);
        onChange({ x: current.x, y: current.y, w: current.w, h });
    };

    return (
        <div className="card mt-4 p-5">
            <p className="text-sm font-semibold text-slate-700">{t('cropFields.title')}</p>
            <p className="mt-0.5 text-xs text-slate-400">{t('cropFields.subtitle', { width: naturalWidth, height: naturalHeight })}</p>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumberField label={t('cropFields.width')} value={current.w} min={1} max={naturalWidth - current.x} onCommit={setWidth} />
                <NumberField label={t('cropFields.height')} value={current.h} min={1} max={naturalHeight - current.y} onCommit={setHeight} />
                <NumberField label={t('cropFields.offsetLeft')} value={left} min={0} max={naturalWidth - 1} onCommit={setLeft} />
                <NumberField label={t('cropFields.offsetRight')} value={right} min={0} max={naturalWidth - 1} onCommit={setRight} />
                <NumberField label={t('cropFields.offsetTop')} value={top} min={0} max={naturalHeight - 1} onCommit={setTop} />
                <NumberField label={t('cropFields.offsetBottom')} value={bottom} min={0} max={naturalHeight - 1} onCommit={setBottom} />
            </div>
        </div>
    );
}
