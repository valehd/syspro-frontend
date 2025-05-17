<template>
  <div class="dashboard-container">
    <main class="main-content">
      <header class="main-header">
        <h1>{{ userName }} – {{ currentWeek }}</h1>
        <!-- Botón de retorno para el modo observador (solo visible para administradores) -->
        <button v-if="usuarioRol === 'administrador'" class="close-btn" @click="goBack">❌</button>
      </header>

      <!-- Tareas actuales asignadas -->
      <section class="card">
        <h3>Tareas Actuales</h3>
        <TaskTable :tasks="currentTasks" :idUsuario="idTecnico" tipo="current" />
      </section>

      <!-- Tareas próximas -->
      <section class="card">
        <h3>Próximas Tareas</h3>
        <TaskTable :tasks="upcomingTasks" tipo="upcoming" />
      </section>

      <!-- Historial de trabajo -->
      <section class="card">
        <h3>Registro de Horas y Comentarios</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Etapa</th>
              <th>Proyecto</th>
              <th>Inicio</th>
              <th>Término</th>
              <th>Horas</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(registro, i) in visibleHistorial" :key="i">
              <td>{{ formatDate(registro.fecha) }}</td>
              <td>{{ registro.nombre_etapa }}</td>
              <td>{{ registro.nombre_proyecto }}</td>
              <td>{{ registro.hora_inicio }}</td>
              <td>{{ registro.hora_fin || '—' }}</td>
              <td>{{ registro.horas_trabajadas || '—' }}</td>
              <td>{{ registro.comentario || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Botón para mostrar más registros -->
        <button v-if="historialHoras.length > 5" @click="verTodo = !verTodo" class="btn toggle-btn">
          {{ verTodo ? 'Ver Menos' : 'Ver Más' }}
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import TaskTable from '@/components/TechDashboard/TaskTable.vue'
import { getCurrentUser } from '@/utils/auth'

const API = import.meta.env.VITE_API
const router = useRouter()

// Variables reactivas
const userName = ref('Técnico')
const idTecnico = ref(null)
const currentTasks = ref([])  // Tareas actuales asignadas
const upcomingTasks = ref([])  // Tareas próximas
const historialHoras = ref([])  // Historial de horas trabajadas
const verTodo = ref(false)  // Controla si se muestran todos los registros del historial
const currentWeek = ref('')  // Semana actual

// Obtener el usuario actual y su rol
const usuario = getCurrentUser()
const usuarioRol = usuario?.rol
const usuarioNombre = usuario?.username

// Historial visible limitado o completo
const visibleHistorial = computed(() =>
  verTodo.value ? historialHoras.value : historialHoras.value.slice(0, 5)
)

// Valida que solo el técnico vea su propio panel
onMounted(() => {
  if (!usuarioRol || !usuarioNombre) {
    alert('Acceso no autorizado')
    router.push('/')
    return
  }

  if (usuarioRol === 'tecnico') {
    obtenerInfoTecnico()
  } else if (usuarioRol === 'administrador') {
    obtenerInfoTecnicoComoAdmin()
  }

  calcularSemanaActual()
})

// Función para regresar a la vista de técnicos (modo observador)
function goBack() {
  router.push('/tech-view')
}

// Obtiene información del técnico autenticado
async function obtenerInfoTecnico() {
  try {
    const res = await axios.get(`${API}/tecnicos`)
    const tecnico = res.data.find(
      t => t.nombre_usuario.toLowerCase().trim() === usuarioNombre.toLowerCase().trim()
    )

    if (!tecnico) {
      alert('No se encontró información del técnico.')
      router.push('/')
      return
    }

    idTecnico.value = tecnico.id_usuario
    userName.value = tecnico.nombre_usuario

 await Promise.all([cargarTareas(), cargarHistorial()])
  } catch (err) {
    console.error('Error al obtener datos del técnico:', err)
    alert('No se pudo cargar la información del usuario.')
  }
}

// Modo observador (admin): obtener técnico desde ruta temporal o memoria
async function obtenerInfoTecnicoComoAdmin() {
  const observado = localStorage.getItem('usuarioObservado') // Nombre del técnico observado
  if (!observado) {
    alert('No se ha seleccionado ningún técnico para observar.')
    router.push('/tech-view')
    return
  }

  try {
    const res = await axios.get(`${API}/tecnicos`)
    const tecnico = res.data.find(
      t => t.nombre_usuario.toLowerCase().trim() === observado.toLowerCase().trim()
    )

    if (!tecnico) {
      alert('Técnico no encontrado.')
      router.push('/tech-view')
      return
    }

    idTecnico.value = tecnico.id_usuario
    userName.value = `${tecnico.nombre_usuario} (modo observador)`
    
    await Promise.all([cargarTareas(), cargarHistorial()])

  } catch (err) {
    console.error('Error al obtener datos en modo observador:', err)
  }
}

// Carga las tareas asignadas al técnico
async function cargarTareas() {
  try {
    // Se utiliza la nueva ruta optimizada que entrega las tareas con horas trabajadas incluidas
    const response = await axios.get(`${API}/tareas/por-tecnico-con-horas/${idUsuario.value}`)
    const tareas = response.data

    const ahora = new Date()

    // Se clasifican las tareas según su fecha de inicio
    currentTasks.value = tareas.filter(
      t => new Date(t.start_date) <= ahora && t.status !== 'finalizado'
    )

    upcomingTasks.value = tareas
      .filter(t => new Date(t.start_date) > ahora && t.status !== 'finalizado')
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  } catch (err) {
    console.error('Error al cargar tareas optimizadas:', err)
  }
}

// Carga el historial de horas trabajadas por el técnico
async function cargarHistorial() {
  try {
    const res = await axios.get(`${API}/registrohoras/historial/${idUsuario.value}`)
    historialHoras.value = res.data
  } catch (err) {
    console.error('Error al obtener historial de horas:', err)
  }
}

// Calcula el rango de la semana actual
function calcularSemanaActual() {
  const hoy = new Date()
  const lunes = new Date(hoy.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)

  const opciones = { day: 'numeric', month: 'long', year: 'numeric' }
  currentWeek.value = `Semana del ${lunes.toLocaleDateString('es-CL', opciones)} al ${domingo.toLocaleDateString('es-CL', opciones)}`
}

// Formatea fechas para visualización
function formatDate(fechaISO) {
  if (!fechaISO) return '—'
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.dashboard-layout {
  position: relative;
  padding: 24px;
}

.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Botón para cerrar (modo observador) */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #dc2626;
}

/* Alineación de columnas numéricas */
.table td:nth-child(4),
.table td:nth-child(5),
.table td:nth-child(6) {
  text-align: right;
}

/* Estilo del botón toggle de historial */
.toggle-btn {
  margin-top: 12px;
  padding: 8px 14px;
  background-color: #ddd;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toggle-btn:hover {
  background-color: #bbb;
}
</style>
