// Копирует self-hosted core-файлы FFmpeg.wasm (@ffmpeg/core, однопоточная
// сборка) из node_modules в public/ffmpeg/core, откуда их раздаёт
// Laravel/Vite dev-сервер с уже настроенными COOP/COEP-заголовками (см.
// ARCHITECTURE.md §1, resources/js/hooks/useFFmpeg.js).
//
// Почему однопоточное ядро, а не @ffmpeg/core-mt: многопоточная сборка
// сама создаёт пул internal pthread-воркеров через blob: URL изнутри
// основного FFmpeg-воркера — эта цепочка worker-в-воркере оказалась
// ненадёжной (тихо зависает без ошибки в ряде окружений). Однопоточное
// ядро не создаёт дополнительных воркеров и работает предсказуемо; для
// клиентского crop/trim/watermark на коротких клипах эта разница в
// скорости не критична. COOP/COEP-заголовки всё равно оставлены — они
// не мешают однопоточному режиму и позволяют перейти на core-mt позже.
//
// ESM-сборка обязательна: worker самого @ffmpeg/ffmpeg всегда создаётся
// как module-worker ({type: "module"}), и внутри пытается `import()` core —
// UMD-сборка core для этого не подходит ("failed to import ffmpeg-core.js").
//
// Файлы не хранятся в git (см. .gitignore) — они воспроизводимы из
// зависимости @ffmpeg/core при каждой установке (postinstall).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(projectRoot, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const destDir = join(projectRoot, 'public', 'ffmpeg', 'core');

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

mkdirSync(destDir, { recursive: true });

for (const file of files) {
    copyFileSync(join(srcDir, file), join(destDir, file));
}

console.log(`[copy-ffmpeg-core] Скопировано ${files.length} файлов в public/ffmpeg/core`);
