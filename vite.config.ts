import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths keep JS/CSS/images working under /<repo-name>/ on GitHub Pages
  // (and also when opening the preview locally).
  base: './',
  plugins: [react()],
});
