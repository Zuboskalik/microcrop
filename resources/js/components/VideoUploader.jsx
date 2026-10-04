import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider.jsx';

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/avi'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Лимиты размера: видео — 500 МБ (см. SPECIFICATION.md §3.1.1), изображения
// обрабатываются в памяти через Canvas, поэтому ограничены скромнее.
const MAX_SIZE_BYTES = {
    video: 500 * 1024 * 1024,
    image: 25 * 1024 * 1024,
};

function getExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() ?? '';
}

function formatMegabytes(bytes) {
    return Math.round(bytes / (1024 * 1024));
}

function validateFile(file, { extensions, mimeTypes, maxSizeBytes, t }) {
    const extension = getExtension(file.name);
    const looksValid = extensions.includes(extension) || mimeTypes.includes(file.type);
    const formats = extensions.join(', ').toUpperCase();

    if (!looksValid) {
        return t('uploader.errorUnsupported', { ext: extension || '?', formats });
    }

    if (file.size > maxSizeBytes) {
        return t('uploader.errorTooLarge', {
            size: formatMegabytes(file.size),
            max: formatMegabytes(maxSizeBytes),
        });
    }

    return null;
}

/**
 * Drag-and-Drop загрузка файла + fallback через <input type="file">.
 * См. TASKS.md Task 5.3/5.4.
 *
 * mode ('video' | 'image') переключает допустимые форматы и лимит размера —
 * интерфейс остаётся тем же для страницы видео и страницы изображений (/image).
 */
export default function VideoUploader({ onFileSelected, mode = 'video', maxSizeBytes }) {
    const t = useTranslation();
    const inputRef = useRef(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [error, setError] = useState(null);

    const isImage = mode === 'image';

    const config = useMemo(() => {
        const extensions = isImage ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
        const mimeTypes = isImage ? IMAGE_MIME_TYPES : VIDEO_MIME_TYPES;

        return {
            extensions,
            mimeTypes,
            maxSizeBytes: maxSizeBytes ?? MAX_SIZE_BYTES[mode] ?? MAX_SIZE_BYTES.video,
        };
    }, [isImage, mode, maxSizeBytes]);

    const accept = useMemo(
        () => config.mimeTypes.concat(config.extensions.map((ext) => `.${ext}`)).join(','),
        [config],
    );

    const handleFile = useCallback((file) => {
        if (!file) {
            return;
        }

        const validationError = validateFile(file, { ...config, t });

        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        onFileSelected(file);
    }, [config, onFileSelected, t]);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        setIsDragActive(false);
        handleFile(event.dataTransfer.files?.[0]);
    }, [handleFile]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDragActive(true);
    }, []);

    const onDragLeave = useCallback(() => setIsDragActive(false), []);

    const onInputChange = useCallback((event) => {
        handleFile(event.target.files?.[0]);
        // сбрасываем value, чтобы повторный выбор того же файла тоже сработал
        event.target.value = '';
    }, [handleFile]);

    return (
        <div className="card p-8">
            <div
                className={`group flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-all duration-150
                    ${isDragActive
                        ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                        : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/40'}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        inputRef.current?.click();
                    }
                }}
            >
                <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/30 transition-transform duration-200
                    ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {isImage ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>
                            <path d="M21 16l-5-5L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                            <path d="M12 16V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </span>

                <div>
                    <p className="font-semibold text-slate-900">{t('uploader.dropHere')}</p>
                    <p className="text-sm text-slate-500">{t('uploader.orClick')}</p>
                </div>

                <span className="btn-secondary pointer-events-none">
                    {t('uploader.chooseFile')}
                </span>

                <p className="text-xs text-slate-400">
                    {t('uploader.formats', {
                        formats: config.extensions.join(', ').toUpperCase(),
                        size: formatMegabytes(config.maxSizeBytes),
                    })}
                </p>

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={onInputChange}
                    hidden
                />
            </div>

            {error ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>
            ) : null}
        </div>
    );
}
