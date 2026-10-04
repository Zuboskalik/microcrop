import { useCallback, useRef, useState } from 'react';

const ACCEPTED_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi'];
const ACCEPTED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/avi'];
const DEFAULT_MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 МБ — см. SPECIFICATION.md §3.1.1

function getExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() ?? '';
}

function formatMegabytes(bytes) {
    return Math.round(bytes / (1024 * 1024));
}

function validateFile(file, maxSizeBytes) {
    const extension = getExtension(file.name);
    const looksLikeVideo = ACCEPTED_EXTENSIONS.includes(extension) || ACCEPTED_MIME_TYPES.includes(file.type);

    if (!looksLikeVideo) {
        return `Неподдерживаемый формат «.${extension || '?'}». Поддерживаются: ${ACCEPTED_EXTENSIONS.join(', ').toUpperCase()}.`;
    }

    if (file.size > maxSizeBytes) {
        return `Файл слишком большой (${formatMegabytes(file.size)} МБ). Максимум — ${formatMegabytes(maxSizeBytes)} МБ.`;
    }

    return null;
}

/**
 * Drag-and-Drop загрузка видео + fallback через <input type="file">.
 * См. TASKS.md Task 5.3/5.4.
 */
export default function VideoUploader({ onFileSelected, maxSizeBytes = DEFAULT_MAX_SIZE_BYTES }) {
    const inputRef = useRef(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = useCallback((file) => {
        if (!file) {
            return;
        }

        const validationError = validateFile(file, maxSizeBytes);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        onFileSelected(file);
    }, [maxSizeBytes, onFileSelected]);

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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                        <path d="M12 16V4m0 0 4 4m-4-4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>

                <div>
                    <p className="font-semibold text-slate-900">Перетащите видео сюда</p>
                    <p className="text-sm text-slate-500">или нажмите, чтобы выбрать файл на устройстве</p>
                </div>

                <span className="btn-secondary pointer-events-none">
                    Выбрать файл
                </span>

                <p className="text-xs text-slate-400">
                    {ACCEPTED_EXTENSIONS.join(', ').toUpperCase()} · до {formatMegabytes(maxSizeBytes)} МБ
                </p>

                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_MIME_TYPES.concat(ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`)).join(',')}
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
