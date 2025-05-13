import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Configuración principal de Vite para el proyecto Vue
export default defineConfig({
  // Plugins utilizados (en este caso, soporte para Vue)
  plugins: [vue()],

  // Resolución de rutas con alias
  resolve: {
    alias: {
      // Permite usar "@" como alias para la carpeta "src"
      // Ejemplo: import MyComponent from '@/components/MyComponent.vue'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
