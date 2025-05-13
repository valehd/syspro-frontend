<template>
  <section class="card bitacora-card">
    <!-- Título de la bitácora -->
    <h3 class="bitacora-title">
      <i data-lucide="clipboard-list"></i>
      Registro de Actividades
    </h3>

    <!-- Tabla para mostrar las entradas de la bitácora -->
    <table class="table">
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Usuario</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in bitacora" :key="index">
          <td>{{ formatFechaHora(entry.fecha_hora) }}</td>
          <td>{{ entry.nombre_usuario || 'Desconocido' }}</td>
          <td>{{ entry.accion }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Lista reactiva para almacenar las entradas de la bitácora
const bitacora = ref([])

// Formateo de fecha y hora a formato legible
function formatFechaHora(fecha) {
  // Si no se proporciona una fecha, devuelve un guion
  if (!fecha) return '—'
  
  // Formatea la fecha y hora usando las configuraciones de la región 'es-CL'
  const date = new Date(fecha.includes('T') ? fecha : fecha.replace(' ', 'T'))
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Carga de datos al montar el componente
onMounted(async () => {
  try {
    // URL base de la API, ajustable por entorno
    const API = import.meta.env.VITE_API || 'http://localhost:3001'
    
    // Realiza la solicitud GET para obtener las entradas de la bitácora
    const response = await axios.get(`${API}/bitacora`)
    
    // Asigna las entradas de la bitácora a la variable reactiva
    bitacora.value = response.data
  } catch (error) {
    console.error('Error al cargar bitácora:', error)
  }
})
</script>

<style scoped>
/* Estilo principal para la tarjeta de la bitácora */
.bitacora-card {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); /* Sombra suave */
}

/* Título de la bitácora con icono y texto */
.bitacora-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

/* Estilo de la tabla */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background-color: white;
}

/* Estilo del encabezado de la tabla */
.table thead {
  background-color: #f3f4f6;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
}

/* Estilo de las celdas de la tabla */
.table th,
.table td {
  padding: 12px;
  border: 1px solid #e5e7eb; /* Borde suave */
  text-align: left;
  vertical-align: middle;
}

/* Estilo de las filas pares de la tabla */
.table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}
</style>
