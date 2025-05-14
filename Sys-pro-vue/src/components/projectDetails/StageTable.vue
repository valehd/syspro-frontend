<template>
  <section class="card">
    <h3>Tabla de Etapas del Proyecto</h3>

    <p v-if="isDisabled" class="alert alert-warning mb-3">
      Este proyecto está <strong>Finalizado</strong> o <strong>cancelado</strong>, por lo tanto las etapas no pueden ser modificadas.
    </p>

    <table class="table">
      <thead>
        <tr>
          <th>Etapa</th>
          <th>Técnico</th>
          <th>Inicio</th>
          <th>Entrega</th>
          <th>Horas est.</th>
          <th>Horas reales</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(stage, i) in stages"
          :key="stage.id_etapa || i"
          :class="{ highlight: stage.id_etapa === etapaDestacada }"
        >
          <!-- Modo edición -->
          <template v-if="stage.editing">
            <td>
              <input v-model="stage.name" :disabled="isDisabled" />
              <p v-if="stage.touched && stageErrors[i]?.name" class="error-text">{{ stageErrors[i].name }}</p>
            </td>
            <td>
              <select v-model="stage.tech" :disabled="isDisabled">
                <option :value="null" disabled>Seleccione técnico</option>
                <option v-for="tec in tecnicos" :key="tec.id_usuario" :value="tec.id_usuario">
                  {{ tec.nombre_usuario }}
                </option>
              </select>
              <p v-if="stage.touched && stageErrors[i]?.tech" class="error-text">{{ stageErrors[i].tech }}</p>
            </td>
            <td>
              <input type="date" v-model="stage.start" :disabled="isDisabled" />
              <p v-if="stage.touched && stageErrors[i]?.start" class="error-text">{{ stageErrors[i].start }}</p>
            </td>
            <td>
              <input type="date" v-model="stage.due" :disabled="isDisabled" />
              <p v-if="stage.touched && stageErrors[i]?.due" class="error-text">{{ stageErrors[i].due }}</p>

            </td>
            <td>
              <input type="number" v-model.number="stage.estTime" min="1" :disabled="isDisabled" />
              <p v-if="stage.touched && stageErrors[i]?.estTime" class="error-text">{{ stageErrors[i].estTime }}</p>
            </td>
            <td>
              <input v-model="stage.realTime" :disabled="isDisabled" />
            </td>
            <td>
              <select v-model="stage.status" :disabled="isDisabled">
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </td>
            <td>
              <button class="btn btn-success" @click="saveStage(i)" :disabled="isDisabled">Guardar</button>
              <button class="btn btn-danger" @click="cancelStage(i)" :disabled="isDisabled">Cancelar</button>
            </td>
          </template>

          <!-- Modo visual -->
          <template v-else>
            <td>{{ stage.name }}</td>
            <td>{{ stage.techName || '—' }}</td>
            <td>{{ stage.start }}</td>
            <td>{{ stage.due }}</td>
            <td>{{ stage.estTime }}</td>
            <td>{{ stage.realTime }}</td>
            <td :class="['status', stage.status]">{{ traducirEstado(stage.status) }}</td>
            <td>
              <button class="btn btn-secondary" @click="habilitarEdicion(stage)" :disabled="isDisabled">Editar</button>
              <button
                class="btn btn-danger"
                v-if="stage.id_etapa"
                @click="confirmDeleteStage(stage)"
                :disabled="isDisabled"
              >Eliminar</button>
              <button
                class="btn btn-danger"
                v-else
                @click="removeUnsavedStage(i)"
                :disabled="isDisabled"
              >Eliminar</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <button @click="addNewStage" class="btn btn-primary" :disabled="isDisabled">
      + Nueva Etapa
    </button>
  </section>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { getCurrentUser } from '@/utils/auth'

// Variables del entorno y utilidades
const API = import.meta.env.VITE_API
const toast = useToast()
const emit = defineEmits(['save-stage', 'cancel-stage'])

// Props recibidas desde ProjectDetails.vue
const props = defineProps({
  stages: Array,
  tecnicos: Array,
  projectName: String,
  projectId: String,
  disabled: Boolean,
  etapaDestacada: Number
})

// Computed para bloquear acciones si el proyecto está finalizado/cancelado
const isDisabled = computed(() => props.disabled)


const stageErrors = ref([])


// Corrige valores de técnico al montar
onMounted(() => {
  props.stages.forEach(stage => {
    stage.tech = !stage.tech || isNaN(stage.tech) ? null : Number(stage.tech)
  })
})

// Traduce estados a formato legible
function traducirEstado(valor) {
  const map = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    finalizado: 'Finalizado'
  }
  return map[valor] || valor
}

// Habilita edición si el proyecto está activo
function habilitarEdicion(stage) {
  if (isDisabled.value) {
    toast.warning('Este proyecto no permite editar etapas.')
    return
  }
  stage.editing = true
}

// Cancela la edición y revierte cambios si es necesario
function cancelStage(index) {
  const stage = props.stages[index]

  if (!stage.id_etapa) {
    props.stages.splice(index, 1)
  } else {
    stage.editing = false
  }

  toast.info(`Edición cancelada para etapa "${stage.name || 'nueva'}"`)
}
  
// Agrega una nueva etapa temporal
function addNewStage() {
  if (isDisabled.value) return
  props.stages.push({
    id_etapa: null,
    name: '',
    tech: '',
    techName: '',
    start: '',
    due: '',
    estTime: '',
    realTime: '',
    status: 'pendiente',
    reprogrammable: false,
    editing: true,
     touched: false
  })
}

// Elimina etapa no guardada aún
function removeUnsavedStage(index) {
  props.stages.splice(index, 1)
}

// Guarda o edita una etapa
async function saveStage(index) {
  if (isDisabled.value) return
  const stage = props.stages[index]
  stage.touched = true
  const adminId = getCurrentUser()?.id



stageErrors.value[index] = {
  name: '',
  tech: '',
  start: '',
  due: '',
  estTime: ''
}

  // Validaciones mínimas
  if (!stage.name || !stage.start || !stage.due) {
      stageErrors.value[index].name = 'Nombre estapa es obligatorio'
  return
  }
  if (!stage.estTime || isNaN(stage.estTime) || stage.estTime <= 0) {
   stageErrors.value[index].estTime = 'Las horas estimadas deben ser un número mayor que cero.'
  return
    
  }
  if (!stage.tech || isNaN(stage.tech)) {
    stageErrors.value[index].tech = 'Por favor selecciona un tecnico'
  return
  }

  if (!stage.start) {
  stageErrors.value[index].start = 'Fecha de inicio requerida'
  return
}
if (!stage.due) {
  stageErrors.value[index].due = 'Fecha de entrega requerida'
  return
}

 if (new Date(stage.start) > new Date(stage.due)) {
  stageErrors.value[index].due = 'La fecha de inicio no puede ser posterior a la fecha de entrega en la etapa'
  return
}
 

  try {
    const formatFecha = f => new Date(f).toISOString().slice(0, 10)
    let descripcion = ''

    if (!stage.id_etapa) {
      // Crear nueva etapa
      const res = await axios.post(`${API}/etapas`, {
        id_proyecto: props.projectId,
        nombre_etapa: stage.name,
        estado_etapa: stage.status,
        fecha_inicio: stage.start,
        fecha_fin: stage.due,
        horas_estimadas: stage.estTime,
        id_usuario: adminId
      })
      stage.id_etapa = res.data.id_etapa
      descripcion = `Creó la etapa "${stage.name}" en el proyecto "${props.projectName}"`
    } else {
      // Editar etapa existente
      const { data: original } = await axios.get(`${API}/etapas/${stage.id_etapa}`)
      const cambios = []
      if (original.nombre_etapa !== stage.name) cambios.push(`nombre: ${original.nombre_etapa} → ${stage.name}`)
      if (formatFecha(original.fecha_inicio) !== formatFecha(stage.start)) cambios.push('fecha_inicio')
      if (formatFecha(original.fecha_fin) !== formatFecha(stage.due)) cambios.push('fecha_fin')
      if (original.estado_etapa !== stage.status) cambios.push('estado')
      if (original.horas_estimadas != stage.estTime) cambios.push('horas_estimadas')
     
  

      const { data: asignacion } = await axios.get(`${API}/asignacion/${stage.id_etapa}`)
      const idTecnicoAnterior = asignacion?.id_usuario
      if (parseInt(idTecnicoAnterior) !== parseInt(stage.tech)) cambios.push('técnico')

      descripcion = cambios.length
        ? `Editó la etapa "${stage.name}". Cambios: ${cambios.join(', ')}`
        : `Guardó etapa "${stage.name}" sin cambios visibles`


        
         await axios.put(`${API}/etapas/${stage.id_etapa}`, {
        nombre_etapa: stage.name,
        estado_etapa: stage.status,
        fecha_inicio: stage.start,
        fecha_fin: stage.due,
        horas_estimadas: stage.estTime,
        horas_reales: stage.realTime,
        reprogramable: stage.reprogrammable,
        id_usuario: adminId
      })
    }

    // Actualizar asignación
    await axios.post(`${API}/asignacion`, {
      id_usuario: stage.tech,
      id_etapa: stage.id_etapa,
      autor: adminId
    })

    // 🔄 Actualizar nombre del técnico en la tabla visible
const tecnico = props.tecnicos.find(t => t.id_usuario === stage.tech)
stage.techName = tecnico ? tecnico.nombre_usuario : ''

    // Registrar acción en bitácora
    await axios.post(`${API}/bitacora`, {
      id_usuario: adminId,
      accion: descripcion,
        id_proyecto: props.projectId, 
      fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
// Recargar log del proyecto después de guardar
try {
  const res = await axios.get(`${API}/projects/${props.projectId}/log`)
  emit('update-log', res.data)
} catch (err) {
  console.warn('No se pudo actualizar el log:', err)
}
    stage.editing = false
    toast.success(`Etapa "${stage.name}" guardada correctamente`)
    emit('save-stage', index)
  } catch (err) {
    console.error('Error al guardar etapa:', err)
    toast.error('No se pudo guardar la etapa.')
  }
}

// Confirma y elimina una etapa existente
async function confirmDeleteStage(stage) {
  if (isDisabled.value) {
    toast.warning('No se puede eliminar etapas de un proyecto bloqueado.')
    return
  }

  const confirmado = confirm(`Eliminar la etapa "${stage.name}"? Esta acción no se puede deshacer.`)
  if (!confirmado) return
const adminId = getCurrentUser()?.id

  try {
    await axios.delete(`${API}/etapas/${stage.id_etapa}`, {
      data: { id_usuario: adminId }
    })
    props.stages.splice(props.stages.indexOf(stage), 1)
    toast.success(`Etapa "${stage.name}" eliminada correctamente`)
  } catch (err) {
    console.error('Error al eliminar etapa:', err)
    toast.error('No se pudo eliminar la etapa.')
  }
}
</script>

<style scoped>
/* Estado visual según el estado de la etapa */
.status.pendiente {
  color: #b91c1c;
}
.status.en_proceso {
  color: #ca8a04;
}
.status.finalizado {
  color: #15803d;
}

/* Resaltado de etapa destacada */
.highlight {
  background-color: #fff3cd !important;
  font-weight: bold;
  border-left: 5px solid #f0ad4e;
}

/* Aviso visual */
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.95rem;
}
.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
}
/* ─────────────── Responsive ─────────────── */

@media (max-width: 768px) {
  /* Contenedor que permite hacer scroll horizontal en pantallas pequeñas */
  .card {
    overflow-x: auto;
  }


  .table {
    min-width: 700px;
    font-size: 0.85rem;
  }


  input,
  select {
    min-width: 140px;
    font-size: 0.85rem;
  }

  .btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    margin-bottom: 4px;
    white-space: nowrap;
  }


  .error-text {
    font-size: 0.75rem;
    margin-top: 2px;
    line-height: 1.2;
  }

  td {
    vertical-align: top;
  }
}

  
</style>
