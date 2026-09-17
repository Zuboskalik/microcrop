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
        <div className="video-uploader">
            <div
                className={`video-uploader__dropzone${isDragActive ? ' video-uploader__dropzone--active' : ''}`}
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
                <p>Перетащите видео сюда или нажмите, чтобы выбрать файл</p>
                <p className="video-uploader__hint">
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

            {error ? <p className="video-uploader__error" role="alert">{error}</p> : null}
        </div>
    );
}
