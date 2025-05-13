<template>
  <!-- Solo se muestra si hay un usuario autenticado -->
  <div class="layout-container" v-if="user">
    <!-- Componente Sidebar que recibe el nombre y rol del usuario -->
    <Sidebar :nombre="user.username" :rol="user.rol" />

    <!-- Contenido principal a la derecha (componente de cabecera y vistas) -->
    <div class="layout-right">
      <!-- Componente TopBar con la barra superior -->
      <TopBar />
      <!-- Sección principal para mostrar la vista actual, gestionada por vue-router -->
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
// Importación de componentes y funciones necesarias
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import { getCurrentUser } from '@/utils/auth' // Función para obtener el usuario actual
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const router = useRouter()  // Usado para redirigir a otras vistas
const user = ref(null)  // Definimos una referencia reactiva para almacenar la información del usuario

// Al montar el componente, verificamos si hay un usuario autenticado
onMounted(() => {
  const currentUser = getCurrentUser()  // Obtener el usuario actual desde localStorage o estado global

  if (!currentUser) {
    // Si no hay usuario, redirigir a la página de login
    router.push('/')
  } else {
    // Si hay usuario, almacenamos su información en la variable reactiva
    user.value = currentUser
  }
})
</script>

<style scoped>
/* Estructura del layout principal */
.layout-container {
  display: flex;
  height: 100vh;  /* Usamos toda la altura de la pantalla */
  overflow: hidden; /* Evitamos que el contenido se desborde */
}

/* Sección a la derecha donde está el contenido principal */
.layout-right {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* Estilo para el contenido principal de la página */
.layout-content {
  flex: 1;
  overflow-y: auto;  /* Permitimos desplazamiento vertical si el contenido excede el tamaño */
  padding: 24px;
  background-color: #f9fafb;  /* Fondo claro para la sección */
}
</style>
