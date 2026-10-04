import { useId, useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider.jsx';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Масштабирование итогового видео — либо явным разрешением (ширина/высота
 * в px), либо процентом от текущей области кадрирования, с опциональным
 * сохранением пропорций.
 *
 * @param {object} props
 * @param {number} props.baseWidth   Ширина после кадрирования (100%), px.
 * @param {number} props.baseHeight  Высота после кадрирования (100%), px.
 * @param {{w:number,h:number}} props.value  Текущий целевой размер (по умолчанию равен baseWidth/baseHeight).
 * @param {(next: {w:number,h:number}) => void} props.onChange
 */
export default function ResizeControls({ baseWidth, baseHeight, value, onChange }) {
    const t = useTranslation();
    const [keepAspect, setKeepAspect] = useState(true);
    const widthId = useId();
    const heightId = useId();
    const percentId = useId();
    const keepAspectId = useId();

    const ratio = baseWidth / baseHeight;
    const percent = Math.round((value.w / baseWidth) * 100);

    const commitWidth = (rawW) => {
        const w = clamp(Math.round(rawW), 2, baseWidth * 4);
        const h = keepAspect ? Math.round(w / ratio) : value.h;
        onChange({ w, h: clamp(h, 2, baseHeight * 4) });
    };

    const commitHeight = (rawH) => {
        const h = clamp(Math.round(rawH), 2, baseHeight * 4);
        const w = keepAspect ? Math.round(h * ratio) : value.w;
        onChange({ w: clamp(w, 2, baseWidth * 4), h });
    };

    const commitPercent = (rawPercent) => {
        const pct = clamp(rawPercent, 5, 400);
        onChange({
            w: clamp(Math.round((baseWidth * pct) / 100), 2, baseWidth * 4),
            h: clamp(Math.round((baseHeight * pct) / 100), 2, baseHeight * 4),
        });
    };

    const reset = () => onChange({ w: baseWidth, h: baseHeight });

    return (
        <div className="card mt-4 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-700">{t('resize.title')}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{t('resize.subtitle')}</p>
                </div>
                {(value.w !== baseWidth || value.h !== baseHeight) ? (
                    <button type="button" onClick={reset} className="text-xs font-medium text-brand-600 hover:underline">
                        {t('resize.reset')}
                    </button>
                ) : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label htmlFor={widthId} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-400">{t('resize.width')}</span>
                    <input
                        id={widthId}
                        type="number"
                        inputMode="numeric"
                        defaultValue={value.w}
                        key={`w-${value.w}`}
                        min={2}
                        onBlur={(e) => Number.isFinite(Number(e.target.value)) && commitWidth(Number(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                </label>

                <label htmlFor={heightId} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-400">{t('resize.height')}</span>
                    <input
                        id={heightId}
                        type="number"
                        inputMode="numeric"
                        defaultValue={value.h}
                        key={`h-${value.h}`}
                        min={2}
                        onBlur={(e) => Number.isFinite(Number(e.target.value)) && commitHeight(Number(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                </label>

                <label htmlFor={percentId} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-400">{t('resize.scale')}</span>
                    <input
                        id={percentId}
                        type="number"
                        inputMode="numeric"
                        defaultValue={percent}
                        key={`p-${percent}`}
                        min={5}
                        max={400}
                        onBlur={(e) => Number.isFinite(Number(e.target.value)) && commitPercent(Number(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                </label>
            </div>

            <label htmlFor={keepAspectId} className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <input
                    id={keepAspectId}
                    type="checkbox"
                    checked={keepAspect}
                    onChange={(e) => setKeepAspect(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                />
                {t('resize.keepAspect')}
            </label>
        </div>
    );
}
