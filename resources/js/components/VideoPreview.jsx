import { useEffect, useRef, useState } from 'react';
import CropOverlay from './CropOverlay.jsx';

/**
 * Плеер предпросмотра видео + рамка кадрирования поверх него (Task 5.5).
 * Контейнер задаёт свой aspect-ratio равным реальному разрешению видео —
 * это убирает letterboxing и делает координаты CropOverlay тривиальными
 * для пересчёта в пиксели исходника (см. CropOverlay.jsx).
 *
 * @param {object} props
 * @param {string} props.src            Object URL исходного видео.
 * @param {string} props.preset         Текущий пресет кадрирования.
 * @param {(preset: string) => void} props.onPresetChange
 * @param {(crop: object) => void} props.onCropChange
 * @param {(meta: {naturalWidth:number, naturalHeight:number, duration:number}) => void} props.onLoadedMeta
 * @param {number} props.currentTime    Текущее время воспроизведения (для синхронизации с таймлайном).
 * @param {{x:number,y:number,w:number,h:number,rev:number}|null} props.externalCrop  См. CropOverlay.jsx.
 */
export default function VideoPreview({ src, preset, onPresetChange, onCropChange, onLoadedMeta, currentTime, externalCrop }) {
    const videoRef = useRef(null);
    const [naturalSize, setNaturalSize] = useState(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video && typeof currentTime === 'number' && Math.abs(video.currentTime - currentTime) > 0.05) {
            video.currentTime = currentTime;
        }
    }, [currentTime]);

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;

        const meta = {
            naturalWidth: video.videoWidth,
            naturalHeight: video.videoHeight,
            duration: video.duration,
        };

        setNaturalSize({ width: meta.naturalWidth, height: meta.naturalHeight });
        onLoadedMeta?.(meta);
    };

    return (
        <div className="overflow-hidden rounded-xl bg-slate-950 shadow-inner">
            <div
                className="relative mx-auto w-full max-w-2xl"
                style={naturalSize ? { aspectRatio: `${naturalSize.width} / ${naturalSize.height}` } : { minHeight: 240 }}
            >
                <video
                    ref={videoRef}
                    src={src}
                    controls
                    onLoadedMetadata={handleLoadedMetadata}
                    className="absolute inset-0 h-full w-full object-fill"
                />

                {naturalSize ? (
                    <CropOverlay
                        naturalWidth={naturalSize.width}
                        naturalHeight={naturalSize.height}
                        preset={preset}
                        onPresetChange={onPresetChange}
                        onChange={onCropChange}
                        externalCrop={externalCrop}
                    />
                ) : null}
            </div>
        </div>
    );
}
