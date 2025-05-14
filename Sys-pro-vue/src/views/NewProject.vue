<template>
  <div class="layout-container">
    <main class="main-content">
      <header class="main-header">
        <h1>Nuevo Proyecto</h1>
      </header>

      <section class="card">
        <h2>Crear Nuevo Proyecto</h2>
        <h3>Información del Proyecto</h3>

        <!-- Campos generales del proyecto -->
        <input v-model="project.name" type="text" placeholder="Nombre del proyecto" class="input-search" />
        <p v-if="formErrors.name" class="error-text">{{ formErrors.name }}</p>

        <input v-model="project.client" type="text" placeholder="Cliente" class="input-search" />
        <p v-if="formErrors.client" class="error-text">{{ formErrors.client }}</p>

        <select v-model="project.projectType" class="input-search">
          <option disabled value="">Selecciona duración</option>
          <option value="corto">Corto</option>
          <option value="flexible">Flexible</option>
          <option value="largo">Largo</option>
        </select>
        <p v-if="formErrors.projectType" class="error-text">{{ formErrors.projectType }}</p>

        <!-- Fechas de inicio y término -->
        <div class="date-group">
          <div>
            <input v-model="project.startDate" type="date" class="input-search" />
            <p v-if="formErrors.startDate" class="error-text">{{ formErrors.startDate }}</p>
          </div>
          <div>
            <input v-model="project.estimatedEndDate" type="date" class="input-search" />
            <p v-if="formErrors.estimatedEndDate" class="error-text">{{ formErrors.estimatedEndDate }}</p>
          </div>
        </div>

        <!-- Sección de etapas -->
        <h3 style="margin-top: 30px;">Etapas del Proyecto</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Nombre etapa</th>
              <th>Técnico</th>
              <th>Horas estimadas</th>
              <th>Fecha límite</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stage, i) in project.stages" :key="i">
              <td>
                <input v-model="stage.name" type="text" class="input-search" />
                <p v-if="formErrors.stages[i]?.name" class="error-text">{{ formErrors.stages[i].name }}</p>
              </td>
              <td>
                <select v-model="stage.technician" class="input-search">
                  <option disabled value="">Selecciona técnico</option>
                  <option value="">No asignar por ahora</option>
                  <option v-for="t in tecnicosDisponibles" :key="t.id_usuario" :value="t.id_usuario">
                    {{ t.nombre_usuario }}
                  </option>
                </select>
                <p v-if="formErrors.stages[i]?.technician" class="error-text">{{ formErrors.stages[i].technician }}</p>
              </td>
              <td>
                <input v-model.number="stage.hours" type="number" min="1" class="input-search" />
                <p v-if="formErrors.stages[i]?.hours" class="error-text">{{ formErrors.stages[i].hours }}</p>
              </td>
              <td>
                <input v-model="stage.dueDate" type="date" class="input-search" />
                <p v-if="formErrors.stages[i]?.dueDate" class="error-text">{{ formErrors.stages[i].dueDate }}</p>
              </td>
              <td>
                <button class="btn btn-danger" @click="removeStage(i)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Botones de acción -->
        <button class="btn btn-secondary" @click="addStage">+ Agregar Etapa</button>
        <button class="btn btn-primary full" @click="saveProject" style="margin-top: 30px">
          Guardar Proyecto
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API
const usuarioLogeado = JSON.parse(localStorage.getItem('usuarioLogeado') || '{}')
const id_admin = usuarioLogeado.id || null
  
// Lista de técnicos disponibles para asignar
const tecnicosDisponibles = ref([])

// Estructura base del proyecto
const project = reactive({
  name: '',
  client: '',
  projectType: '',
  startDate: '',
  estimatedEndDate: '',
  stages: [
    { name: '', technician: '', hours: '', dueDate: '' }
  ]
})

// Estado de errores por campo
const formErrors = ref({
  name: '',
  client: '',
  projectType: '',
  startDate: '',
  estimatedEndDate: '',
  stages: []
})

// Cargar técnicos disponibles al montar componente
onMounted(async () => {
  try {
    const res = await axios.get(`${API}/tecnicos`)
    tecnicosDisponibles.value = res.data
  } catch (err) {
    console.error('Error al cargar técnicos:', err)
  }
})

// Agrega una nueva fila de etapa
function addStage() {
  project.stages.push({ name: '', technician: '', hours: '', dueDate: '' })
}

// Elimina una fila de etapa
function removeStage(index) {
  project.stages.splice(index, 1)
}

// Valida todos los campos del proyecto y sus etapas
function validarProyecto() {
  let valido = true
  formErrors.value = {
    name: '', client: '', projectType: '', startDate: '', estimatedEndDate: '', stages: []
  }

  if (!project.name) {
    formErrors.value.name = 'El nombre del proyecto es obligatorio.'
    valido = false
  }

  if (!project.client) {
    formErrors.value.client = 'El cliente es obligatorio.'
    valido = false
  }

  if (!project.projectType) {
    formErrors.value.projectType = 'Debe seleccionar un tipo de proyecto.'
    valido = false
  }

  if (!project.startDate) {
    formErrors.value.startDate = 'La fecha de inicio es obligatoria.'
    valido = false
  }

  if (!project.estimatedEndDate) {
    formErrors.value.estimatedEndDate = 'La fecha de término es obligatoria.'
    valido = false
  }

  if (
    project.startDate &&
    project.estimatedEndDate &&
    new Date(project.startDate) > new Date(project.estimatedEndDate)
  ) {
    formErrors.value.estimatedEndDate = 'La fecha de término no puede ser anterior a la de inicio.'
    valido = false
  }

  // Validar cada etapa individualmente
  for (const [i, stage] of project.stages.entries()) {
    formErrors.value.stages[i] = { name: '', technician: '', hours: '', dueDate: '' }

    if (!stage.name) {
      formErrors.value.stages[i].name = 'El nombre de la etapa es obligatorio.'
      valido = false
    }

        // Técnico ahora es opcional: solo marcamos advertencia visual si se desea
    // Puedes dejar este bloque comentado si en algún momento decides volver a activarlo
    /*
    if (!stage.technician) {
      formErrors.value.stages[i].technician = 'Debe asignar un técnico.'
      valido = false
    }
    */

    if (!stage.hours || stage.hours <= 0) {
      formErrors.value.stages[i].hours = 'Las horas deben ser mayores a cero.'
      valido = false
    }
    if (!stage.dueDate) {
      formErrors.value.stages[i].dueDate = 'La fecha límite es obligatoria.'
      valido = false
    }
  }

  return valido
}

// Guarda el proyecto y lo envía al backend si es válido
async function saveProject() {
  if (!validarProyecto()) return

  try {
    await axios.post(`${API}/projects`, {
      ...project,
      id_usuario: id_admin
    })

    alert('Proyecto guardado correctamente')
    resetForm()
  } catch (error) {
    console.error('Error al guardar el proyecto:', error)
    alert('Ocurrió un error al guardar el proyecto')
  }
}

// Reinicia el formulario a su estado inicial
function resetForm() {
  project.name = ''
  project.client = ''
  project.projectType = ''
  project.startDate = ''
  project.estimatedEndDate = ''
  project.stages = [
    { name: '', technician: '', hours: '', dueDate: '' }
  ]
}
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.date-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.date-group > div {
  flex: 1;
  min-width: 240px;
}
.table {
  width: 100%;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .table {
    display: block;
    overflow-x: auto;
  }

  .table table {
    width: 800px;
  }
}

</style>
