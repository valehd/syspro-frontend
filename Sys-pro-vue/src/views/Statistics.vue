<template>
  <div class="dashboard-container">
    <main class="main-content">
      <header class="main-header">
        <h1>Estadísticas</h1>
        <!-- Formulario de filtros -->
        <StatisticsForm @apply="aplicarFiltros" />
      </header>

      <!-- Sección de tarjetas de resumen -->
      <section class="cards-section">
        <!-- Tarjeta de proyectos a tiempo -->
        <div class="card clickable" @click="irAVista('proyectos')">
          <h3>Proyectos a Tiempo</h3>
          <p><strong>{{ resumen.projectsOnTime }}</strong> de {{ resumen.totalProjects }} proyectos</p>
        </div>
        <!-- Tarjeta de fases a tiempo -->
        <div class="card clickable" @click="irAVista('fases')">
          <h3>Fases a Tiempo</h3>
          <p><strong>{{ resumen.phasesOnTime }}</strong> de {{ resumen.totalPhases }} fases</p>
        </div>
        <!-- Tarjeta de fases atrasadas -->
        <div class="card clickable" @click="irAVista('retrasos')">
          <h3>Fases Atrasadas</h3>
          <p><strong>{{ resumen.delayedPhases }}</strong> con retraso</p>
        </div>
      </section>

      <!-- Comparación de horas estimadas vs reales por fase -->
      <section class="card">
        <h3>Horas Estimadas vs Reales por Fase</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Estimadas</th>
              <th>Reales</th>
              <th>Proyecto</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="etapa in horasPorEtapa" :key="etapa.id_etapa">
              <td>{{ etapa.nombre }}</td>
              <td>{{ etapa.estimadas }}</td>
              <td>{{ etapa.reales }}</td>
              <td>{{ etapa.proyecto }}</td>
              <td><button class="btn small" @click="verDetalleEtapa(etapa)">Ir</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Motivos de atraso -->
      <section class="card">
        <h3>Motivos de Atraso</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Motivo</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(motivo, i) in motivosAtraso" :key="i">
              <td>{{ motivo.motivo }}</td>
              <td>{{ motivo.cantidad }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import StatisticsForm from '@/components/statistics/StatisticsForm.vue'

const router = useRouter()

// Variables reactivas para almacenar estadísticas y datos
const resumen = ref({
  projectsOnTime: 0,
  totalProjects: 0,
  phasesOnTime: 0,
  totalPhases: 0,
  delayedPhases: 0
})

const horasPorEtapa = ref([])
const motivosAtraso = ref([])

// Al montar el componente, cargamos las estadísticas generales
onMounted(() => {
  cargarResumen()
  aplicarFiltros({})
})

// Función para cargar resumen de estadísticas
async function cargarResumen() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}/statistics/summary`)
    resumen.value = res.data
  } catch (err) {
    console.error('Error al cargar resumen:', err)
  }
}

// Función para aplicar filtros y actualizar las tablas de comparación y retrasos
async function aplicarFiltros(filtros) {
  try {
    const query = new URLSearchParams(filtros).toString()

    // Cargar comparación de horas estimadas vs reales
    const horasRes = await axios.get(`${import.meta.env.VITE_API}/statistics/hours-comparison?${query}`)
    horasPorEtapa.value = horasRes.data.map(item => ({
      id_etapa: item.id_etapa,
      id_proyecto: item.id_proyecto,
      nombre: item.nombre,
      estimadas: item.estimadas,
      reales: item.reales,
      proyecto: item.nombre_proyecto || '—'
    }))

    // Cargar motivos de atraso
    const atrasoRes = await axios.get(`${import.meta.env.VITE_API}/statistics/delay-reasons?${query}`)
    motivosAtraso.value = atrasoRes.data
  } catch (err) {
    console.error('Error al aplicar filtros:', err)
  }
}

// Función para redirigir a diferentes vistas según el tipo
function irAVista(tipo) {
  if (tipo === 'proyectos') {
    router.push('/project-list')
  } else {
    router.push('/project-details') // Puedes personalizar esta ruta si deseas una vista específica
  }
}

// Función para ver detalles de una etapa específica
function verDetalleEtapa(etapa) {
  router.push(`/project-details/${etapa.id_proyecto}?etapa=${etapa.id_etapa}`)
}
</script>

<style scoped>
.cards-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.card {
  flex: 1;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.clickable {
  cursor: pointer;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.table th,
.table td {
  padding: 8px;
  border: 1px solid #ddd;
}
</style>
