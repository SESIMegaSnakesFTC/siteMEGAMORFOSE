import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `--mode singlefile` gera um único index.html (usado para a prévia online).
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [])],
  define: mode === 'singlefile' ? { 'import.meta.env.VITE_ROUTER': JSON.stringify('hash') } : {},
  build: { outDir: mode === 'singlefile' ? 'dist-preview' : 'dist' },
}));
