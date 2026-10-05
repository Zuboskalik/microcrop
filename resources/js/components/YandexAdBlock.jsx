import { useEffect, useRef, useState } from 'react';

// Реальные ID блоков РСЯ подставляются в проде (ЛК Яндекс.Директ) —
// см. ARCHITECTURE.md §5.1. Пустая строка = блок не сконфигурирован,
// сразу показываем fallback без похода в сеть.
const AD_BLOCK_IDS = {
    header: import.meta.env.VITE_YANDEX_AD_BLOCK_HEADER ?? '',
    sidebar: import.meta.env.VITE_YANDEX_AD_BLOCK_SIDEBAR ?? '',
    renderScreen: import.meta.env.VITE_YANDEX_AD_BLOCK_RENDER ?? '',
};

/**
 * Рекламный блок РСЯ с защитой от сбоя UI (AdBlock/сеть/скрипт недоступны) —
 * см. ARCHITECTURE.md §5.3/§5.4, TASKS.md Task 6.1/6.3/6.4.
 *
 * @param {'header'|'sidebar'|'renderScreen'} props.placement
 */
export default function YandexAdBlock({ placement, className = '' }) {
    const containerRef = useRef(null);
    const [failed, setFailed] = useState(false);
    const blockId = AD_BLOCK_IDS[placement];

    // Блока нет — скрываем и сам слот-обёртку из Blade (иначе остаётся пустое
    // место фиксированного размера), заглушку не показываем.
    const fail = () => {
        const parent = containerRef.current?.parentElement;
        if (parent && parent.id?.startsWith('microcrop-ad')) parent.style.display = 'none';
        setFailed(true);
    };

    useEffect(() => {
        if (!blockId || !containerRef.current) {
            fail();
            return;
        }

        let cancelled = false;
        const containerId = `yandex_rtb_${placement}_${Math.random().toString(36).slice(2)}`;
        containerRef.current.id = containerId;

        // Таймаут-стража: если РСЯ-скрипт не инициализировал блок за 3с —
        // считаем, что реклама заблокирована (AdBlock) или сеть недоступна.
        const failTimer = setTimeout(() => {
            if (!cancelled) fail();
        }, 3000);

        window.yaContextCb = window.yaContextCb || [];
        window.yaContextCb.push(() => {
            if (cancelled) return;

            try {
                window.Ya.Context.AdvManager.render({
                    blockId,
                    renderTo: containerId,
                    async: true,
                });
                clearTimeout(failTimer);
            } catch {
                fail();
            }
        });

        return () => {
            cancelled = true;
            clearTimeout(failTimer);
        };
    }, [placement, blockId]);

    if (failed) {
        return null;
    }

    return <div ref={containerRef} className={className} data-ad-placement={placement} />;
}
