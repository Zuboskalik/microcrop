// Копирует self-hosted файлы FFmpeg.wasm из node_modules в public/ffmpeg,
// откуда их раздаёт Laravel/Vite dev-сервер с уже настроенными
// COOP/COEP-заголовками (см. ARCHITECTURE.md §1, resources/js/hooks/useFFmpeg.js).
//
// Используется UMD-сборка @ffmpeg/ffmpeg (ffmpeg.js/814.ffmpeg.js), а не ESM-
// импорт из npm-пакета: ESM-версия создаёт свой внутренний worker с
// {type: "module"}, а модульные worker'ы всегда фетчатся в режиме "cors" —
// это даёт cross-origin ошибку в dev-режиме (Vite-сервер на другом порту) и
// блокировку по Cross-Origin-Resource-Policy в проде, если статику отдают
// не через Laravel (см. заметку о `php artisan serve` в README.md). UMD-
// сборка создаёт классический same-origin worker и не подвержена этим
// ограничениям.
//
// Файлы не хранятся в git (см. .gitignore) — они воспроизводимы из
// зависимостей @ffmpeg/ffmpeg и @ffmpeg/core-mt при каждой установке
// (postinstall).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const destDir = join(projectRoot, 'public', 'ffmpeg');
const coreDestDir = join(destDir, 'core-mt');

mkdirSync(coreDestDir, { recursive: true });

const copies = [
    // Многопоточный core (см. useFFmpeg.js: coreURL/wasmURL/workerURL).
    [join(projectRoot, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'umd', 'ffmpeg-core.js'), join(coreDestDir, 'ffmpeg-core.js')],
    [join(projectRoot, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'umd', 'ffmpeg-core.wasm'), join(coreDestDir, 'ffmpeg-core.wasm')],
    [join(projectRoot, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'umd', 'ffmpeg-core.worker.js'), join(coreDestDir, 'ffmpeg-core.worker.js')],
    // UMD-обёртка самого @ffmpeg/ffmpeg (глобальный window.FFmpegWASM).
    [join(projectRoot, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'umd', 'ffmpeg.js'), join(destDir, 'ffmpeg.js')],
    [join(projectRoot, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'umd', '814.ffmpeg.js'), join(destDir, '814.ffmpeg.js')],
];

for (const [from, to] of copies) {
    copyFileSync(from, to);
}

console.log(`[copy-ffmpeg-core] Скопировано ${copies.length} файлов в public/ffmpeg`);
