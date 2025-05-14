<template>
  <main class="main-content">
    <!-- Tarjetas resumen de estado de proyectos -->
    <section class="top-cards">
      <ResumeCard
        :enProgreso="resumen.enProgreso"
        :detenido="resumen.detenido"
        :finalizado="resumen.finalizado"
        :cancelado="resumen.cancelado"
        :atrasado="resumen.atrasado"
        :total="resumen.total"
      />

      <!-- Encabezado y botón para recargar sugerencias de tiempo libre -->
      <div class="alerts-header flex justify-between items-center mt-6 mb-2">
        <h3 class="text-lg font-semibold">Alertas de Tiempo Libre</h3>
        <button class="btn btn-secondary" @click="cargarTiemposLibres">Recargar Alertas</button>
      </div>

      <!-- Lista de bloques de tiempo disponible (sugerencias automáticas) -->
      <AlertCard
        v-for="(slot, index) in timeSlots"
        :key="index"
        :sugerencia="slot"
         @open-modal="() => handleFreeTimeDetails(slot)"
          @close="() => cerrarAlerta(index)"
          @asignar="() => asignarSugerencia(slot)"
          @ver-proyecto="() => verProyectoDesdeAlerta(slot)"

      />


      <!-- Notificaciones generadas por el backend (éxitos, advertencias, errores) -->
      <NotificationList
        :success="alerts.success"
        :warnings="alerts.warnings"
        :errors="alerts.errors"
        @show-details="handleDetails"
      />
    </section>

    <!-- Bitácora de acciones (visible opcionalmente) -->
    <section class="bitacora-section mt-6">
      <button @click="mostrarBitacora = !mostrarBitacora" class="btn btn-secondary mb-4">
        <i data-lucide="clipboard-list"></i>
        {{ mostrarBitacora ? 'Ocultar Bitácora' : 'Ver Bitácora' }}
      </button>
      <BitacoraTable v-if="mostrarBitacora" />
    </section>

    <!-- Tabla principal con listado de proyectos -->
    <section class="projects-section mt-8">
      <h2 class="text-xl font-bold mb-4">Lista de Proyectos</h2>

      <!-- Buscador de proyectos -->
      <input
        type="text"
        v-model="search"
        placeholder="Buscar por nombre o cliente..."
        class="input-search mb-2"
      />

      <!-- Meta-información de la búsqueda -->
      <p class="table-meta">
        Mostrando {{ filteredProjects.length }} proyecto<span v-if="filteredProjects.length !== 1">s</span>
      </p>

      <!-- Tabla con detalles de los proyectos -->
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Entrega</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in filteredProjects" :key="project.id">
            <td>{{ project.id }}</td>
            <td>{{ project.cliente }}</td>
            <td>{{ project.name }}</td>
            <td>{{ project.tipo }}</td>
            <td>{{ project.status }}</td>
            <td>{{ formatFecha(project.inicio) }}</td>
            <td>{{ formatFecha(project.entrega) }}</td>
            <td>
              <button class="btn btn-primary" @click="verDetalles(project.id)">Ver Detalles</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import ResumeCard from '@/components/Dashboard/ResumeCard.vue'
import AlertCard from '@/components/Dashboard/AlertCard.vue'
import NotificationList from '@/components/Dashboard/NotificationList.vue'
import BitacoraTable from '@/components/Dashboard/BitacoraTable.vue'

// Estados reactivos
const mostrarBitacora = ref(false)
const search = ref('')
const projects = ref([])
const timeSlots = ref([])
const alerts = ref({ success: [], warnings: [], errors: [] })
const resumen = ref({
  enProgreso: 0,
  detenido: 0,
  finalizado: 0,
  cancelado: 0,
  atrasado: 0,
  total: 0
})

const router = useRouter()
const API = import.meta.env.VITE_API

// Formatea una fecha al formato local legible
function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL')
}

// Redirige a la vista de detalles del proyecto
function verDetalles(id) {
  if (id) router.push(`/project-details/${id}`)
}

// Muestra detalle de una notificación inteligente
function handleDetails(msg) {
  alert('Detalles del evento: ' + msg)
}

// Muestra detalle de un hueco de tiempo libre detectado
function handleFreeTimeDetails(slot) {
  const etapa = slot.sugerencia?.etapa || 'Sin coincidencia'
  alert(`Tiempo libre detectado para ${slot.tecnico} el día ${slot.dia}.\nSugerencia: ${etapa}`)
}
 
  function cerrarAlerta(index) {
  timeSlots.value.splice(index, 1)
}

// Proyectos filtrados por nombre o cliente según término de búsqueda
const filteredProjects = computed(() => {
  const q = search.value.trim().toLowerCase()
  return projects.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q)
  )
})

// Al montar el componente se cargan todos los datos necesarios
onMounted(async () => {
  await cargarProyectos()
  await cargarAlertas()
  await cargarTiemposLibres()
})

// Consulta de proyectos y cálculo de resumen por estado
async function cargarProyectos() {
  try {
    const res = await axios.get(`${API}/projects`)
    const data = res.data

    resumen.value = {
      enProgreso: data.filter(p => p.estado === 'En Progreso').length,
      detenido: data.filter(p => p.estado === 'Detenido').length,
      finalizado: data.filter(p => p.estado === 'Finalizado').length,
      cancelado: data.filter(p => p.estado === 'Cancelado').length,
      atrasado: data.filter(p => p.estado === 'Atrasado').length,
      total: data.length
    }

    // Formato interno simplificado para la tabla
    projects.value = data.map(p => ({
      id: p.id_proyecto,
      name: p.nombre_proyecto,
      cliente: p.cliente,
      tipo: p.tipo_proyecto,
      status: p.estado,
      inicio: p.fecha_inicio,
      entrega: p.fecha_entrega
    }))
  } catch (err) {
    console.error('Error al cargar proyectos:', err)
  }
}

// Carga de notificaciones automáticas desde backend
async function cargarAlertas() {
  try {
    const res = await axios.get(`${API}/dashboard/alerts`)
    alerts.value = res.data
  } catch (error) {
    console.error('Error al cargar alertas:', error)
  }
}

// Carga de espacios de tiempo libre detectados por backend
async function cargarTiemposLibres() {
  try {
    const res = await axios.get(`${API}/suggestions`)
    timeSlots.value = res.data.sugerencias || []
  } catch (error) {
    console.error('Error al cargar tiempos libres:', error)
  }
}


  // Asigna directamente la etapa sugerida al técnico
async function asignarSugerencia(slot) {
  const etapa = slot.tarea_sugerida
  if (!etapa || !slot.id_usuario) return

  try {
    const body = {
      id_usuario: slot.id_usuario,
      id_etapa: etapa.id_etapa,
      autor: slot.id_usuario 
    }

    await axios.post(`${API}/asignarEtapa`, body)
    alert(`Etapa "${etapa.etapa}" asignada correctamente.`)
    await cargarTiemposLibres()
  } catch (err) {
    console.error('Error al asignar sugerencia:', err)
    alert('No se pudo asignar la etapa sugerida.')
  }
}

// Redirige a la vista del proyecto sugerido
function verProyectoDesdeAlerta(slot) {
  const id = slot.tarea_sugerida?.id_proyecto
  if (id) router.push(`/project-details/${id}`)
}

</script>
