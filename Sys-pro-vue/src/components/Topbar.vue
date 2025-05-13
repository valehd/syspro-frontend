<template>
  <header class="topbar">
    <div class="topbar-right">
      <!-- Muestra la fecha actual -->
      <span class="date-text">{{ currentDate }}</span>

      <!-- Muestra el nombre del usuario y su rol -->
      <div class="user-info">
        <i data-lucide="user" class="lucide-icon"></i>
        <span>{{ nombre }} ({{ rol }})</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// Declaración de variables reactivas
const user = JSON.parse(localStorage.getItem('usuarioLogeado'))
const nombre = ref(user?.username || 'Usuario')
const rol = ref(user?.rol || 'Rol')
const currentDate = ref('') // Esta línea DEBE estar antes de usar `currentDate` en funciones

// Actualiza la fecha cada minuto
function updateTime() {
  const ahora = new Date()
  currentDate.value = ahora.toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 60000)
  await nextTick()
  window.lucide?.createIcons()
})
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #1e293b;
  padding: 0.5rem 1rem;
  height: 50px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.date-text {
  font-size: 0.875rem;
  color: #cbd5e1;
  white-space: nowrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #e2e8f0;
}

.lucide-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}
</style>
