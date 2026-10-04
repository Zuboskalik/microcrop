import { useCallback, useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
    buildFfmpegArgs,
    INPUT_FILENAME,
    OUTPUT_FILENAME,
    WATERMARK_FONT_FILENAME,
} from '../lib/ffmpegPipeline.js';

const CORE_BASE_URL = '/ffmpeg/core';
const WATERMARK_FONT_URL = '/fonts/watermark-regular.ttf';

/**
 * Инкапсулирует жизненный цикл FFmpeg.wasm: загрузку core в Web Worker,
 * запись входного файла в virtual FS, запуск рендера с прогрессом и
 * чтение результата. Сам рендер выполняется в отдельном воркере —
 * UI-поток не блокируется (см. TASKS.md Task 5.12/5.16/5.26).
 */
export function useFFmpeg() {
    const ffmpegRef = useRef(null);
    const fontLoadedRef = useRef(false);

    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const getFFmpeg = useCallback(() => {
        if (!ffmpegRef.current) {
            ffmpegRef.current = new FFmpeg();
            ffmpegRef.current.on('progress', ({ progress: p }) => {
                // progress иногда приходит вне диапазона [0,1] на коротких клипах —
                // подстраховываемся clamp'ом, чтобы прогресс-бар не "прыгал".
                setProgress(Math.min(1, Math.max(0, p)));
            });
        }

        return ffmpegRef.current;
    }, []);

    const load = useCallback(async () => {
        const ffmpeg = getFFmpeg();

        if (ffmpeg.loaded) {
            setLoaded(true);
            return ffmpeg;
        }

        setError(null);

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            setLoaded(true);

            return ffmpeg;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, [getFFmpeg]);

    const ensureWatermarkFont = useCallback(async (ffmpeg) => {
        if (fontLoadedRef.current) {
            return;
        }

        await ffmpeg.writeFile(WATERMARK_FONT_FILENAME, await fetchFile(WATERMARK_FONT_URL));
        fontLoadedRef.current = true;
    }, []);

    /**
     * @param {File|Blob} file  Исходное видео.
     * @param {object} options
     * @param {{w:number,h:number,x:number,y:number}|null} options.crop
     * @param {{start:number,end:number}|null} options.trim
     * @param {boolean} options.hasProAccess
     * @param {number} options.outputHeight
     * @returns {Promise<{blob: Blob, url: string}>}
     */
    const render = useCallback(async (file, options) => {
        setError(null);
        setProgress(0);
        setLoading(true);

        try {
            const ffmpeg = await load();

            await ffmpeg.writeFile(INPUT_FILENAME, await fetchFile(file));

            // Временно отключено вместе с покупкой PRO: водяной знак больше
            // не накладывается, поэтому шрифт для drawtext не загружаем.
            // Оставлено закомментированным на случай будущего возвращения.
            // if (!options.hasProAccess) {
            //     await ensureWatermarkFont(ffmpeg);
            // }

            const args = buildFfmpegArgs(options);
            await ffmpeg.exec(args);

            const data = await ffmpeg.readFile(OUTPUT_FILENAME);
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            // Освобождаем virtual FS от входного/выходного файла — на клиенте
            // это может быть сотни МБ, держать их дальше не нужно.
            await ffmpeg.deleteFile(INPUT_FILENAME).catch(() => {});
            await ffmpeg.deleteFile(OUTPUT_FILENAME).catch(() => {});

            return { blob, url };
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [load, ensureWatermarkFont]);

    useEffect(() => {
        return () => {
            ffmpegRef.current?.terminate();
        };
    }, []);

    return { load, render, loaded, loading, progress, error };
}
