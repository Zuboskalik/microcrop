import { useCallback, useMemo, useState } from 'react';
import VideoUploader from '../components/VideoUploader.jsx';
import VideoPreview from '../components/VideoPreview.jsx';
import TimelineTrimmer from '../components/TimelineTrimmer.jsx';
import CropDimensionFields from '../components/CropDimensionFields.jsx';
import ResizeControls from '../components/ResizeControls.jsx';
import RenderingScreen from '../components/RenderingScreen.jsx';
// Временно отключено вместе с покупкой PRO (задача «скрыть всё, что связано
// с покупкой Pro»). Оставлено закомментированным на случай будущего возвращения.
// import ProUpsellModal from '../components/ProUpsellModal.jsx';
import { useFFmpeg } from '../hooks/useFFmpeg.js';
import { useTranslation } from '../i18n/I18nProvider.jsx';

/**
 * Собирает Uploader → Preview/CropOverlay → TimelineTrimmer → Render → Download
 * в единый экран редактора (Task 5.24). preset приходит из data-preset
 * Blade-обёртки посадочной страницы (Task 5.25, см. ARCHITECTURE.md §2.1).
 * proAccess — результат useProAccess() из app.jsx (Task 6.13).
 */
export default function EditorPage({ preset, proAccess }) {
    const t = useTranslation();
    const [file, setFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoMeta, setVideoMeta] = useState(null); // { naturalWidth, naturalHeight, duration }
    const [cropPreset, setCropPreset] = useState(preset?.ratio ? presetRatioToKey(preset.ratio) : 'free');
    const [crop, setCrop] = useState(null);
    const [externalCrop, setExternalCrop] = useState(null); // {..crop, rev} — точный ввод через CropDimensionFields
    const [resize, setResize] = useState(null); // {w,h} | null — null = 100% от текущего crop
    const [trim, setTrim] = useState(null);
    const [result, setResult] = useState(null); // { url, filename }
    // Временно отключено вместе с покупкой PRO.
    // const [upsellOpen, setUpsellOpen] = useState(false);

    const { render, loading, progress, error } = useFFmpeg();
    const { hasProAccess } = proAccess;

    const onFileSelected = useCallback((selectedFile) => {
        setFile(selectedFile);
        setVideoUrl(URL.createObjectURL(selectedFile));
        setVideoMeta(null);
        setCrop(null);
        setExternalCrop(null);
        setResize(null);
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
        setExternalCrop(null);
        setResize(null);
        setTrim(null);
        setResult(null);
    }, []);

    // Кроп, изменённый перетаскиванием рамки (CropOverlay сам шлёт сюда
    // реальные пиксели видео) — сбрасывает масштаб к 100% от новой области.
    // Если рамка покрывает весь кадр, храним null: тогда FFmpeg-пайплайн
    // не применяет crop вообще и выгрузка идентична исходному видео.
    const handleCropChange = useCallback((newCrop) => {
        setCrop(isFullFrameCrop(newCrop, videoMeta) ? null : newCrop);
        setResize(null);
    }, [videoMeta]);

    // Кроп, изменённый текстовыми полями (CropDimensionFields) — дополнительно
    // "проталкивается" в CropOverlay через externalCrop, чтобы визуальная
    // рамка тоже сдвинулась.
    const handleManualCropChange = useCallback((newCrop) => {
        setCrop(isFullFrameCrop(newCrop, videoMeta) ? null : newCrop);
        setResize(null);
        setExternalCrop({ ...newCrop, rev: Date.now() });
    }, [videoMeta]);

    const baseWidth = crop ? Math.round(crop.w) : Math.round(videoMeta?.naturalWidth ?? 0);
    const baseHeight = crop ? Math.round(crop.h) : Math.round(videoMeta?.naturalHeight ?? 0);
    const resizeValue = resize ?? { w: baseWidth, h: baseHeight };

    const outputHeight = useMemo(() => {
        if (resize) return resize.h;
        if (crop) return crop.h;
        return videoMeta?.naturalHeight ?? 1080;
    }, [resize, crop, videoMeta]);

    const canRender = Boolean(file && videoMeta && trim);

    const handleRender = useCallback(async () => {
        if (!canRender) return;

        const { url } = await render(file, {
            crop,
            resize,
            trim,
            hasProAccess,
            outputHeight,
        });

        setResult({ url, filename: `microcrop_${Date.now()}.mp4` });
    }, [canRender, render, file, crop, resize, trim, outputHeight, hasProAccess]);

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
                            onCropChange={handleCropChange}
                            onLoadedMeta={onLoadedMeta}
                            externalCrop={externalCrop}
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

                    {videoMeta ? (
                        <>
                            <CropDimensionFields
                                naturalWidth={videoMeta.naturalWidth}
                                naturalHeight={videoMeta.naturalHeight}
                                crop={crop}
                                onChange={handleManualCropChange}
                            />

                            <ResizeControls
                                baseWidth={baseWidth}
                                baseHeight={baseHeight}
                                value={resizeValue}
                                onChange={setResize}
                            />
                        </>
                    ) : null}

                    <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-3">
                            <button type="button" className="btn-primary" disabled={!canRender} onClick={handleRender}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                    <path d="M6 4l14 8-14 8V4Z" fill="currentColor"/>
                                </svg>
                                {t('editor.cropAndProcess')}
                            </button>

                            <button type="button" className="btn-secondary" onClick={resetFile}>
                                {t('editor.chooseAnother')}
                            </button>
                        </div>

                        {/* Временно отключено вместе с покупкой PRO: уведомление
                            о водяном знаке и апселл PRO. Оставлено
                            закомментированным на случай будущего возвращения.
                        {!hasProAccess ? (
                            <button type="button" onClick={() => setUpsellOpen(true)} className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-brand-600 hover:underline">
                                {t('editor.watermarkNotice')}
                            </button>
                        ) : (
                            <span className="text-sm font-medium text-emerald-600">{t('editor.proNoWatermark')}</span>
                        )}
                        */}
                    </div>

                    {error ? (
                        <p role="alert" className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {t('editor.renderError', { error: error.message ?? String(error) })}
                        </p>
                    ) : null}

                    {result ? (
                        <div className="card flex flex-wrap items-center justify-between gap-4 p-5 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-900">{t('editor.done')}</p>
                                    <p className="text-sm text-slate-500">{t('editor.processedLocally')}</p>
                                </div>
                            </div>

                            <a href={result.url} download={result.filename} className="btn-success">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                    <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t('editor.downloadMp4')}
                            </a>
                        </div>
                    ) : null}
                </>
            )}

            {/* Временно отключено вместе с покупкой PRO.
            <ProUpsellModal open={upsellOpen} onClose={() => setUpsellOpen(false)} startCheckout={startCheckout} />
            */}
        </div>
    );
}

function presetRatioToKey(ratio) {
    return ['16:9', '9:16', '1:1'].includes(ratio) ? ratio : 'free';
}

/**
 * true, если область кадрирования совпадает с кадром целиком (в пределах
 * пары пикселей на округление) — значит кадрировать фактически нечего.
 */
function isFullFrameCrop(crop, meta) {
    if (!crop || !meta) {
        return false;
    }

    return (
        crop.x <= 1 &&
        crop.y <= 1 &&
        Math.abs(crop.w - meta.naturalWidth) <= 1 &&
        Math.abs(crop.h - meta.naturalHeight) <= 1
    );
}
