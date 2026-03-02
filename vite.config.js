import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info', // Show server info and logs
  plugins: [
    base44({
      legacySDKImports: true, // Enable legacy SDK imports for compatibility
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});