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
        // COOP/COEP — задел на многопоточный режим FFmpeg.wasm (см. §1.7 в
        // TASKS.md). 'credentialless', а не 'require-corp' — иначе сторонние
        // скрипты (РСЯ) без Cross-Origin-Resource-Policy браузер блокирует
        // молча (см. Task 7.5/7.6 в TASKS.md и CrossOriginIsolationHeaders.php).
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'credentialless',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        },
    },
});
