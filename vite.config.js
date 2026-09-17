import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        // 127.0.0.1 явно (не 'localhost'/'::1') — иначе dev-сервер Vite и
        // Laravel-страница оказываются на разных origin с точки зрения
        // браузера, и COEP блокирует загрузку воркеров/чанков между ними.
        host: '127.0.0.1',
        // COOP/COEP нужны и при разработке через `npm run dev`, иначе
        // FFmpeg.wasm не получит SharedArrayBuffer в dev-режиме (см. §1.7 в TASKS.md).
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        },
    },
});
