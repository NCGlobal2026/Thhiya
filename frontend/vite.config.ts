/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    plugins: [
        tailwindcss(),
        react(),
        // Gzip compression
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024, // Only compress files > 1KB
        }),
        // Brotli compression (better compression ratio)
        viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
        }),
    ],

    build: {
        // Target modern browsers for smaller bundle
        target: 'es2020',

        // Enable minification with esbuild (built-in, no extra deps needed)
        minify: 'esbuild',

        // Chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    if (id.includes('node_modules')) {
                        if (
                            id.includes('/react/') ||
                            id.includes('/react-dom/') ||
                            id.includes('/react-router-dom/') ||
                            id.includes('/@tanstack/react-query/')
                        ) {
                            return 'react-vendor';
                        }

                        if (
                            id.includes('/framer-motion/') ||
                            id.includes('/@headlessui/react/') ||
                            id.includes('/lucide-react/')
                        ) {
                            return 'ui-vendor';
                        }

                        if (id.includes('/axios/')) {
                            return 'data-vendor';
                        }
                    }

                    return undefined;
                },
            },
        },

        // Increase chunk size warning limit (our app is properly chunked)
        chunkSizeWarningLimit: 500,

        // Compress output with gzip and brotli
        reportCompressedSize: true,
    },

    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    },

    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            thresholds: {
                lines: 80,
                statements: 80,
                functions: 80,
                branches: 75,
            },
        },
    },
});
