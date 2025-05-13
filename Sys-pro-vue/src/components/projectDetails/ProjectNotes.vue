<template>
  <section class="cards-section">
    <!-- Bitácora del proyecto -->
    <div class="card">
      <h3>Bitácora del Proyecto</h3>
      <ul class="log-list">
        <li v-for="(entry, index) in visibleLog" :key="index">
          <strong>{{ formatDate(entry.fecha) }}</strong>
          {{ entry.contenido || entry.accion }}
          <span class="author">({{ entry.autor || entry.nombre_usuario }})</span>
          <span v-if="entry.etapa" class="etapa-info">[Etapa {{ entry.etapa }}]</span>
        </li>
      </ul>
      <div v-if="log.length > 5">
        <button @click="toggleExpand" class="btn gray small">
          {{ expanded ? 'Ver menos' : 'Ver más...' }}
        </button>
      </div>
    </div>

    <!-- Formulario para añadir nueva nota -->
    <div class="card">
      <h3>Nueva Nota</h3>
      <textarea
        v-model="noteText"
        class="input-textarea"
        placeholder="Escribe tu nota aquí..."
      ></textarea>
      <button class="btn btn-primary full" @click="submitNote">Agregar Nota</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

// Propiedades recibidas del componente padre
const props = defineProps({
  log: Array // Arreglo que contiene la bitácora del proyecto
})

// Eventos emitidos al componente padre
const emit = defineEmits(['add']) // Evento para agregar nueva nota a la bitácora

// Referencias reactivas para estado local
const noteText = ref('') // Texto para la nueva nota
const expanded = ref(false) // Estado de expansión del historial

/**
 * Calcula y retorna los elementos visibles del log.
 * Ordenados por fecha descendente (más recientes primero).
 * Si no está expandido, muestra solo los primeros 5 elementos.
 */
const visibleLog = computed(() => {
  return [...props.log]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, expanded.value ? props.log.length : 5)
})

/**
 * Maneja el envío de la nota.
 * Verifica que no esté vacío antes de emitir el evento.
 */
function submitNote() {
  const texto = noteText.value.trim()

  if (!texto) return // Previene envío de notas vacías

  emit('add', texto)
  noteText.value = '' // Limpia campo de texto
}

/**
 * Cambia el estado entre expandido y colapsado del log.
 */
function toggleExpand() {
  expanded.value = !expanded.value
}

/**
 * Formatea la fecha recibida a un formato local legible.
 * @param {String|Date} dateInput Fecha en formato ISO o objeto Date
 * @returns {String} Fecha formateada en español (Chile)
 */
function formatDate(dateInput) {
  if (!dateInput) return '—'

  try {
    const normalized =
      typeof dateInput === 'string' ? dateInput.replace(' ', 'T') : dateInput

    const date = new Date(normalized)

    if (isNaN(date.getTime())) return '—'

    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return '—'
  }
}
</script>

<style scoped>
/* Estilos principales para la sección de tarjetas */
.cards-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Estilos específicos para la lista de logs */
.log-list {
  list-style: none;
  padding: 0;
  margin-bottom: 12px;
}

.log-list li {
  margin-bottom: 8px;
  line-height: 1.5;
  font-size: 0.95rem;
  color: #374151;
}

.author {
  font-weight: 600;
  margin-left: 4px;
  color: #2563eb;
}

.etapa-info {
  margin-left: 6px;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Área de texto estilizada para notas nuevas */
.input-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  font-size: 0.95rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  background-color: white;
}
</style>
