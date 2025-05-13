<template>
  <section class="card view-section">
    <h2 class="text-xl font-bold mb-4">Vista Diaria</h2>

    <!-- Fecha formateada -->
    <h3>
      Día: {{ formatFullDate(selectedDate) }}
    </h3>

    <!-- Leyenda de proyectos con color -->
    <Legend :projects="dayLegend" />

    <!-- Tabla de asignaciones por técnico y hora -->
    <table class="table">
      <thead>
        <tr>
          <th>Hora</th>
          <th v-for="(tech, i) in tecnicos" :key="i">{{ tech }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in daySchedule" :key="index">
          <td>{{ row.time }}</td>
          <td
            v-for="(tech, i) in tecnicos"
            :key="i"
            class="schedule-cell"
            :style="getBlockStyle(row.blocks, tech)"
            @click="abrirModal(row.blocks, tech, row.time)"
          >
            {{ getBlockText(row.blocks, tech) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de detalles -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <h3>Detalle de Etapa</h3>
        <p><strong>Técnico:</strong> {{ modalData.tecnico }}</p>
        <p><strong>Proyecto:</strong> {{ modalData.proyecto }}</p>
        <p><strong>Etapa:</strong> {{ modalData.etapa }}</p>
        <p><strong>Hora:</strong> {{ modalData.hora }}</p>
        <p><strong>Comentario:</strong> {{ modalData.comentario }}</p>
        <button class="btn btn-primary full" @click="showModal = false">Cerrar</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// Props recibidos desde el componente padre
defineProps({
  selectedDate: String,
  tecnicos: Array,
  daySchedule: Array,
  dayLegend: Array
})

// Estado reactivo para el modal
const showModal = ref(false)
const modalData = ref({
  tecnico: '',
  proyecto: '',
  etapa: '',
  hora: '',
  comentario: ''
})

// Retorna el nombre del proyecto asignado o 'Disponible'
function getBlockText(blocks, tecnico) {
  const block = blocks.find(b => b.tecnico === tecnico)
  return block ? block.proyecto : 'Disponible'
}

// Retorna los estilos dinámicos según el tipo de bloque
function getBlockStyle(blocks, tecnico) {
  const block = blocks.find(b => b.tecnico === tecnico)

  if (!block) {
    return { backgroundColor: '#e5e7eb', color: '#111' }
  }

  if (block.class === 'lunch-block') {
    return {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      fontStyle: 'italic'
    }
  }

  // Para bloques personalizados con color dinámico
  return {
    backgroundColor: block.color || '#999',
    color: 'white',
    borderRadius: '4px',
    padding: '4px'
  }
}

// Abre el modal con información de la asignación
function abrirModal(blocks, tecnico, hora) {
  if (hora === '13:00') return
  const block = blocks.find(b => b.tecnico === tecnico)
  if (block) {
    modalData.value = {
      tecnico: block.tecnico,
      proyecto: block.proyecto,
      etapa: block.etapa || 'Sin información',
      hora,
      comentario: block.comentario || 'Sin comentarios'
    }
    showModal.value = true
  }
}

// Formatea la fecha completa en español
function formatFullDate(fechaStr) {
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Subcomponente de leyenda visual
const Legend = {
  props: ['projects'],
  template: `
    <div style="margin: 10px 0;">
      <span
        v-for="(proj, i) in projects"
        :key="i"
        style="display: inline-block; margin-right: 15px"
      >
        <span
          :style="{
            display: 'inline-block',
            width: '15px',
            height: '15px',
            background: proj.color,
            marginRight: '5px',
            borderRadius: '3px'
          }"
        ></span>
        {{ proj.name }}
      </span>
    </div>
  `
}
</script>

<style scoped>
.view-section {
  margin-top: 16px;
}

.schedule-cell {
  cursor: pointer;
  text-align: center;
  min-width: 100px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  padding: 24px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}
</style>
