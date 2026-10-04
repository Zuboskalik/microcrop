import { useCallback, useEffect, useRef, useState } from 'react';

export const CROP_PRESETS = {
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '1:1': 1,
    free: null,
};

const MIN_BOX_SIZE = 40; // px, в системе координат превью
const HANDLES = ['tl', 'tr', 'bl', 'br'];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Начальная рамка кадрирования: по умолчанию покрывает 80% меньшей стороны
 * (или всей области для Free) и центрируется в контейнере превью.
 */
function computeDefaultBox(containerSize, ratio) {
    const { width: cw, height: ch } = containerSize;

    if (!ratio) {
        const w = cw * 0.9;
        const h = ch * 0.9;
        return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
    }

    let w = cw * 0.8;
    let h = w / ratio;

    if (h > ch * 0.8) {
        h = ch * 0.8;
        w = h * ratio;
    }

    return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

/**
 * Рамка кадрирования с пресетами 16:9 / 9:16 / 1:1 / Free (Task 5.6/5.7).
 * Координаты box хранятся в CSS px превью и на каждое изменение
 * пересчитываются в пиксели исходного разрешения видео (Task 5.8).
 *
 * @param {object} props
 * @param {number} props.naturalWidth  Реальная ширина видео, px.
 * @param {number} props.naturalHeight Реальная высота видео, px.
 * @param {'16:9'|'9:16'|'1:1'|'free'} props.preset
 * @param {(preset: string) => void} props.onPresetChange
 * @param {(crop: {x:number,y:number,w:number,h:number}) => void} props.onChange  Crop в пикселях исходного видео.
 * @param {{x:number,y:number,w:number,h:number,rev:number}|null} props.externalCrop  Точный crop
 *   из текстовых полей (CropDimensionFields) — применяется поверх текущей рамки по изменению `rev`.
 */
export default function CropOverlay({ naturalWidth, naturalHeight, preset, onPresetChange, onChange, externalCrop }) {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [box, setBox] = useState(null);
    const dragStateRef = useRef(null);

    // Отслеживаем реальный размер контейнера (он совпадает с отрисованным
    // размером <video>, см. VideoPreview.jsx) для конвертации координат.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setContainerSize({ width, height });
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Пересчитываем рамку при смене пресета или как только известен размер контейнера.
    useEffect(() => {
        if (containerSize.width === 0 || containerSize.height === 0) {
            return;
        }

        setBox(computeDefaultBox(containerSize, CROP_PRESETS[preset]));
    }, [preset, containerSize.width, containerSize.height]);

    // Применяем точный crop, заданный текстовыми полями (Task: ручной ввод
    // ширины/высоты/отступов) — конвертируем реальные px обратно в box
    // координаты превью и подменяем текущую рамку.
    useEffect(() => {
        if (!externalCrop || containerSize.width === 0 || containerSize.height === 0) {
            return;
        }

        const scaleX = containerSize.width / naturalWidth;
        const scaleY = containerSize.height / naturalHeight;

        setBox({
            x: clamp(externalCrop.x * scaleX, 0, containerSize.width),
            y: clamp(externalCrop.y * scaleY, 0, containerSize.height),
            w: clamp(externalCrop.w * scaleX, 1, containerSize.width),
            h: clamp(externalCrop.h * scaleY, 1, containerSize.height),
        });
        // Реагируем только на изменение ревизии — containerSize/natural* тут
        // не должны триггерить повторное применение уже применённого override.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalCrop?.rev]);

    const emitCrop = useCallback((nextBox) => {
        if (!onChange || containerSize.width === 0 || containerSize.height === 0) {
            return;
        }

        const scaleX = naturalWidth / containerSize.width;
        const scaleY = naturalHeight / containerSize.height;

        onChange({
            x: clamp(nextBox.x * scaleX, 0, naturalWidth),
            y: clamp(nextBox.y * scaleY, 0, naturalHeight),
            w: clamp(nextBox.w * scaleX, 1, naturalWidth),
            h: clamp(nextBox.h * scaleY, 1, naturalHeight),
        });
    }, [containerSize, naturalWidth, naturalHeight, onChange]);

    useEffect(() => {
        if (box) {
            emitCrop(box);
        }
        // emitCrop зависит от containerSize/natural*, которые не должны
        // триггерить повторный emit сами по себе — только явное изменение box.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [box]);

    const updateBoxFromPointer = useCallback((event) => {
        const dragState = dragStateRef.current;
        if (!dragState) {
            return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const pointer = {
            x: clamp(event.clientX - rect.left, 0, containerSize.width),
            y: clamp(event.clientY - rect.top, 0, containerSize.height),
        };

        if (dragState.type === 'move') {
            const dx = pointer.x - dragState.startPointer.x;
            const dy = pointer.y - dragState.startPointer.y;

            setBox({
                x: clamp(dragState.startBox.x + dx, 0, containerSize.width - dragState.startBox.w),
                y: clamp(dragState.startBox.y + dy, 0, containerSize.height - dragState.startBox.h),
                w: dragState.startBox.w,
                h: dragState.startBox.h,
            });

            return;
        }

        // Ресайз: anchor — противоположный грабнутому углу, он остаётся неподвижным.
        const { anchor, handle } = dragState;
        const ratio = CROP_PRESETS[preset];

        const dx = pointer.x - anchor.x;
        const dy = pointer.y - anchor.y;

        const maxWidth = dx >= 0 ? containerSize.width - anchor.x : anchor.x;
        const maxHeight = dy >= 0 ? containerSize.height - anchor.y : anchor.y;

        let width = clamp(Math.abs(dx), MIN_BOX_SIZE, Math.max(MIN_BOX_SIZE, maxWidth));
        let height = ratio ? width / ratio : clamp(Math.abs(dy), MIN_BOX_SIZE, Math.max(MIN_BOX_SIZE, maxHeight));

        if (ratio && height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
        if (!ratio) {
            height = clamp(height, MIN_BOX_SIZE, Math.max(MIN_BOX_SIZE, maxHeight));
        }

        const x = dx >= 0 ? anchor.x : anchor.x - width;
        const y = dy >= 0 ? anchor.y : anchor.y - height;

        setBox({ x, y, w: width, h: height });
        void handle;
    }, [containerSize, preset]);

    const stopDrag = useCallback(() => {
        dragStateRef.current = null;
        window.removeEventListener('pointermove', updateBoxFromPointer);
        window.removeEventListener('pointerup', stopDrag);
    }, [updateBoxFromPointer]);

    const startDrag = useCallback((dragState) => {
        dragStateRef.current = dragState;
        window.addEventListener('pointermove', updateBoxFromPointer);
        window.addEventListener('pointerup', stopDrag);
    }, [updateBoxFromPointer, stopDrag]);

    const onBodyPointerDown = useCallback((event) => {
        if (!box) return;
        event.preventDefault();

        const rect = containerRef.current.getBoundingClientRect();
        startDrag({
            type: 'move',
            startPointer: { x: event.clientX - rect.left, y: event.clientY - rect.top },
            startBox: box,
        });
    }, [box, startDrag]);

    const onHandlePointerDown = useCallback((handle) => (event) => {
        if (!box) return;
        event.preventDefault();
        event.stopPropagation();

        const anchor = {
            tl: { x: box.x + box.w, y: box.y + box.h },
            tr: { x: box.x, y: box.y + box.h },
            bl: { x: box.x + box.w, y: box.y },
            br: { x: box.x, y: box.y },
        }[handle];

        startDrag({ type: 'resize', handle, anchor });
    }, [box, startDrag]);

    const HANDLE_POSITION_CLASSES = {
        tl: '-left-2 -top-2 cursor-nwse-resize',
        tr: '-right-2 -top-2 cursor-nesw-resize',
        bl: '-left-2 -bottom-2 cursor-nesw-resize',
        br: '-right-2 -bottom-2 cursor-nwse-resize',
    };

    return (
        <div className="absolute inset-0 touch-none" ref={containerRef}>
            <div className="absolute left-2 top-2 z-10 flex gap-1.5 rounded-lg bg-slate-900/70 p-1 backdrop-blur-sm" role="group" aria-label="Соотношение сторон">
                {Object.keys(CROP_PRESETS).map((key) => (
                    <button
                        key={key}
                        type="button"
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors
                            ${preset === key ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        onClick={() => onPresetChange(key)}
                    >
                        {key === 'free' ? 'Free' : key}
                    </button>
                ))}
            </div>

            {box ? (
                <>
                    <div className="pointer-events-none absolute inset-0 bg-black/50" style={{
                        clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${box.x}px ${box.y}px, ${box.x}px ${box.y + box.h}px, ${box.x + box.w}px ${box.y + box.h}px, ${box.x + box.w}px ${box.y}px, ${box.x}px ${box.y}px)`,
                    }} />
                    <div
                        className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(59,130,246,0.9)]"
                        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                        onPointerDown={onBodyPointerDown}
                    >
                        {/* Направляющие третей — как в профессиональных видеоредакторах */}
                        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="border border-white/25" />
                            ))}
                        </div>

                        {HANDLES.map((handle) => (
                            <div
                                key={handle}
                                className={`absolute h-4 w-4 rounded-full border-2 border-white bg-brand-500 shadow-md ${HANDLE_POSITION_CLASSES[handle]}`}
                                onPointerDown={onHandlePointerDown(handle)}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
