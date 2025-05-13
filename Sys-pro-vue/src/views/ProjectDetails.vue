<template>
  <main class="main-content">
    <!-- Encabezado con botones de acción -->
    <header class="main-header flex justify-between items-center">
      <button class="btn btn-secondary" @click="router.push('/project-list')" title="Volver a la lista">
        ✖ Cerrar
      </button>
      <h1 class="text-xl font-bold text-center flex-1">Detalles del Proyecto</h1>
      <button class="btn btn-danger ml-auto" @click="confirmarEliminacion">
        Eliminar
      </button>
    </header>

    <!-- Alerta si el proyecto no es editable -->
    <div v-if="edicionDeshabilitada" class="alert alert-warning mb-4">
      Este proyecto está <strong>{{ project.status }}</strong>. La edición de datos y etapas está deshabilitada.
    </div>

    <!-- Sección de resumen general -->
    <ProjectSummary
      :project="project"
      @save="guardarCambiosProyecto"
      :disabled="edicionDeshabilitada"
    />

    <!-- Sección de etapas del proyecto -->
    <StageTable
      :stages="project.stages"
      :tecnicos="tecnicosDisponibles"
      :projectId="projectId"
      :projectName="project.name"
      :disabled="edicionDeshabilitada"
      :etapaDestacada="etapaDestacada"
      @update-log="project.log = $event"
    />

    <!-- Sección de notas y log de actividad -->
    <ProjectNotes
      :log="project.log"
      v-model:note="newNote.text"
      @add="agregarComentario"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'

import ProjectSummary from '@/components/projectDetails/ProjectSummary.vue'
import StageTable from '@/components/projectDetails/StageTable.vue'
import ProjectNotes from '@/components/projectDetails/ProjectNotes.vue'
import { getCurrentUser } from '@/utils/auth'

// Constantes y referencias iniciales
const API = import.meta.env.VITE_API
const toast = useToast()
const router = useRouter()
const route = useRoute()

const projectId = route.params.id
const etapaDestacada = ref(null)
const tecnicosDisponibles = ref([])
const newNote = ref({ text: '' })

// Estructura del proyecto cargado
const project = ref({
  name: '', client: '', start: '', end: '', status: '',
  stages: [], log: []
})

// Determina si se permite edición del proyecto
const edicionDeshabilitada = computed(() =>
  ['Finalizado', 'Cancelado'].includes(project.value.status)
)

// Al cargar la vista, obtener datos iniciales
onMounted(() => {
  if (!projectId) {
    router.push('/project-list')
  } else {
    obtenerDetallesProyecto()
    obtenerTecnicos()
    const etapaId = route.query.etapa
    if (etapaId) etapaDestacada.value = parseInt(etapaId)
  }
})

// Convierte fecha ISO a formato YYYY-MM-DD para campos tipo <input type="date">
function formatearFechaAInput(fechaISO) {
  if (!fechaISO) return ''
  const date = new Date(fechaISO)
  return date.toISOString().split('T')[0]
}

// Obtiene listado de técnicos desde la API
async function obtenerTecnicos() {
  try {
    const res = await axios.get(`${API}/tecnicos`)
    tecnicosDisponibles.value = res.data
  } catch (err) {
    console.error('Error al obtener técnicos:', err)
  }
}

// Obtiene todos los datos del proyecto (info general, etapas y log)
async function obtenerDetallesProyecto() {
  try {
    const [proyRes, etapasRes, logRes] = await Promise.all([
      fetch(`${API}/projects/${projectId}`),
      fetch(`${API}/etapas/projects/${projectId}/etapas-con-horas`),
      fetch(`${API}/projects/${projectId}/log`)
    ])

    const proyecto = await proyRes.json()
    const etapas = await etapasRes.json()
    const log = await logRes.json()

    if (!Array.isArray(etapas)) {
      console.error('Las etapas no son un arreglo válido:', etapas)
      return
    }

    project.value = {
      name: proyecto.nombre_proyecto,
      client: proyecto.cliente,
      start: formatearFechaAInput(proyecto.fecha_inicio),
      end: formatearFechaAInput(proyecto.fecha_entrega),
      status: proyecto.estado,
      stages: etapas.map(e => ({
        id_etapa: e.id_etapa,
        name: e.nombre_etapa,
        tech: e.id_usuario || null,
        techName: e.tecnico || '',
        start: formatearFechaAInput(e.fecha_inicio),
        due: formatearFechaAInput(e.fecha_fin),
        estTime: e.horas_estimadas ?? '-',
        realTime: e.horas_reales ?? '-',
        status: e.estado_etapa,
        reprogrammable: e.reprogramable,
        editing: false
      })),
      log
    }
  } catch (err) {
    console.error('Error al obtener detalles del proyecto:', err)
  }
}

// Guarda los cambios realizados en la cabecera del proyecto
async function guardarCambiosProyecto(updatedProject) {
  const adminId = getCurrentUser()?.id

  // Validaciones de campos requeridos
  if (!updatedProject.name?.trim() || !updatedProject.client?.trim() ||
      !updatedProject.start || !updatedProject.end) {
    toast.error('Todos los campos del proyecto son obligatorios.')
    return
  }

  // Validación de fechas
  if (new Date(updatedProject.start) > new Date(updatedProject.end)) {
    toast.error('La fecha de inicio no puede ser posterior a la de entrega.')
    return
  }

  // Detectar cambios con respecto al estado actual
  const cambios = {}
  const campos = ['name', 'client', 'start', 'end', 'status']
  campos.forEach(campo => {
    const original = project.value[campo]?.toString().trim()
    const nuevo = updatedProject[campo]?.toString().trim()
    if (original !== nuevo) cambios[campo] = nuevo
  })

  if (Object.keys(cambios).length === 0) {
    toast.info('No se detectaron cambios.')
    return
  }

  cambios.id_usuario = adminId

  try {
    await axios.put(`${API}/projects/${projectId}`, cambios)

    // Actualiza el estado local
    Object.entries(cambios).forEach(([key, value]) => {
      if (key !== 'id_usuario') project.value[key] = value
    })

    toast.success('Proyecto actualizado correctamente')

    // Recargar log tras guardar cambios
    const logRes = await axios.get(`${API}/projects/${projectId}/log`)
    project.value.log = logRes.data
  } catch (err) {
    if (err.response?.status === 400 && err.response.data?.error?.includes('No hay cambios')) {
      toast.info('No hubo cambios que guardar.')
    } else {
      console.error('Error al guardar cambios del proyecto:', err)
      toast.error('Error al actualizar proyecto.')
    }
  }
}

// Confirma y ejecuta la eliminación del proyecto
async function confirmarEliminacion() {
  if (project.value.status === 'Finalizado') {
    toast.error('No se puede eliminar un proyecto finalizado.')
    return
  }

  const confirmado = confirm('¿Seguro que deseas eliminar este proyecto? Esta acción no se puede deshacer.')
  if (!confirmado) return

  const adminId = getCurrentUser()?.id

  try {
    await axios.delete(`${API}/projects/${projectId}`, {
      params: { id_usuario: adminId }
    })
    toast.success('Proyecto eliminado correctamente.')
    router.push('/project-list')
  } catch (err) {
    console.error('Error al eliminar proyecto:', err)
    toast.error('Error al eliminar proyecto.')
  }
}

// Agrega un nuevo comentario general al proyecto
async function agregarComentario(nuevoComentario) {
  const adminId = getCurrentUser()?.id

  if (!nuevoComentario || !nuevoComentario.trim()) {
    toast.warning('El comentario no puede estar vacío.')
    return
  }

  try {
    await axios.post(`${API}/comentarios`, {
      id_usuario: adminId,
      contenido: nuevoComentario,
      tipo: 'comentario',
      id_etapa: null
    })

    toast.success('Comentario agregado al historial del proyecto.')

    const res = await axios.get(`${API}/projects/${projectId}/log`)
    project.value.log = res.data
  } catch (err) {
    console.error('Error al agregar comentario:', err)
    toast.error('Error al guardar comentario.')
  }
}
</script>

<style scoped>
/* ────────────── Responsive específico para encabezado ────────────── */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .main-header h1 {
    width: 100%;
    font-size: 1.2rem;
    text-align: center;
  }
}
</style>
