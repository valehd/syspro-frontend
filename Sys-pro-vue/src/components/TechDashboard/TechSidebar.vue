<template>
  <aside class="sidebar">
    <!-- Encabezado con logo clickeable -->
    <div class="sidebar-header" @click="irAlDashboard">
      <img :src="logo" alt="Logo SYS-PRO" />
    </div>

    <!-- Información del usuario -->
    <div class="user-info">
      <i data-lucide="user"></i>
      <span>{{ userName }}</span>
    </div>

    <!-- Menú de navegación -->
    <nav class="menu">
      <ul>
        <li :class="{ active: route.path === '/tech-dashboard' }" @click="irAlDashboard">
          <i data-lucide="home"></i>
          <span>Inicio</span>
        </li>
      </ul>
    </nav>

    <!-- Cierre de sesión -->
    <div class="logout">
      <RouterLink to="/">
        <i data-lucide="log-out"></i> Cerrar sesión
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.png'

const route = useRoute()
const router = useRouter()
const userName = ref('Técnico')

// Capitaliza cada palabra del nombre
function capitalizarNombre(nombre) {
  return nombre
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

// Redirige al dashboard solo si no está ya en él
function irAlDashboard() {
  if (route.path !== '/tech-dashboard') {
    router.push('/tech-dashboard')
  }
}

// Carga el nombre del técnico desde localStorage y genera íconos
onMounted(() => {
  const nombreGuardado = localStorage.getItem('tecnicoNombre') || 'Técnico'
  userName.value = capitalizarNombre(nombreGuardado)
  window.lucide?.createIcons()
})
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  padding: 20px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #1e2a36;
}

.sidebar-header img {
  max-width: 140px;
  height: auto;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 1rem;
}

.user-info i {
  width: 20px;
  height: 20px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu li:hover,
.menu .active {
  background-color: #34495e;
}

.logout {
  margin-top: 20px;
  text-align: center;
}

.logout a {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-weight: bold;
  color: #ecf0f1;
  text-decoration: none;
}
</style>
