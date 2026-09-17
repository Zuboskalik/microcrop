import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
    buildFfmpegArgs,
    INPUT_FILENAME,
    OUTPUT_FILENAME,
    WATERMARK_FONT_FILENAME,
} from '../lib/ffmpegPipeline.js';

const CORE_BASE_URL = '/ffmpeg/core-mt';
const FFMPEG_UMD_URL = '/ffmpeg/ffmpeg.js';
const WATERMARK_FONT_URL = '/fonts/watermark-regular.ttf';

let ffmpegUmdLoadPromise = null;

/**
 * Подгружает UMD-сборку @ffmpeg/ffmpeg (window.FFmpegWASM) отдельным
 * <script> тегом вместо ESM-импорта из npm-пакета.
 *
 * Причина: ESM-версия создаёт свой внутренний worker с {type: "module"},
 * а модульные worker'ы всегда фетчатся в режиме "cors" — в dev-режиме это
 * даёт cross-origin ошибку (Vite-сервер на другом порту), а в проде —
 * блокировку по Cross-Origin-Resource-Policy, если статику отдаёт `php
 * artisan serve` (он не пропускает существующие файлы через middleware).
 * UMD-сборка создаёт классический same-origin worker, свободный от обоих
 * ограничений (см. scripts/copy-ffmpeg-core.mjs).
 */
function loadFFmpegUmd() {
    if (window.FFmpegWASM) {
        return Promise.resolve(window.FFmpegWASM);
    }

    if (!ffmpegUmdLoadPromise) {
        ffmpegUmdLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = FFMPEG_UMD_URL;
            script.onload = () => resolve(window.FFmpegWASM);
            script.onerror = () => reject(new Error('Не удалось загрузить ffmpeg.js'));
            document.head.appendChild(script);
        });
    }

    return ffmpegUmdLoadPromise;
}

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

    const getFFmpeg = useCallback(async () => {
        if (!ffmpegRef.current) {
            const { FFmpeg } = await loadFFmpegUmd();
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
        const ffmpeg = await getFFmpeg();

        if (ffmpeg.loaded) {
            setLoaded(true);
            return ffmpeg;
        }

        setLoading(true);
        setError(null);

        try {
            await ffmpeg.load({
                // classWorkerURL — тоже blob: сам браузер не должен фетчить worker-скрипт
                // по сети: под COEP:require-corp такой запрос требует явного
                // Cross-Origin-Resource-Policy заголовка, которого нет у статики,
                // отданной `php artisan serve` в обход Laravel-middleware.
                classWorkerURL: await toBlobURL('/ffmpeg/814.ffmpeg.js', 'text/javascript'),
                coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
                workerURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript'),
            });

            setLoaded(true);

            return ffmpeg;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
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

        try {
            const ffmpeg = await load();

            await ffmpeg.writeFile(INPUT_FILENAME, await fetchFile(file));

            if (!options.hasProAccess) {
                await ensureWatermarkFont(ffmpeg);
            }

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
        }
    }, [load, ensureWatermarkFont]);

    useEffect(() => {
        return () => {
            ffmpegRef.current?.terminate();
        };
    }, []);

    return { load, render, loaded, loading, progress, error };
}
