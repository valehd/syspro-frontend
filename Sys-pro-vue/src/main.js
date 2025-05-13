// Importación principal de Vue
import { createApp } from 'vue'

// Estilos globales del sistema
import './style.css'        // Tipografías, layout general, login y sidebar
import './assets/base.css'  // Componentes reutilizables: cards, botones, tablas, estados

// Componente raíz de la aplicación
import App from './App.vue'

// Enrutador de la aplicación
import router from './router'

// Sistema de notificaciones toast
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Íconos Lucide para usar en todo el sistema
import { createIcons, icons } from 'lucide'

// Crear instancia principal de la aplicación
const app = createApp(App)

// Registrar plugins globales
app.use(Toast)
app.use(router)

// Montar la aplicación al DOM
app.mount('#app')

// Renderizar íconos una vez que el router esté listo
router.isReady().then(() => {
  createIcons({ icons })
})
