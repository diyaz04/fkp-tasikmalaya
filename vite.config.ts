import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

  console.log('--- CLOUDINARY CONFIG LOADED IN VITE ---');
  console.log('Cloud Name:', cloudName ? `FOUND (${cloudName})` : 'NOT FOUND');
  console.log('Upload Preset:', uploadPreset ? `FOUND (${uploadPreset})` : 'NOT FOUND');
  console.log('----------------------------------------');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(cloudName),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(uploadPreset),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
