<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <h3>Agregar comentario a {{ etapaSeleccionadaNombre }}</h3>

      <!-- Área de texto para el nuevo comentario -->
      <textarea
        v-model="nuevoComentario"
        placeholder="Escribe tu comentario..."
        rows="4"
        class="input-textarea"
      ></textarea>

      <!-- Botones de acción -->
      <div class="modal-actions">
        <button @click="enviarComentario" class="btn btn-success">Enviar</button>
        <button @click="$emit('cerrar-modal')" class="btn gray">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

const props = defineProps({
  // Nombre de la etapa que se está comentando (solo para mostrar en el modal)
  etapaSeleccionadaNombre: String
})

const emit = defineEmits(['cerrar-modal', 'enviar-comentario'])

const nuevoComentario = ref('')

/**
 * Envía el comentario si tiene contenido válido (no vacío).
 * Luego lo resetea.
 */
function enviarComentario() {
  const texto = nuevoComentario.value.trim()

  if (!texto) return // Evita comentarios vacíos

  emit('enviar-comentario', texto)
  nuevoComentario.value = ''
}
</script>

<style scoped>
.input-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
