<template>
  <div class="dashboard-container">
    <main class="main-content">
      <header class="main-header">
        <!-- Título y botón para agregar nuevo proyecto -->
        <div class="header-top">
          <h1>Lista de Proyectos</h1>
          <button class="btn btn-primary" @click="irANuevoProyecto">+ Nuevo Proyecto</button>
        </div>

        <!-- Barra de búsqueda para filtrar proyectos -->
        <input
          class="input-search"
          type="text"
          v-model="searchCard"
          placeholder="Buscar proyecto..."
        />
      </header>

      <!-- Sección para listar proyectos -->
      <section class="projects-list">
        <!-- Mostrar cada proyecto con la opción de expandir para ver sus etapas -->
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
        >
          <div class="project-header" @click="toggleExpand(project)">
            <strong class="project-name">{{ project.name }}</strong>
            <span
              class="status"
              :class="project.status?.toLowerCase().replace(/\s+/g, '-')"
            >
              {{ traducirEstado(project.status) }}
            </span>
            <span class="expand-icon">{{ project.expanded ? '▲' : '▼' }}</span>
          </div>

          <!-- Tabla de etapas solo visible cuando el proyecto está expandido -->
          <table v-if="project.expanded && project.etapas?.length" class="table">
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Término</th>
                <th>Técnico</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(etapa, index) in project.etapas" :key="index">
                <td>{{ etapa.nombre_etapa }}</td>
                <td>{{ etapa.estado_etapa }}</td>
                <td>{{ formatDate(etapa.fecha_inicio) }}</td>
                <td>{{ formatDate(etapa.fecha_fin) }}</td>
                <td>{{ etapa.tecnico || '—' }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Botón para ver detalles del proyecto, solo visible cuando se expande -->
          <div v-if="project.expanded" class="action-buttons">
            <button class="btn btn-primary" @click="verDetallesProyecto(project.id)">
              Ver Detalles
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variables reactivas para el filtro de búsqueda y los proyectos
const searchCard = ref('')
const projects = ref([])

// Convierte una fecha ISO a formato local legible
function formatDate(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL')
}

// Traduce el estado desde el backend a un texto más legible en español
function traducirEstado(status) {
  const estados = {
    'En Progreso': 'En Progreso',
    'Detenido': 'Detenido',
    'Finalizado': 'Finalizado',
    'Cancelado': 'Cancelado',
    'Atrasado': 'Atrasado'
  }
  return estados[status] || status
}

// Mapea los estados de la base de datos al formato que usamos en la UI
function formatearEstadoDesdeDB(estado) {
  const map = {
    'activo': 'En Progreso',
    'detenido': 'Detenido',
    'finalizado': 'Finalizado',
    'cancelado': 'Cancelado',
    'atrasado': 'Atrasado'
  }
  return map[estado] || estado
}

// Carga inicial de proyectos al montar el componente
onMounted(async () => {
  try {
    // Realiza la solicitud para obtener los proyectos
    const res = await fetch('http://localhost:3001/projects')
    const data = await res.json()

    // Mapea los proyectos y formatea sus datos
    projects.value = data.map(p => ({
      id: p.id_proyecto,
      name: p.nombre_proyecto,
      status: formatearEstadoDesdeDB(p.estado),
      expanded: false,
      etapas: []
    }))
  } catch (err) {
    console.error('Error al cargar proyectos:', err)
  }
})

// Computa los proyectos filtrados según la búsqueda
const filteredProjects = computed(() => {
  return projects.value.filter(p =>
    p.name.toLowerCase().includes(searchCard.value.toLowerCase())
  )
})

// Expande o contrae la vista de etapas de un proyecto
async function toggleExpand(project) {
  project.expanded = !project.expanded

  // Si el proyecto está siendo expandido y no tiene etapas cargadas, las obtenemos
  if (project.expanded && !project.etapas.length) {
    try {
      const res = await fetch(`http://localhost:3001/projects/${project.id}/etapas`)
      const data = await res.json()
      project.etapas = data
    } catch (error) {
      console.warn('No se pudieron cargar las etapas:', error)
    }
  }
}

// Redirige a la página para crear un nuevo proyecto
function irANuevoProyecto() {
  router.push('/new-project')
}

// Redirige a los detalles del proyecto seleccionado
function verDetallesProyecto(id) {
  router.push(`/project-details/${id}`)
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.main-header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-search {
  width: 100%;
  padding: 8px;
  margin-top: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.project-header:hover {
  background-color: #f3f4f6;
}

.expand-icon {
  font-size: 0.85rem;
  color: #888;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.status {
  font-weight: 500;
}
</style>
