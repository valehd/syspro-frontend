<template>
  <section class="card project-summary">
    <div class="header">
      <h2>{{ editing ? 'Editar Proyecto' : 'Resumen del Proyecto' }}</h2>
      <button class="icon-button" v-if="!editing" @click="editing = true" :disabled="isDisabled">Editar</button>
    </div>

    <div class="info-grid">
      <div class="field">
        <label>Nombre del Proyecto</label>
        <input v-if="editing" v-model="localProject.name" :disabled="isDisabled" />
        <span v-else>{{ localProject.name }}</span>
      </div>

      <div class="field">
        <label>Cliente</label>
        <input v-if="editing" v-model="localProject.client" :disabled="isDisabled" />
        <span v-else>{{ localProject.client }}</span>
      </div>

      <div class="field">
        <label>Fecha de Inicio</label>
        <input v-if="editing" type="date" v-model="localProject.start" :disabled="isDisabled" />
        <span v-else>{{ localProject.start }}</span>
      </div>

      <div class="field">
        <label>Fecha de Entrega</label>
        <input v-if="editing" type="date" v-model="localProject.end" :disabled="isDisabled" />
        <span v-else>{{ localProject.end }}</span>
      </div>

      <div class="field full">
        <label>Estado</label>
        <select v-if="editing" v-model="localProject.status" :disabled="isDisabled">
          <option value="En Progreso">En progreso</option>
          <option value="Detenido">Detenido</option>
          <option value="Finalizado">Finalizado</option>
        </select>
        <span v-else :class="['status', statusClass]">{{ estadoTraducido }}</span>
      </div>
    </div>

    <div v-if="editing" class="actions">
      <button class="btn btn-success" @click="save" :disabled="isDisabled">Guardar</button>
      <button class="btn danger" @click="cancel" :disabled="isDisabled">Cancelar</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props recibidas desde el componente padre
const props = defineProps(['project', 'disabled'])
const emit = defineEmits(['save'])

// Estado local para edición del proyecto
const editing = ref(false)
const isDisabled = computed(() => props.disabled)

// Copia local editable del proyecto
const localProject = ref({
  ...props.project,
  status: props.project.status || 'En Progreso'
})

// Observa cambios en la prop 'disabled' para cancelar la edición si se deshabilita
watch(() => props.disabled, (nuevo) => {
  if (nuevo) editing.value = false
})

// Actualiza la copia local cuando la prop 'project' cambia
watch(() => props.project, (newVal) => {
  localProject.value = {
    ...newVal,
    status: newVal.status || 'En Progreso'
  }
})

// Guarda los cambios realizados
const save = () => {
  emit('save', { ...localProject.value })
  editing.value = false
}

// Cancela la edición y restaura los valores originales
const cancel = () => {
  localProject.value = { ...props.project }
  editing.value = false
}

// Computa la clase del estado según su valor
const statusClass = computed(() => {
  const map = {
    'En Progreso': 'en-progreso',
    'Detenido': 'detenido',
    'Finalizado': 'finalizado'
  }
  return map[localProject.value.status] || 'en-progreso'
})

// Texto del estado traducido
const estadoTraducido = computed(() => {
  const map = {
    'En Progreso': 'En progreso',
    'Detenido': 'Detenido',
    'Finalizado': 'Finalizado'
  }
  return map[localProject.value.status] || localProject.value.status
})
</script>

<style scoped>
.project-summary {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

input,
select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: white;
  font-family: inherit;
}

.status {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
  width: fit-content;
  text-transform: capitalize;
}

.status.en-progreso {
  background-color: #e0f2fe;
  color: #0284c7;
}

.status.detenido {
  background-color: #fef3c7;
  color: #ca8a04;
}

.status.finalizado {
  background-color: #dcfce7;
  color: #15803d;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.icon-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #6b7280;
}

.icon-button:hover {
  color: #111827;
}
</style>