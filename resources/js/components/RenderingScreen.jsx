import YandexAdBlock from './YandexAdBlock.jsx';
import { useTranslation } from '../i18n/I18nProvider.jsx';

/**
 * Экран ожидания рендера FFmpeg.wasm — прогресс-бар с процентами, спиннер
 * и рекламный слот (Task 5.21/6.7). Ad-слот не показывается PRO-пользователям
 * (Task 6.14) — реклама рядом с оплаченным опытом только мешала бы.
 */
export default function RenderingScreen({ progress, hasProAccess }) {
    const t = useTranslation();
    const percent = Math.round(progress * 100);

    return (
        <div className="card flex flex-col items-center gap-5 p-8 text-center animate-fade-in">
            <div className="relative flex h-20 w-20 items-center justify-center">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                    <circle
                        cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - progress)}
                        className="text-brand-500 transition-[stroke-dashoffset] duration-200"
                    />
                </svg>
                <span className="absolute text-lg font-bold text-slate-700">{percent}%</span>
            </div>

            <div>
                <p className="font-semibold text-slate-900">{t('rendering.title')}</p>
                <p className="mt-1 text-sm text-slate-500">
                    {t('rendering.localNote')}
                </p>
            </div>

            {!hasProAccess ? (
                <YandexAdBlock placement="renderScreen" className="ad-slot h-[100px] w-full" />
            ) : null}
        </div>
    );
}
