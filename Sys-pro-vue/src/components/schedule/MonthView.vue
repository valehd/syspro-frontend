<template>
  <section class="card">
    <h2 class="text-xl font-bold mb-4">Vista Mensual por Proyecto</h2>

    <!-- Navegación del mes -->
    <div class="flex items-center justify-between mb-4">
      <button class="btn gray" @click="cambiarMes(-1)">« Mes anterior</button>
      <span class="font-semibold text-lg">{{ nombreMesActual }}</span>
      <button class="btn gray" @click="cambiarMes(1)">Mes siguiente »</button>
    </div>

    <!-- Leyenda de estados -->
    <div class="flex flex-wrap gap-4 mb-4">
      <span v-for="(item, i) in leyenda" :key="i" class="flex items-center gap-2 text-sm">
        <span :style="{ backgroundColor: item.color }" class="w-4 h-4 rounded inline-block"></span>
        {{ item.name }}
      </span>
    </div>

    <!-- Tabla de resumen por semana -->
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Proyecto</th>
            <th v-for="(semana, i) in semanas" :key="i" class="text-center">
              Semana {{ i + 1 }}<br />
              {{ formatFecha(semana) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(proyecto, p) in proyectos" :key="p">
            <td class="font-medium">{{ proyecto.nombre }}</td>
            <td v-for="(semana, i) in semanas" :key="i" class="text-center">
              <div
                class="rounded text-xs text-white py-1 px-2"
                :style="getEstadoStyle(proyecto.resumenSemanal[`semana${i + 1}`])"
                :title="getTooltip(proyecto, `semana${i + 1}`)"
              >
                {{ proyecto.resumenSemanal[`semana${i + 1}`] || 'Inactivo' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const semanas = ref([])
const proyectos = ref([])
const leyenda = ref([])
const fechaBase = ref(new Date())

// Nombre legible del mes actual
const nombreMesActual = computed(() => {
  return fechaBase.value.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
})

// Cambia el mes y recarga los datos
function cambiarMes(direccion) {
  fechaBase.value.setMonth(fechaBase.value.getMonth() + direccion)
  cargarMes()
}

// Carga el resumen mensual desde el backend
async function cargarMes() {
  const param = fechaBase.value.toISOString().slice(0, 10)
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}/schedule/month?base=${param}`)
    semanas.value = res.data.semanas || []
    proyectos.value = res.data.proyectos || []
    leyenda.value = res.data.leyenda || []
  } catch (error) {
    console.error('Error al cargar vista mensual:', error)
  }
}

onMounted(() => {
  cargarMes()
})

// Busca el color del estado en la leyenda
function getEstadoStyle(estado) {
  const item = leyenda.value.find(l => l.name.toLowerCase() === estado?.toLowerCase())
  const color = item?.color || '#ccc'
  return {
    backgroundColor: color,
    color: '#fff',
    borderRadius: '4px',
    padding: '4px'
  }
}

// Tooltip con estado y comentario si aplica
function getTooltip(proyecto, semanaKey) {
  const estado = proyecto.resumenSemanal[semanaKey]
  if (estado === 'detenido' || estado === 'atrasado') {
    return `Motivo: ${proyecto.comentario || 'Sin comentarios'}`
  }
  return estado
}

// Formato de fecha para encabezado
function formatFecha(fechaISO) {
  const d = new Date(fechaISO)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
</script>


<style scoped>
/* ===== Contenedor principal ===== */
.card {
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

/* ===== Navegación de mes ===== */
.flex.items-center.justify-between.mb-4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.font-semibold.text-lg {
  font-size: 1.125rem;
  font-weight: 600;
}

/* ===== Leyenda visual ===== */
.flex.flex-wrap.gap-4.mb-4 {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.flex.items-center.gap-2.text-sm {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.w-4.h-4.rounded.inline-block {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

/* ===== Tabla de resumen mensual ===== */
.overflow-x-auto {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background: white;
}

.table th,
.table td {
  padding: 12px;
  border: 1px solid #e5e7eb;
  text-align: center;
  vertical-align: middle;
}

.table thead {
  background-color: #f3f4f6;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
}

/* ===== Celdas de estado ===== */
.rounded.text-xs.text-white.py-1.px-2 {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
  display: inline-block;
  text-transform: capitalize;
}
</style>
