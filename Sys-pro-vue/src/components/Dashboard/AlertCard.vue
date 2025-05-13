<template>
  <div class="card alert-card">
    <div class="alert-content">
      <!-- Indicador visual de alerta con ícono de reloj -->
      <div class="icon-box" aria-hidden="true">⏱</div>

      <!-- Descripción del tiempo libre disponible -->
      <div class="text">
        <p class="alert-text">
          Tiempo libre detectado entre <strong>{{ startDate }}</strong> y <strong>{{ endDate }}</strong>,
          con <strong>{{ hours }}</strong> horas disponibles.
        </p>
        <!-- Botón para abrir el modal con más detalles -->
        <button class="btn btn-primary small" @click="$emit('open-modal')">
          Ver detalles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Definición de las propiedades que recibe el componente
defineProps({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    validator: (val) => val >= 0 // Valida que las horas sean un número no negativo
  }
})
</script>

<style scoped>
/* Estilos para el componente de alerta */
.alert-card {
  border-left: 4px solid #1a73e8;  /* Línea azul al lado izquierdo del componente */
  background-color: #f9fafb;  /* Fondo claro para la tarjeta */
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);  /* Sombra suave para darle profundidad */
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-box {
  font-size: 1.5rem;  /* Tamaño grande para el ícono */
  color: #1a73e8;  /* Color azul */
  margin-top: 4px;  /* Espaciado superior */
}

.text {
  flex: 1;  /* Hace que el texto ocupe el espacio restante */
}

.alert-text {
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #374151;  /* Color de texto oscuro */
  line-height: 1.5;  /* Mejora la legibilidad con mayor espacio entre líneas */
}

/* Estilos para el botón pequeño dentro de la tarjeta de alerta */
.btn.small {
  font-size: 0.8rem;
  padding: 6px 12px;  /* Tamaño más pequeño de botón */
}
</style>
