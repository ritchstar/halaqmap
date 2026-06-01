import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return;
  if (id.includes('framer-motion')) return 'vendor-motion';
  if (id.includes('@supabase')) return 'vendor-supabase';
  if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
  return 'vendor-core';
}

export default defineConfig({
  root: path.resolve(__dirname, 'lab'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-lab'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
