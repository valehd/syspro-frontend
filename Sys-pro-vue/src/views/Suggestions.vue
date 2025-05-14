<template>
  <div class="dashboard-container">
    <main class="main-content">
      <header class="main-header">
        <h1>Sugerencias</h1>
        <!-- Input de búsqueda para filtrar técnicos y proyectos -->
        <input type="text" v-model="search" class="input-search" placeholder="Buscar..." />
      </header>

      <!-- Técnicos con tiempo libre -->
      <section class="card">
        <h3>Técnicos con Tiempo Disponible</h3>
        <!-- Tabla de técnicos con tiempo libre y tareas sugeridas -->
        <table class="table">
          <thead>
            <tr>
              <th>Técnico</th>
              <th>Día Disponible</th>
              <th>Horas Libres</th>
              <th>Tarea Sugerida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tech, i) in filteredTechs" :key="i">
              <td>{{ tech.tecnico }}</td>
              <td>{{ tech.fecha }}</td>
              <td>{{ tech.horas_libres }}</td>
              <td>
                <span v-if="tech.tarea_sugerida">
                  {{ tech.tarea_sugerida.proyecto }} – {{ tech.tarea_sugerida.etapa }} ({{ tech.tarea_sugerida.duracion }} h)
                </span>
                <span v-else class="text-gray-400 italic">Sin coincidencias</span>
              </td>
              <td>
                <button class="btn gray" @click="goToDetails(tech.tarea_sugerida?.id_proyecto)">Ver Detalles</button>
                <button class="btn btn-primary" @click="asignarTareaSugerida(tech)">Asignar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Proyectos cortos disponibles -->
      <section class="card">
        <h3>Proyectos Cortos Disponibles</h3>
        <!-- Tabla de proyectos cortos que aún no tienen asignación -->
        <table class="table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Etapa</th>
              <th>Horas Estimadas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  <tr v-for="(stage, i) in filteredShortTasks" :key="i">
    <td>{{ stage.nombre_proyecto }}</td>
    <td>{{ stage.nombre_etapa }}</td>
    <td>{{ stage.horas_estimadas }}</td>
    <td>
      <span class="status" :class="stage.estado_etapa.toLowerCase()">
        {{ stage.estado_etapa }}
      </span>
    </td>
   <td class="acciones-cell">
  <!-- Botón para ver proyecto -->
  <button class="btn gray full-width" @click="goToDetails(stage.id_proyecto)">
    Ver Proyecto
  </button>

  <!-- Select para técnico -->
  <select
    v-model="seleccionTecnico[stage.id_etapa]"
    class="input-select mt-1 full-width"
  >
    <option disabled value="">Selecciona técnico</option>
    <option v-for="t in tecnicos" :key="t.id_usuario" :value="t.id_usuario">
      {{ t.nombre_usuario }}
    </option>
  </select>

  <!-- Botón de asignar -->
  <button
    class="btn btn-primary full-width mt-1"
    :disabled="!seleccionTecnico[stage.id_etapa]"
    @click="asignarEtapaConSelect(stage.id_etapa)"
  >
    Asignar
  </button>
</td>
  </tr>
</tbody>

        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Variables reactivas para los datos de sugerencias y proyectos cortos
const search = ref('')
const suggestions = ref([])
const shortTasks = ref([])
  const tecnicos = ref([])
const seleccionTecnico = ref({})

// Filtro de técnicos con tiempo libre
const filteredTechs = computed(() =>
  suggestions.value.filter(t =>
    Object.values(t).some(val =>
      typeof val === 'string' && val.toLowerCase().includes(search.value.toLowerCase())
    )
  )
)

// Filtro de proyectos cortos disponibles
const filteredShortTasks = computed(() =>
  shortTasks.value.filter(s =>
    Object.values(s).some(val =>
      String(val).toLowerCase().includes(search.value.toLowerCase())
    )
  )
)

// Obtención de las sugerencias de técnicos con tiempo libre
async function fetchSuggestions() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}/suggestions`)
    suggestions.value = res.data.sugerencias || []
  } catch (err) {
    console.error('Error al cargar sugerencias:', err)
  }
}

// Obtención de los proyectos cortos disponibles
async function fetchShortTasks() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}/suggestions/short-tasks`)
    shortTasks.value = res.data
  } catch (err) {
    console.error('Error al cargar tareas cortas:', err)
  }
}

// Función para asignar tarea sugerida a un técnico
async function asignarTareaSugerida(tech) {
  if (!tech?.tarea_sugerida?.id_etapa || !tech?.id_usuario) {
    alert('No hay una tarea válida para asignar.')
    return
  }

  try {
    const body = {
      id_usuario: tech.id_usuario,
      id_etapa: tech.tarea_sugerida.id_etapa,
      autor: tech.id_usuario
    }
    const res = await axios.post(`${import.meta.env.VITE_API}/asignacion`, body)
    alert(res.data.message || 'Etapa asignada correctamente.')
    fetchSuggestions()
    fetchShortTasks()
  } catch (err) {
    console.error('Error al asignar tarea sugerida:', err)
    alert('Error al asignar tarea sugerida.')
  }
}

// Función para asignar etapa manualmente a un técnico
async function asignarEtapaManual(stage) {
  const id_usuario = prompt('Ingrese el ID del técnico para asignar esta etapa:')
  if (!id_usuario || isNaN(id_usuario)) {
    alert('ID de técnico inválido.')
    return
  }

  try {
    const body = {
      id_usuario: Number(id_usuario),
      id_etapa: stage.id_etapa,

      autor: Number(id_usuario)
    }
    const res = await axios.post(`${import.meta.env.VITE_API}/asignacion`, body)
    alert(res.data.message || 'Etapa asignada correctamente.')
    fetchSuggestions()
    fetchShortTasks()
  } catch (err) {
    console.error('Error al asignar etapa manual:', err)
    alert('Error al asignar etapa.')
  }
}

// Función para navegar a los detalles de un proyecto
function goToDetails(idProyecto) {
  if (!idProyecto) {
    alert('Proyecto no disponible.')
    return
  }
  router.push(`/project-details/${idProyecto}`)
}

//obtiene la lista de técnicos disponibles en el sistema.
async function fetchTecnicos() {
  try {
    // Realiza una solicitud HTTP GET al backend para obtener los usuarios con rol "tecnico"
    const res = await axios.get(`${import.meta.env.VITE_API}/usuarios?rol=tecnico`)

    // Asigna la respuesta a la variable `tecnicos` (lista de usuarios con rol técnico)
    tecnicos.value = res.data
  } catch (err) {
    // Si ocurre un error en la solicitud, lo muestra por consola
    console.error('Error al cargar técnicos:', err)
  }
}

 //función para asignar etapa con técnico seleccionado
async function asignarEtapaConSelect(idEtapa) {
  const id_usuario = seleccionTecnico.value[idEtapa]
  if (!id_usuario) {
    alert('Debes seleccionar un técnico.')
    return
  }

  try {
    const body = {
      id_usuario: Number(id_usuario),
      id_etapa: idEtapa,
      autor: Number(id_usuario)
    }
    const res = await axios.post(`${import.meta.env.VITE_API}/asignacion`, body)
    alert(res.data.message || 'Etapa asignada correctamente.')

    // Recargar sugerencias y tareas disponibles
    fetchSuggestions()
    fetchShortTasks()

    // Limpiar selección
    seleccionTecnico.value[idEtapa] = ''
  } catch (err) {
    console.error('Error al asignar etapa:', err)
    alert('Error al asignar etapa.')
  }
}
  
// Carga inicial de datos cuando el componente es montado
onMounted(() => {
  fetchSuggestions()
  fetchShortTasks()
  fetchTecnicos()

})
</script>

<style scoped>
.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.detenido {
  background-color: #fff3cd;
  color: #856404;
}

.status.atrasado {
  background-color: #f8d7da;
  color: #721c24;
}

.status.Finalizado {
  background-color: #e2f0d9;
  color: #155724;
}
</style>
