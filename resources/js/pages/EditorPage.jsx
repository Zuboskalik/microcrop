import { useCallback, useMemo, useState } from 'react';
import VideoUploader from '../components/VideoUploader.jsx';
import VideoPreview from '../components/VideoPreview.jsx';
import TimelineTrimmer from '../components/TimelineTrimmer.jsx';
import { useFFmpeg } from '../hooks/useFFmpeg.js';

/**
 * Собирает Uploader → Preview/CropOverlay → TimelineTrimmer → Render → Download
 * в единый экран редактора (Task 5.24). preset приходит из data-preset
 * Blade-обёртки посадочной страницы (Task 5.25, см. ARCHITECTURE.md §2.1).
 *
 * hasProAccess пока всегда false — проверка PRO-токена (useProAccess) и
 * полноценный RenderingScreen с рекламными слотами реализуются в Phase 6
 * (см. TASKS.md).
 */
export default function EditorPage({ preset }) {
    const [file, setFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoMeta, setVideoMeta] = useState(null); // { naturalWidth, naturalHeight, duration }
    const [cropPreset, setCropPreset] = useState(preset?.ratio ? presetRatioToKey(preset.ratio) : 'free');
    const [crop, setCrop] = useState(null);
    const [trim, setTrim] = useState(null);
    const [result, setResult] = useState(null); // { url, filename }

    const { render, loading, progress, error } = useFFmpeg();

    const onFileSelected = useCallback((selectedFile) => {
        setFile(selectedFile);
        setVideoUrl(URL.createObjectURL(selectedFile));
        setVideoMeta(null);
        setCrop(null);
        setTrim(null);
        setResult(null);
    }, []);

    const onLoadedMeta = useCallback((meta) => {
        setVideoMeta(meta);
        setTrim({ start: 0, end: meta.duration });
    }, []);

    const outputHeight = useMemo(() => {
        if (crop) return crop.h;
        return videoMeta?.naturalHeight ?? 1080;
    }, [crop, videoMeta]);

    const canRender = Boolean(file && videoMeta && trim);

    const handleRender = useCallback(async () => {
        if (!canRender) return;

        const { url } = await render(file, {
            crop,
            trim,
            hasProAccess: false, // Phase 6: подставить результат useProAccess()
            outputHeight,
        });

        setResult({ url, filename: `microcrop_${Date.now()}.mp4` });
    }, [canRender, render, file, crop, trim, outputHeight]);

    return (
        <div className="microcrop-editor">
            {!file ? (
                <VideoUploader onFileSelected={onFileSelected} />
            ) : (
                <>
                    <VideoPreview
                        src={videoUrl}
                        preset={cropPreset}
                        onPresetChange={setCropPreset}
                        onCropChange={setCrop}
                        onLoadedMeta={onLoadedMeta}
                    />

                    {videoMeta ? (
                        <TimelineTrimmer
                            duration={videoMeta.duration}
                            start={trim?.start ?? 0}
                            end={trim?.end ?? videoMeta.duration}
                            onChange={setTrim}
                        />
                    ) : null}

                    <div className="microcrop-editor__actions">
                        <button type="button" disabled={!canRender || loading} onClick={handleRender}>
                            {loading ? `Обработка… ${Math.round(progress * 100)}%` : 'Обработать видео'}
                        </button>
                    </div>

                    {error ? (
                        <p role="alert" className="microcrop-editor__error">
                            Не удалось обработать видео: {error.message ?? String(error)}
                        </p>
                    ) : null}

                    {result ? (
                        <a href={result.url} download={result.filename} className="microcrop-editor__download">
                            Скачать {result.filename}
                        </a>
                    ) : null}
                </>
            )}
        </div>
    );
}

function presetRatioToKey(ratio) {
    return ['16:9', '9:16', '1:1'].includes(ratio) ? ratio : 'free';
}
