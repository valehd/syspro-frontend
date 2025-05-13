<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-card">
      <h3>Comentarios de la etapa</h3>

      <!-- Lista de comentarios existentes -->
      <ul v-if="comments.length">
        <li v-for="(c, i) in comments" :key="i">
          <strong>{{ c.nombre_usuario }}</strong> ({{ formatDate(c.fecha) }}):<br />
          {{ c.contenido }}
        </li>
      </ul>
      <p v-else>Aún no hay comentarios.</p>

      <!-- Campo para agregar nuevo comentario -->
      <textarea
        v-model="nuevoComentario"
        placeholder="Escribe un comentario..."
        class="input-textarea"
      ></textarea>

      <!-- Botones del modal -->
      <div class="modal-actions">
        <button class="btn btn-success" @click="agregarComentario">Enviar</button>
        <button class="btn gray" @click="$emit('close')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: Boolean,      // Controla si el modal se muestra
  idEtapa: Number,       // Etapa relacionada con los comentarios
  idUsuario: Number      // Usuario que escribe el comentario
})

const emit = defineEmits(['close'])

const API = import.meta.env.VITE_API
const comments = ref([])
const nuevoComentario = ref('')

/**
 * Cada vez que el modal se activa, se cargan los comentarios.
 */
watch(() => props.visible, (val) => {
  if (val) fetchComentarios()
})

/**
 * Formatea la fecha a un formato legible.
 */
function formatDate(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return isNaN(date) ? '' : date.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Consulta los comentarios desde la API.
 */
async function fetchComentarios() {
  try {
    const res = await axios.get(`${API}/comentarios/${props.idEtapa}`)
    comments.value = res.data
  } catch (err) {
    console.error('Error al obtener comentarios:', err)
  }
}

/**
 * Envía un nuevo comentario si es válido.
 */
async function agregarComentario() {
  const texto = nuevoComentario.value.trim()
  if (!texto) return

  try {
    await axios.post(`${API}/comentarios`, {
      id_usuario: props.idUsuario,
      id_etapa: props.idEtapa,
      contenido: texto
    })

    nuevoComentario.value = ''
    fetchComentarios() // Actualiza la lista después de agregar
  } catch (err) {
    console.error('Error al guardar comentario:', err)
  }
}
</script>

<style scoped>
ul {
  margin-bottom: 1rem;
  padding-left: 1rem;
}
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
