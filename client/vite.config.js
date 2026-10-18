import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    build: {
        target: 'es2020',
        sourcemap: false,
        rollupOptions: {
            output: {
                // Split large vendor libs into their own chunks for better caching.
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'calendar': ['react-big-calendar'],
                    'charts': ['recharts'],
                    'pdf': ['jspdf', 'jspdf-autotable'],
                },
            },
        },
    },
});
