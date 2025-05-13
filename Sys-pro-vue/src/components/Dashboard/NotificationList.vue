<template>
  <div class="notification-list">
    <div class="card notification-wrapper">
      <h3>Notificaciones</h3>

      <!-- Transición animada para la entrada/salida de notificaciones -->
      <transition-group name="fade-move" tag="div">
        <div
          v-for="(notif, i) in visibleNotifs"
          :key="notif.id"
          class="notification"
          :class="notif.type"
        >
          <div class="notification-content">
            <span class="notification-icon">{{ notif.icon }}</span>
            <span class="notification-message">{{ notif.message }}</span>
          </div>

          <div class="notification-actions">
            <!-- Botón para ver detalles de la notificación -->
            <button class="btn btn-primary small" @click="$emit('show-details', notif.message)">
              Ver Detalles
            </button>
            <!-- Botón para descartar la notificación -->
            <button class="btn gray small" @click="dismiss(notif.id)">
              Descartar
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

// Props esperadas: listas de notificaciones por tipo y límite de visibles
const props = defineProps({
  success: { type: Array, required: true },
  warnings: { type: Array, required: true },
  errors: { type: Array, required: true },
  maxVisible: { type: Number, default: 3 }
})

const emit = defineEmits(['show-details'])

const visibleNotifs = ref([])  // Lista de notificaciones visibles
const allNotifs = ref([])      // Lista de todas las notificaciones

// Construye la lista visible a partir de los props
watchEffect(() => {
  let idCounter = 0
  const all = []

  // Agrega notificaciones de éxito
  props.success.forEach(msg => {
    all.push({ id: idCounter++, type: 'success', icon: '✔', message: msg })
  })

  // Agrega notificaciones de advertencia
  props.warnings.forEach(msg => {
    all.push({ id: idCounter++, type: 'warning', icon: '⚠', message: msg })
  })

  // Agrega notificaciones de error
  props.errors.forEach(msg => {
    all.push({ id: idCounter++, type: 'error', icon: '✖', message: msg })
  })

  allNotifs.value = all
  visibleNotifs.value = all.slice(0, props.maxVisible)
})

// Elimina una notificación por ID
function dismiss(id) {
  const index = allNotifs.value.findIndex(n => n.id === id)
  if (index !== -1) {
    allNotifs.value.splice(index, 1)  // Elimina la notificación de la lista
    visibleNotifs.value = allNotifs.value.slice(0, props.maxVisible)  // Actualiza las notificaciones visibles
  }
}
</script>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-wrapper {
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Contenedor de cada notificación */
.notification {
  padding: 14px;
  border-left: 4px solid transparent;
  border-radius: 8px;
  background-color: #f9fafb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  font-weight: bold;
  width: 20px;
  text-align: center;
}

.notification-message {
  flex: 1;
  color: #374151;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* Tipos de notificación */
.notification.success {
  border-left-color: #10b981;
  background-color: #ecfdf5;
}

.notification.warning {
  border-left-color: #f59e0b;
  background-color: #fff7ed;
}

.notification.error {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

/* Botón pequeño */
.btn.small {
  font-size: 0.8rem;
  padding: 5px 12px;
}

/* Transición */
.fade-move-enter-active,
.fade-move-leave-active {
  transition: all 0.3s ease;
}
.fade-move-enter-from,
.fade-move-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
