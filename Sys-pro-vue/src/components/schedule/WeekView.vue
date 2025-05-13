<template>
  <section class="card">
    <h2 class="text-xl font-bold mb-4">Vista Semanal</h2>

    <!-- Navegación entre semanas -->
    <div class="flex items-center gap-4 mb-6">
      <button class="btn gray" @click="cambiarSemana(-7)">« Semana anterior</button>
      <span v-if="semana.length" class="font-semibold">
      Del {{ formatLongDate(semana[0]) }} al {{ formatLongDate(semana[semana.length - 1]) }}
      </span>
      <button class="btn gray" @click="cambiarSemana(7)">Semana siguiente »</button>
    </div>

    <!-- Leyenda de proyectos con colores -->
    <div class="flex flex-wrap gap-4 mb-4 text-sm">
      <span
        v-for="(item, index) in leyenda"
        :key="index"
        class="flex items-center gap-2"
      >
        <span
          class="w-4 h-4 rounded inline-block"
          :style="{ backgroundColor: item.color }"
        ></span>
        {{ item.name }}
      </span>
    </div>

    <!-- Tabla semanal de técnicos por día -->
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Técnico / Día</th>
            <th v-for="(dia, i) in semana" :key="i">
              {{ formatWeekday(dia) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tecnico, i) in tecnicos" :key="i">
            <td class="font-medium">{{ tecnico }}</td>
            <td v-for="(dia, j) in semana" :key="j">
              <div v-if="resumen[tecnico]?.[dia]?.length" class="flex flex-col gap-1">
                <div
                  v-for="(proyecto, k) in resumen[tecnico][dia]"
                  :key="k"
                  class="rounded text-xs px-2 py-1 text-center"
                  :style="getProjectStyle(proyecto)"
                >
                  {{ proyecto }}
                </div>
              </div>
              <div v-else class="text-gray-400 text-sm italic">Disponible</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Variables reactivas
const semana = ref([])         // Lunes a viernes
const tecnicos = ref([])       // Lista de técnicos
const resumen = ref({})        // Proyectos asignados por técnico y día
const leyenda = ref([])        // Colores asociados a proyectos
const fechaBase = ref(new Date()) // Fecha de referencia

// Cambia la semana visualizada
function cambiarSemana(dias) {
  fechaBase.value.setDate(fechaBase.value.getDate() + dias)
  cargarSemana()
}

// Solicita al backend la información de la semana actual
async function cargarSemana() {
  const dateParam = fechaBase.value.toISOString().slice(0, 10)
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API}/schedule/week?base=${dateParam}`)

    // Validaciones básicas
    if (!Array.isArray(data.semana) || !Array.isArray(data.tecnicos) || typeof data.resumen !== 'object') {
      console.error('Estructura de datos inesperada en /schedule/week')
      return
    }

    semana.value = data.semana
    tecnicos.value = data.tecnicos
    resumen.value = data.resumen
    leyenda.value = data.leyenda || []

  } catch (error) {
    console.error('Error al cargar vista semanal:', error)
  }
}

// Carga inicial
onMounted(() => {
  cargarSemana()
})

// Formatea fecha como "lun 4"
function formatWeekday(fecha) {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })
}

// Formatea fecha como "lunes 4 de marzo"
function formatLongDate(fecha) {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

// Devuelve los estilos para el bloque de un proyecto
function getProjectStyle(nombreProyecto) {
  const item = leyenda.value.find(p => p.name === nombreProyecto)
  const color = item?.color || '#ccc'
  return {
    backgroundColor: color,
    color: '#fff',
    borderRadius: '4px'
  }
}
</script>

<style scoped>
<style scoped>
/* ===== Título y contenedor principal ===== */
.card {
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* ===== Navegación de semanas ===== */
.flex.items-center.gap-4.mb-6 {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.font-semibold {
  font-weight: 600;
}

/* ===== Leyenda de proyectos ===== */
.flex.flex-wrap.gap-4.mb-4.text-sm {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.flex.items-center.gap-2 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.w-4.h-4.rounded.inline-block {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

/* ===== Tabla ===== */
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

/* ===== Celdas de proyectos ===== */
.rounded.text-xs.px-2.py-1.text-center {
  border-radius: 6px;
  font-size: 0.75rem;
  padding: 4px 8px;
  color: white;
  font-weight: 500;
  text-align: center;
}
</style>

