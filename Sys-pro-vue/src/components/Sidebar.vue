<template>
  <aside class="sidebar">
    <!-- Encabezado del sidebar con logo clickeable -->
    <div class="sidebar-header" @click="goToDashboard" title="Ir al Dashboard">
      <img :src="logo" alt="Logo SYS-PRO" />
    </div>

    <!-- Navegación principal -->
    <nav class="menu">
      <ul>
        <!-- Opciones solo visibles para el administrador -->
  <template v-if="props.rol === 'administrador'">

          <h4>Menú Administrador</h4>
          <li :class="{ active: route.path === '/dashboard' }">
            <RouterLink to="/dashboard"><i data-lucide="home"></i> Panel de Control</RouterLink>
          </li>
          <li :class="{ active: route.path === '/project-list' }">
            <RouterLink to="/project-list"><i data-lucide="list-checks"></i> Lista de Proyectos</RouterLink>
          </li>
          <li :class="{ active: route.path === '/global-view' }">
            <RouterLink to="/global-view"><i data-lucide="globe"></i> Vista Global</RouterLink>
          </li>
          <li :class="{ active: route.path === '/new-project' }">
            <RouterLink to="/new-project"><i data-lucide="plus-square"></i> Nuevo Proyecto</RouterLink>
          </li>
          <li :class="{ active: route.path === '/suggestions' }">
            <RouterLink to="/suggestions"><i data-lucide="lightbulb"></i> Sugerencias</RouterLink>
          </li>
          <li :class="{ active: route.path === '/tech-view' }">
            <RouterLink to="/tech-view"><i data-lucide="users"></i> Técnicos</RouterLink>
          </li>
          <li :class="{ active: route.path === '/statistics' }">
            <RouterLink to="/statistics"><i data-lucide="bar-chart-2"></i> Estadísticas</RouterLink>
          </li>
          <li :class="{ active: route.path === '/add-user' }">
            <RouterLink to="/add-user"><i data-lucide="user-plus"></i> Crear Usuario</RouterLink>
          </li>
        </template>

        <!-- Opciones para técnicos -->
<template v-if="props.rol === 'tecnico'">

          <h4>Mi Menú</h4>
          <li :class="{ active: route.path === '/tech-dashboard' }">
            <RouterLink to="/tech-dashboard"><i data-lucide="wrench"></i> Mis Tareas</RouterLink>
          </li>
        </template>
      </ul>
    </nav>

    <!-- Botón de cierre de sesión -->
    <button class="logout-btn" @click="handleLogout">
      <i data-lucide="log-out"></i> Cerrar Sesión
    </button>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import logo from '@/assets/logo.png'
import { logout } from '@/utils/auth'


const toast = useToast()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  nombre: String,
  rol: String
})

// Inicializa íconos SVG al montar
onMounted(() => {
  window.lucide?.createIcons()
})

// Redirige al dashboard al hacer clic en el logo
function goToDashboard() {
  if (rol.value === 'administrador') {
    router.push('/dashboard')
  } else if (rol.value === 'tecnico') {
    router.push('/tech-dashboard')
  }
}

// Limpia sesión y redirige al login
function handleLogout() {
  logout()
  toast.success('Sesión cerrada correctamente')
  setTimeout(() => {
    router.push('/')
  }, 800)
}


</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #1f2937;
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  height: 100vh;
  border-right: 1px solid #374151;
}

.sidebar-header {
  cursor: pointer;
}

.sidebar-header img {
  max-width: 160px;
  height: auto;
  border-radius: 10px;
  margin: 0 auto 16px;
  display: block;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu h4 {
  margin: 16px 0 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #9ca3af;
  padding-left: 4px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.menu li {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
}

.menu li:hover {
  background-color: #374151;
  transform: translateX(3px);
}

.menu .active {
  background-color: #2563eb;
  color: white;
}

.menu .active a {
  color: white !important;
}

.menu a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}


</style>
