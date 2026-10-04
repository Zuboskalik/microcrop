/**
 * Сборка FFmpeg-фильтров и аргументов команды для клиентского рендера
 * (crop + trim + водяной знак). См. ARCHITECTURE.md §4.
 *
 * Все операции выполняются локально в браузере через FFmpeg.wasm —
 * этот модуль только формирует список аргументов для ffmpeg.exec().
 */

export const INPUT_FILENAME = 'input.mp4';
export const OUTPUT_FILENAME = 'output.mp4';
export const WATERMARK_FONT_FILENAME = 'watermark.ttf';
export const WATERMARK_TEXT = 'microcrop';

/**
 * @param {object} params
 * @param {{w:number,h:number,x:number,y:number}|null} params.crop  Область кадрирования в пикселях исходного видео.
 * @param {{w:number,h:number}|null} params.resize  Итоговое разрешение после кадрирования (масштабирование).
 * @param {boolean} params.hasProAccess  true — PRO-доступ, водяной знак не накладывается.
 * @param {number} params.outputHeight  Высота итогового кадра (после crop/resize) — для масштабирования знака.
 * @returns {string}  Строка для `-vf` (пустая, если фильтры не нужны).
 */
export function buildFilterChain({ crop, resize, hasProAccess, outputHeight }) {
    const filters = [];

    if (crop) {
        filters.push(`crop=${Math.round(crop.w)}:${Math.round(crop.h)}:${Math.round(crop.x)}:${Math.round(crop.y)}`);
    }

    if (resize) {
        // Чётные ширина/высота обязательны для libx264 (yuv420p).
        const w = Math.max(2, Math.round(resize.w / 2) * 2);
        const h = Math.max(2, Math.round(resize.h / 2) * 2);
        filters.push(`scale=${w}:${h}`);
    }

    if (!hasProAccess) {
        filters.push(buildWatermarkFilter(outputHeight));
    }

    return filters.join(',');
}

/**
 * Полупрозрачный текст "microcrop" в правом нижнем углу, отступ и размер
 * шрифта масштабируются относительно высоты кадра (см. ARCHITECTURE.md §4.4).
 *
 * @param {number} outputHeight
 * @returns {string}
 */
export function buildWatermarkFilter(outputHeight) {
    const fontsize = Math.max(12, Math.round(outputHeight * 0.03));
    const margin = Math.max(8, Math.round(outputHeight * 0.02));

    return (
        `drawtext=fontfile=${WATERMARK_FONT_FILENAME}:text='${WATERMARK_TEXT}':` +
        `fontcolor=white@0.5:fontsize=${fontsize}:` +
        `x=w-tw-${margin}:y=h-th-${margin}:` +
        'box=1:boxcolor=black@0.2:boxborderw=5'
    );
}

/**
 * Формирует полный список аргументов для ffmpeg.exec() — crop, trim
 * (быстрый seek через -ss/-to до -i, см. ARCHITECTURE.md §4.6), водяной
 * знак и кодеки вывода.
 *
 * @param {object} params
 * @param {{w:number,h:number,x:number,y:number}|null} params.crop
 * @param {{w:number,h:number}|null} params.resize
 * @param {{start:number,end:number}|null} params.trim  Секунды.
 * @param {boolean} params.hasProAccess
 * @param {number} params.outputHeight
 * @returns {string[]}
 */
export function buildFfmpegArgs({ crop, resize, trim, hasProAccess, outputHeight }) {
    const args = [];

    if (trim) {
        args.push('-ss', String(trim.start), '-to', String(trim.end));
    }

    args.push('-i', INPUT_FILENAME);

    const filterChain = buildFilterChain({ crop, resize, hasProAccess, outputHeight });
    if (filterChain) {
        args.push('-vf', filterChain);
    }

    args.push(
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        OUTPUT_FILENAME,
    );

    return args;
}
