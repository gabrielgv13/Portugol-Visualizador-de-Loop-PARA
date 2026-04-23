import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const ownerName = process.env.GITHUB_REPOSITORY?.split('/')[0];
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserPageRepo = repositoryName && ownerName && repositoryName === `${ownerName}.github.io`;
  const basePath =
    env.VITE_BASE_PATH ||
    (mode === 'production' ? (isUserPageRepo ? '/' : repositoryName ? `/${repositoryName}/` : '/') : '/');

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
