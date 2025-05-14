<template>
  <!-- Contenedor principal de la tarjeta de alerta -->
  <div class="alert-card">
    <!-- Botón de cierre ubicado en la esquina superior derecha -->
    <button class="close-btn" @click="$emit('close')">×</button>

    <!-- Contenido interno de la alerta -->
    <div class="alert-content">
      <!-- Ícono visual para indicar tipo de alerta -->
      <div class="icon-box" aria-hidden="true">⏱</div>

      <!-- Sección de texto con los datos de la sugerencia -->
      <div class="text">
        <!-- Línea principal: técnico, fecha y horas disponibles -->
        <p class="alert-text">
          <strong>{{ sugerencia.tecnico }}</strong> tiene <strong>{{ sugerencia.horas_libres }} horas libres</strong> el
          <strong>{{ sugerencia.fecha }}</strong>.
        </p>

        <!-- Línea secundaria: muestra la tarea sugerida, si existe -->
        <p class="alert-text" v-if="sugerencia.tarea_sugerida">
          Se sugiere: <strong>{{ sugerencia.tarea_sugerida.proyecto }} – {{ sugerencia.tarea_sugerida.etapa }}</strong>
          ({{ sugerencia.tarea_sugerida.duracion }} h)
        </p>

        <!-- Mensaje alternativo si no hay tarea sugerida -->
        <p class="alert-text text-gray-500 italic" v-else>
          No se encontró ninguna tarea adecuada para ese día.
        </p>

        <!-- Botón para ver más detalles de la sugerencia -->
        <button class="btn btn-primary small" @click="$emit('open-modal')">
          Ver detalles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// propiedad que contiene toda la información relevante de la alerta
defineProps({
  sugerencia: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>

.alert-card {
  position: relative;
  border-left: 4px solid #1a73e8;
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}


.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}


.icon-box {
  font-size: 1.5rem;
  color: #1a73e8;
  margin-top: 4px;
}

/* Contenedor de texto */
.text {
  flex: 1;
}


.alert-text {
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

/* Estilo del botón pequeño */
.btn.small {
  font-size: 0.8rem;
  padding: 6px 12px;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
}

.close-btn:hover {
  color: #e53935;
}
</style>
