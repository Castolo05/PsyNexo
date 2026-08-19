import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirige /api/* al servidor Express en el puerto 3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // No exponer sourcemaps en producción
    sourcemap: false,
    rollupOptions: {
      // Externalizar paquetes no instalados localmente para evitar errores de build
      external: ['react-grid-layout', 'react-resizable'],
      output: {
        // Code-splitting manual: separa vendors pesados en chunks propios
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
