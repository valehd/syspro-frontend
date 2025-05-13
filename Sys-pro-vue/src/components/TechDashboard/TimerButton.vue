<template>
  <div class="timer-container">
    <button class="btn btn-primary small" @click="alternarTimer">
      <span v-if="!activo">Iniciar</span>
      <span v-else>Detener</span>
    </button>
    <span class="timer-status">
      <span v-if="activo">{{ tiempoFormateado }}</span>
      <span v-else class="disponible-label">Inactivo</span>
    </span>
  </div>

  <div v-if="mensaje" class="toast-message">{{ mensaje }}</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Props requeridas para funcionar correctamente
const props = defineProps({
  idUsuario: { type: Number, required: true },
  idEtapa: { type: Number, required: true }
})

const API = import.meta.env.VITE_API

// Estados reactivos
const activo = ref(false)
const horaInicio = ref(null)
const transcurrido = ref(0)
const mensaje = ref(null)
let intervalo = null

// Formatea el tiempo transcurrido a hh:mm:ss
const tiempoFormateado = computed(() => {
  const totalSegundos = Math.floor(transcurrido.value / 1000)
  const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0')
  const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0')
  const segundos = (totalSegundos % 60).toString().padStart(2, '0')
  return `${horas}:${minutos}:${segundos}`
})

// Verifica si ya hay un timer activo al montar el componente
onMounted(async () => {
  try {
    const res = await axios.get(`${API}/registrohoras/activo/${props.idUsuario}/${props.idEtapa}`)
    if (res.data.running) {
      activo.value = true
      horaInicio.value = new Date(`1970-01-01T${res.data.startedAt}Z`)
      iniciarIntervalo()
    }
  } catch (err) {
    console.error('Error al verificar timer activo:', err)
  }
})

// Inicia o detiene el timer
function alternarTimer() {
  if (!activo.value) {
    // Iniciar
    horaInicio.value = new Date()
    activo.value = true
    iniciarIntervalo()
    iniciarRegistro(horaInicio.value)
  } else {
    // Detener
    clearInterval(intervalo)
    activo.value = false
    detenerRegistro(new Date())
    transcurrido.value = 0
  }
}

// Inicia intervalo local para mostrar tiempo en pantalla
function iniciarIntervalo() {
  intervalo = setInterval(() => {
    transcurrido.value = new Date() - horaInicio.value
  }, 1000)
}

// Llama al backend para registrar el inicio de jornada
async function iniciarRegistro(inicio) {
  const payload = {
    id_usuario: props.idUsuario,
    id_etapa: props.idEtapa,
    hora_inicio: inicio.toTimeString().split(' ')[0]
  }

  if (!payload.id_etapa || !payload.id_usuario) return

  try {
    await axios.post(`${API}/registrohoras/start`, payload)
    mostrarMensaje('Registro de tiempo iniciado.')
  } catch (err) {
    console.error('Error al iniciar registro:', err)
  }
}

// Llama al backend para cerrar el registro
async function detenerRegistro(fin) {
  try {
    await axios.put(`${API}/registrohoras/stop`, {
      id_usuario: props.idUsuario,
      id_etapa: props.idEtapa,
      hora_fin: fin.toTimeString().split(' ')[0]
    })
    mostrarMensaje('Registro de tiempo finalizado.')
  } catch (err) {
    console.error('Error al detener registro:', err)
  }
}

// Muestra un mensaje temporal tipo toast
function mostrarMensaje(texto) {
  mensaje.value = texto
  setTimeout(() => {
    mensaje.value = null
  }, 3000)
}
</script>

<style scoped>
.timer-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-status {
  font-size: 0.8rem;
  color: #374151;
}

.disponible-label {
  color: #9ca3af;
  font-style: italic;
}

.toast-message {
  position: absolute;
  top: -40px;
  left: 0;
  background-color: #16a34a;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  animation: fade-in-out 3s ease-in-out;
}

@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(-10px); }
  10%, 90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
</style>
