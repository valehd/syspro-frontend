<template>
  <div class="dashboard-container">
    <main class="main-content">
      <!-- Encabezado con campo de búsqueda -->
      <header class="main-header">
        <h1>Técnicos</h1>
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Buscar técnico..."
          class="input-search"
        />
      </header>

      <!-- Tarjetas de técnicos -->
      <section class="cards-section">
        <div
          v-for="tech in filteredTechs"
          :key="tech.id"
          class="card tech-card"
        >
          <h3 class="tech-name">{{ tech.name }}</h3>
          <button class="btn btn-primary mt-2" @click="goToTechDashboard(tech.username)">
            Ver Panel
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Ruta base del backend
const API = import.meta.env.VITE_API

// Variables reactivas
const technicians = ref([])
const searchTerm = ref('')
const router = useRouter()

// Cargar técnicos desde el backend
async function fetchTechnicians() {
  try {
    const res = await axios.get(`${API}/tecnicos`)

    // Validar respuesta del backend
    if (!Array.isArray(res.data)) {
      throw new Error('La respuesta del servidor no es válida')
    }

    // Estructura de los datos para la vista
    technicians.value = res.data.map(t => ({
      id: t.id_usuario,
      name: t.nombre_usuario || 'Sin nombre',
      username: t.nombre_usuario
    }))
  } catch (err) {
    console.error('Error al obtener técnicos:', err)
  }
}

// Ejecutar al montar el componente
onMounted(fetchTechnicians)

// Filtro de búsqueda
const filteredTechs = computed(() =>
  technicians.value.filter(t =>
    t.name.toLowerCase().includes(searchTerm.value.trim().toLowerCase())
  )
)

// Redirige al dashboard del técnico (modo observador)
function goToTechDashboard(username) {
  if (!username) return

  // Guardar al técnico observado en localStorage
  localStorage.setItem('usuarioObservado', username)

  // Redirigir al dashboard técnico
  router.push('/tech-dashboard')
}
</script>


<style scoped>
.cards-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.tech-card {
  flex: 1 1 280px;
  min-width: 250px;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tech-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}
</style>
