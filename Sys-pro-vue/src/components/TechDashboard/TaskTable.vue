<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Proyecto</th>
          <th>Etapa</th>
          <th>Fecha inicio</th>
          <th>Fecha entrega</th>
          <th>Horas estimadas</th>
          <th>Horas reales</th>
          <th>Estado</th>
          <th v-if="tipo !== 'upcoming'">Finalizado</th>
          <th>Comentario</th>
          <th v-if="tipo === 'upcoming'">Comienza en</th>
          <th v-else>Temporizador</th>
          <th>💬</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(task, index) in tasks" :key="index">
          <td>{{ task.project_name }}</td>
          <td>{{ task.task_stage }}</td>
          <td>{{ formatDate(task.start_date) }}</td>
          <td>{{ formatDate(task.due_date) }}</td>
          <td>{{ task.estimated_hours || '—' }}</td>
          <td>{{ task.actual_hours || '—' }}</td>
          <td :class="['status', task.status]">{{ traducirEstado(task.status) }}</td>
          <td v-if="tipo !== 'upcoming'">{{ task.finalizado || '—' }}</td>
          <td>{{ task.comment || 'Sin comentarios' }}</td>
          <td v-if="tipo === 'upcoming'">{{ calcularInicio(task.start_date) }}</td>
          <td v-else>
            <TimerButton :idUsuario="idUsuario" :idEtapa="task.id_etapa" />
          </td>
          <td>
            <button @click="abrirComentarios(task.id_etapa)">💬</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de comentarios por etapa -->
    <StageComments
      :visible="showComments"
      :id-etapa="selectedStage"
      :id-usuario="idUsuario"
      @close="showComments = false"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import TimerButton from './TimerButton.vue'
import StageComments from './StageComments.vue'

// Props esperadas desde el padre (TechDashboard)
const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  idUsuario: {
    type: Number,
    required: true
  },
  tipo: {
    type: String, // 'current' o 'upcoming'
    default: 'current'
  }
})

const showComments = ref(false)
const selectedStage = ref(null)

// Muestra modal de comentarios para la etapa seleccionada
function abrirComentarios(idEtapa) {
  selectedStage.value = idEtapa
  showComments.value = true
}

// Formatea la fecha en formato corto
function formatDate(dateString) {
  if (!dateString) return '—'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-CL', options)
}

// Traduce estado técnico al formato visual en español
function traducirEstado(estado) {
  const map = {
    pending: 'Pendiente',
    'en progreso': 'En progreso',
    finalzado: 'Finalizado'
  }
  return map[estado?.toLowerCase()] || estado
}

// Calcula cuántos días faltan para que la tarea comience
function calcularInicio(fechaInicio) {
  const hoy = new Date()
  const inicio = new Date(fechaInicio)
  const diff = Math.ceil((inicio - hoy) / (1000 * 60 * 60 * 24))

  if (diff === 0) return 'Comienza hoy'
  if (diff === 1) return 'Mañana'
  if (diff > 1) return `En ${diff} días`
  return '—'
}
</script>
