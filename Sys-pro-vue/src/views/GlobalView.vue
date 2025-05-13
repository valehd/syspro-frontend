<template>
  <div class="dashboard-layout">
    <main class="main-content">
      <!-- Encabezado de la vista -->
      <header class="main-header">
        <h1>Vista Global de Agenda</h1>
      </header>

      <!-- Botones para alternar entre vistas -->
      <div class="view-toggle">
        <button
          v-for="view in views"
          :key="view.name"
          @click="currentView = view.name"
          :class="['toggle-btn', { active: currentView === view.name }]"
        >
          {{ view.label }}
        </button>
      </div>

      <!-- Componente dinámico según vista seleccionada -->
      <component
        v-if="viewComponents[currentView]"
        :is="viewComponents[currentView]"
        v-bind="getViewProps()"
      />
    </main>
  </div>
</template>

<script setup>
// Importación de funciones de Vue y dependencias externas
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Importación de vistas globales
import DayView from '@/components/schedule/DayView.vue'
import WeekView from '@/components/schedule/WeekView.vue'
import MonthView from '@/components/schedule/MonthView.vue'

// Mapeo de componentes disponibles
const viewComponents = {
  DayView,
  WeekView,
  MonthView
}

// Definición de vistas disponibles con nombre e identificador visual
const views = [
  { name: 'DayView', label: 'Día' },
  { name: 'WeekView', label: 'Semana' },
  { name: 'MonthView', label: 'Mes' }
]

const currentView = ref('DayView') // Vista inicial

// Variables de estado
const selectedDate = ref(new Date().toISOString().slice(0, 10)) // Fecha actual
const tecnicos = ref([])         // Lista de técnicos activos ese día
const daySchedule = ref([])      // Horario por hora y técnico
const dayLegend = ref([])        // Leyenda de colores por proyecto

// Carga de datos al montar la vista
onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}/schedule/day?date=${selectedDate.value}`)
    tecnicos.value = res.data.tecnicos
    daySchedule.value = res.data.horario
    dayLegend.value = res.data.leyenda || []
  } catch (error) {
    console.error('Error al cargar datos de la vista diaria:', error)
  }
})

// Retorna las propiedades necesarias para cada vista
function getViewProps() {
  if (currentView.value === 'DayView') {
    return {
      selectedDate: selectedDate.value,
      tecnicos: tecnicos.value,
      daySchedule: daySchedule.value,
      dayLegend: dayLegend.value
    }
  }
  return {}
}
</script>

<style scoped>
/* Estilos de los botones de navegación entre vistas */
.view-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #e5e7eb;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background-color: #d1d5db;
}

.toggle-btn.active {
  background-color: #1a73e8;
  color: white;
}
</style>
