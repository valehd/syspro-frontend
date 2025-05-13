<template>
  <div class="filter-form">
    <h4 class="form-title">Filtrar Proyectos</h4>

    <!-- Filtro por tipo de proyecto -->
    <div class="form-group">
      <label for="type">Tipo de Proyecto:</label>
      <select v-model="filters.type" id="type">
        <option value="">Todos</option>
        <option value="largo">Largo</option>
        <option value="corto">Corto</option>
        <option value="flexible">Flexible</option>
      </select>
    </div>

    <!-- Filtro por estado de proyecto (versión amigable para el usuario) -->
    <div class="form-group">
      <label for="status">Estado:</label>
      <select v-model="filters.status" id="status">
        <option value="">Todos</option>
        <option v-for="(label, key) in estadosDisponibles" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </div>

    <!-- Botones para aplicar o reiniciar los filtros -->
    <div class="form-actions">
      <button class="btn btn-primary small" @click="applyFilters">Aplicar Filtros</button>
      <button class="btn gray small" @click="resetFilters">Reiniciar</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['apply'])

// Estados disponibles con etiquetas amigables
const estadosDisponibles = {
  activo: 'Activo',
  detenido: 'Detenido',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
  atrasado: 'Atrasado'
}

// Estado reactivo de los filtros
const filters = reactive({
  type: '',
  status: ''
})

// Emite los filtros seleccionados al componente padre
function applyFilters() {
  emit('apply', { ...filters })
}

// Reinicia todos los filtros a vacío y los aplica
function resetFilters() {
  filters.type = ''
  filters.status = ''
  applyFilters()
}
</script>

<style scoped>
.filter-form {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #111827;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  background-color: white;
}

select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

</style>
