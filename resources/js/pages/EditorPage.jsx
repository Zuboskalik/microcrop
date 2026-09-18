import { useCallback, useMemo, useState } from 'react';
import VideoUploader from '../components/VideoUploader.jsx';
import VideoPreview from '../components/VideoPreview.jsx';
import TimelineTrimmer from '../components/TimelineTrimmer.jsx';
import RenderingScreen from '../components/RenderingScreen.jsx';
import ProUpsellModal from '../components/ProUpsellModal.jsx';
import { useFFmpeg } from '../hooks/useFFmpeg.js';

/**
 * Собирает Uploader → Preview/CropOverlay → TimelineTrimmer → Render → Download
 * в единый экран редактора (Task 5.24). preset приходит из data-preset
 * Blade-обёртки посадочной страницы (Task 5.25, см. ARCHITECTURE.md §2.1).
 * proAccess — результат useProAccess() из app.jsx (Task 6.13).
 */
export default function EditorPage({ preset, proAccess }) {
    const [file, setFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoMeta, setVideoMeta] = useState(null); // { naturalWidth, naturalHeight, duration }
    const [cropPreset, setCropPreset] = useState(preset?.ratio ? presetRatioToKey(preset.ratio) : 'free');
    const [crop, setCrop] = useState(null);
    const [trim, setTrim] = useState(null);
    const [result, setResult] = useState(null); // { url, filename }
    const [upsellOpen, setUpsellOpen] = useState(false);

    const { render, loading, progress, error } = useFFmpeg();
    const { hasProAccess, startCheckout } = proAccess;

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

    const resetFile = useCallback(() => {
        setFile(null);
        setVideoUrl(null);
        setVideoMeta(null);
        setCrop(null);
        setTrim(null);
        setResult(null);
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
            hasProAccess,
            outputHeight,
        });

        setResult({ url, filename: `microcrop_${Date.now()}.mp4` });
    }, [canRender, render, file, crop, trim, outputHeight, hasProAccess]);

    return (
        <div className="flex flex-col gap-6">
            {!file ? (
                <VideoUploader onFileSelected={onFileSelected} />
            ) : loading ? (
                <RenderingScreen progress={progress} hasProAccess={hasProAccess} />
            ) : (
                <>
                    <div className="card overflow-hidden p-4">
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
                    </div>

                    <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-3">
                            <button type="button" className="btn-primary" disabled={!canRender} onClick={handleRender}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                    <path d="M6 4l14 8-14 8V4Z" fill="currentColor"/>
                                </svg>
                                Кадрировать и обработать
                            </button>

                            <button type="button" className="btn-secondary" onClick={resetFile}>
                                Выбрать другое видео
                            </button>
                        </div>

                        {!hasProAccess ? (
                            <button type="button" onClick={() => setUpsellOpen(true)} className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-brand-600 hover:underline">
                                Экспорт будет с водяным знаком «microcrop» · убрать за 199&nbsp;₽
                            </button>
                        ) : (
                            <span className="text-sm font-medium text-emerald-600">PRO: экспорт без водяного знака</span>
                        )}
                    </div>

                    {error ? (
                        <p role="alert" className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            Не удалось обработать видео: {error.message ?? String(error)}
                        </p>
                    ) : null}

                    {result ? (
                        <div className="card flex flex-wrap items-center justify-between gap-4 p-5 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-900">Готово!</p>
                                    <p className="text-sm text-slate-500">Видео обработано локально в вашем браузере.</p>
                                </div>
                            </div>

                            <a href={result.url} download={result.filename} className="btn-success">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                    <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Скачать MP4
                            </a>
                        </div>
                    ) : null}
                </>
            )}

            <ProUpsellModal open={upsellOpen} onClose={() => setUpsellOpen(false)} startCheckout={startCheckout} />
        </div>
    );
}

function presetRatioToKey(ratio) {
    return ['16:9', '9:16', '1:1'].includes(ratio) ? ratio : 'free';
}
