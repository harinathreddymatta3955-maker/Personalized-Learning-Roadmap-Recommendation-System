import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { handleSendOtpRequest, handleSmtpStatusRequest } from './src/services/sendOtpHandler';

const apiPlugin = (): Plugin => ({
  name: 'api-endpoints',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/send-otp') {
        handleSendOtpRequest(req, res);
      } else if (req.url === '/api/smtp-status') {
        handleSmtpStatusRequest(req, res);
      } else {
        next();
      }
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/send-otp') {
        handleSendOtpRequest(req, res);
      } else if (req.url === '/api/smtp-status') {
        handleSmtpStatusRequest(req, res);
      } else {
        next();
      }
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});
