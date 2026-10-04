import { useCallback, useRef, useState } from 'react';

/**
 * чч:мм:сс.мс — см. TASKS.md Task 5.9.
 */
export function formatTime(totalSeconds) {
    const safe = Math.max(0, totalSeconds || 0);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = Math.floor(safe % 60);
    const millis = Math.round((safe - Math.floor(safe)) * 1000);

    const pad = (n, len = 2) => String(n).padStart(len, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millis, 3)}`;
}

/**
 * Разбирает строку вида "00:01:23.456", "01:23.456" или "83.456" в секунды.
 * Возвращает null, если строка не распознана.
 */
export function parseTime(value) {
    const trimmed = value.trim();
    if (trimmed === '') return null;

    const parts = trimmed.split(':');
    if (parts.length > 3) return null;

    const [secondsStr, minutesStr, hoursStr] = parts.reverse();
    const seconds = Number(secondsStr);
    const minutes = minutesStr ? Number(minutesStr) : 0;
    const hours = hoursStr ? Number(hoursStr) : 0;

    if ([seconds, minutes, hours].some((n) => Number.isNaN(n))) {
        return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Таймлайн с двумя хендлами (начало/конец) и ручным вводом времени
 * (Task 5.9/5.10). duration — длительность исходного видео в секундах.
 */
export default function TimelineTrimmer({ duration, start, end, onChange }) {
    const trackRef = useRef(null);
    const [dragging, setDragging] = useState(null);

    const percentFor = useCallback((seconds) => (duration > 0 ? (seconds / duration) * 100 : 0), [duration]);

    const secondsFromClientX = useCallback((clientX) => {
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        return ratio * duration;
    }, [duration]);

    const handlePointerMove = useCallback((event) => {
        if (!dragging) return;

        const seconds = secondsFromClientX(event.clientX);

        if (dragging === 'start') {
            onChange({ start: clamp(seconds, 0, end - 0.1), end });
        } else {
            onChange({ start, end: clamp(seconds, start + 0.1, duration) });
        }
    }, [dragging, secondsFromClientX, start, end, duration, onChange]);

    const stopDragging = useCallback(() => {
        setDragging(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', stopDragging);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handlePointerMove]);

    const startDragging = (handle) => (event) => {
        event.preventDefault();
        setDragging(handle);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopDragging);
    };

    const onManualStartChange = (event) => {
        const seconds = parseTime(event.target.value);
        if (seconds !== null) {
            onChange({ start: clamp(seconds, 0, end - 0.1), end });
        }
    };

    const onManualEndChange = (event) => {
        const seconds = parseTime(event.target.value);
        if (seconds !== null) {
            onChange({ start, end: clamp(seconds, start + 0.1, duration) });
        }
    };

    return (
        <div className="card mt-4 p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>0:00</span>
                <span>Таймлайн</span>
                <span>{formatTime(duration).slice(0, 8)}</span>
            </div>

            <div className="relative mt-3 h-2 rounded-full bg-slate-200" ref={trackRef}>
                <div
                    className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500"
                    style={{ left: `${percentFor(start)}%`, width: `${percentFor(end - start)}%` }}
                />
                <div
                    className="absolute top-1/2 -ml-2.5 h-5 w-5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-brand-500 bg-white shadow-md transition-transform hover:scale-110"
                    style={{ left: `${percentFor(start)}%` }}
                    onPointerDown={startDragging('start')}
                />
                <div
                    className="absolute top-1/2 -ml-2.5 h-5 w-5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-brand-500 bg-white shadow-md transition-transform hover:scale-110"
                    style={{ left: `${percentFor(end)}%` }}
                    onPointerDown={startDragging('end')}
                />
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
                <label className="flex-1">
                    <span className="mb-1 block text-xs font-medium text-slate-400">Начало</span>
                    <input
                        type="text"
                        defaultValue={formatTime(start)}
                        key={`start-${start}`}
                        onBlur={onManualStartChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                </label>
                <label className="flex-1">
                    <span className="mb-1 block text-xs font-medium text-slate-400">Конец</span>
                    <input
                        type="text"
                        defaultValue={formatTime(end)}
                        key={`end-${end}`}
                        onBlur={onManualEndChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                </label>
            </div>
        </div>
    );
}
