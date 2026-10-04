import { useState } from 'react';
import CropOverlay from './CropOverlay.jsx';

/**
 * Предпросмотр изображения + рамка кадрирования поверх него. Аналог
 * VideoPreview.jsx для режима изображений (страница /image): здесь нет
 * плеера и таймлайна, только <img>. Контейнер задаёт aspect-ratio, равный
 * реальному разрешению изображения, чтобы координаты CropOverlay напрямую
 * пересчитывались в пиксели исходника (см. CropOverlay.jsx).
 *
 * @param {object} props
 * @param {string} props.src            Object URL исходного изображения.
 * @param {string} props.preset         Текущий пресет кадрирования.
 * @param {(preset: string) => void} props.onPresetChange
 * @param {(crop: object) => void} props.onCropChange
 * @param {(meta: {naturalWidth:number, naturalHeight:number}) => void} props.onLoadedMeta
 * @param {{x:number,y:number,w:number,h:number,rev:number}|null} props.externalCrop  См. CropOverlay.jsx.
 */
export default function ImagePreview({ src, preset, onPresetChange, onCropChange, onLoadedMeta, externalCrop }) {
    const [naturalSize, setNaturalSize] = useState(null);

    const handleLoad = (event) => {
        const img = event.currentTarget;
        const meta = {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
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
                <img
                    src={src}
                    onLoad={handleLoad}
                    alt=""
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
