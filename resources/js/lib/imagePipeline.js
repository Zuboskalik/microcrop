/**
 * Обработка растровых изображений на клиенте (crop + resize) через Canvas.
 *
 * Аналог ffmpegPipeline.js для режима изображений (страница /image): кадрирование
 * и изменение размера выполняются локально в браузере без FFmpeg.wasm — файл
 * никуда не загружается. Формат вывода определяется по расширению (png/jpg/
 * jpeg/webp). См. ARCHITECTURE.md §4 (видео-ветка — ffmpegPipeline.js).
 */

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const EXTENSION_TO_MIME = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};

/**
 * Определяет MIME изображения по расширению имени файла (с запасным PNG).
 */
export function detectImageMime(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';

    return EXTENSION_TO_MIME[ext] ?? 'image/png';
}

/**
 * Каноничное расширение для MIME вывода (image/jpeg → jpg).
 */
export function imageExtensionFor(mime) {
    if (mime === 'image/jpeg') {
        return 'jpg';
    }
    if (mime === 'image/webp') {
        return 'webp';
    }

    return 'png';
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

function canvasToBlob(canvas, type) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(`Failed to encode image as ${type}`));
                }
            },
            type,
            0.92,
        );
    });
}

/**
 * Читает натуральные размеры изображения и определяет его формат.
 *
 * @param {File|Blob} file
 * @returns {Promise<{naturalWidth:number, naturalHeight:number, type:string, filename:string}>}
 */
export async function readImageMeta(file) {
    const url = URL.createObjectURL(file);

    try {
        const img = await loadImage(url);
        const type = file.type || detectImageMime(file.name ?? '');

        return {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            type,
            filename: file.name ?? 'image',
        };
    } finally {
        URL.revokeObjectURL(url);
    }
}

/**
 * Обрезает и масштабирует изображение, возвращая готовый Blob для скачивания.
 *
 * @param {File|Blob} file
 * @param {object} options
 * @param {{w:number,h:number,x:number,y:number}|null} options.crop  Область в пикселях исходника (null = весь кадр).
 * @param {{w:number,h:number}|null} options.resize  Итоговое разрешение (null = как после crop).
 * @param {string} [options.format]  MIME вывода; по умолчанию — формат исходного файла.
 * @returns {Promise<{blob: Blob, url: string, type: string, extension: string}>}
 */
export async function processImage(file, { crop, resize, format } = {}) {
    const url = URL.createObjectURL(file);

    try {
        const img = await loadImage(url);
        const srcWidth = img.naturalWidth;
        const srcHeight = img.naturalHeight;
        const area = crop ?? { x: 0, y: 0, w: srcWidth, h: srcHeight };

        const outWidth = Math.max(1, Math.round(resize?.w ?? area.w));
        const outHeight = Math.max(1, Math.round(resize?.h ?? area.h));

        const requested = format ?? (file.type || detectImageMime(file.name ?? ''));
        // Canvas умеет только png/jpeg/webp — всё прочее сохраняем как PNG.
        const type = IMAGE_MIME_TYPES.includes(requested) ? requested : 'image/png';

        const canvas = document.createElement('canvas');
        canvas.width = outWidth;
        canvas.height = outHeight;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // JPEG не поддерживает прозрачность — заливаем белым фоном.
        if (type === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, outWidth, outHeight);
        }

        ctx.drawImage(img, area.x, area.y, area.w, area.h, 0, 0, outWidth, outHeight);

        const blob = await canvasToBlob(canvas, type);

        return {
            blob,
            url: URL.createObjectURL(blob),
            type,
            extension: imageExtensionFor(type),
        };
    } finally {
        URL.revokeObjectURL(url);
    }
}
