<template>
  <section class="card form-section">
    <h2 class="text-xl font-bold mb-4">Agregar Nuevo Usuario</h2>

    <!-- Formulario de registro -->
    <form @submit.prevent="handleSubmit" class="form-grid">
      <!-- Campo: Nombre -->
      <div class="form-group">
        <label>Nombre</label>
        <input v-model="form.nombre" type="text" />
        <p v-if="formErrors.nombre" class="error-text">{{ formErrors.nombre }}</p>
      </div>

      <!-- Campo: Apellido -->
      <div class="form-group">
        <label>Apellido</label>
        <input v-model="form.apellido" type="text" />
        <p v-if="formErrors.apellido" class="error-text">{{ formErrors.apellido }}</p>
      </div>

      <!-- Campo: Nombre de usuario (autogenerado) -->
      <div class="form-group">
        <label>Nombre de usuario</label>
        <input v-model="form.nombre_usuario" type="text" />
        <p v-if="formErrors.nombre_usuario" class="error-text">{{ formErrors.nombre_usuario }}</p>
      </div>

      <!-- Campo: Contraseña -->
      <div class="form-group">
        <label>Contraseña</label>
        <input v-model="form.contrasena" type="password" />
        <p v-if="formErrors.contrasena" class="error-text">{{ formErrors.contrasena }}</p>
      </div>

      <!-- Campo: Rol del usuario -->
      <div class="form-group">
        <label>Rol</label>
        <select v-model="form.rol">
          <option value="" disabled>Seleccione rol</option>
          <option value="administrador">Administrador</option>
          <option value="tecnico">Técnico</option>
        </select>
        <p v-if="formErrors.rol" class="error-text">{{ formErrors.rol }}</p>
      </div>

      <!-- Campo: Teléfono (opcional) -->
      <div class="form-group">
        <label>Teléfono</label>
        <input v-model="form.telefono" type="tel" />
      </div>

      <!-- Campo: Email -->
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.correo" type="email" />
        <p v-if="formErrors.correo" class="error-text">{{ formErrors.correo }}</p>
      </div>

      <!-- Botón de envío -->
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">+ Crear Usuario</button>
      </div>
    </form>

    <!-- Mensaje de feedback general -->
    <p v-if="mensaje" class="feedback">{{ mensaje }}</p>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const API = import.meta.env.VITE_API

// Estado del formulario
const form = ref({
  nombre: '',
  apellido: '',
  nombre_usuario: '',
  contrasena: '',
  rol: '',
  telefono: '',
  correo: ''
})

// Estado de errores por campo
const formErrors = ref({
  nombre: '',
  apellido: '',
  nombre_usuario: '',
  contrasena: '',
  rol: '',
  correo: ''
})

const mensaje = ref(null)

// Generador automático de nombre de usuario
watch([() => form.value.nombre, () => form.value.apellido], ([nombre, apellido]) => {
  if (nombre && apellido) {
    form.value.nombre_usuario = `${nombre.trim().toLowerCase().replace(/\s+/g, '')}.${apellido.trim().toLowerCase().replace(/\s+/g, '')}`
  }
})

// Función principal: validación y envío del formulario
async function handleSubmit() {
  mensaje.value = null
  formErrors.value = {
    nombre: '', apellido: '', nombre_usuario: '', contrasena: '', rol: '', correo: ''
  }

  const { nombre, apellido, nombre_usuario, contrasena, rol, correo } = form.value
  let valido = true

  // Validaciones
  if (!nombre) {
    formErrors.value.nombre = 'El nombre es obligatorio.'
    valido = false
  }
  if (!apellido) {
    formErrors.value.apellido = 'El apellido es obligatorio.'
    valido = false
  }
  if (!nombre_usuario) {
    formErrors.value.nombre_usuario = 'El nombre de usuario es obligatorio.'
    valido = false
  } else {
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/
    if (!usernameRegex.test(nombre_usuario)) {
      formErrors.value.nombre_usuario = 'Solo letras, números, guiones y puntos.'
      valido = false
    }
  }
  if (!contrasena || contrasena.length < 6) {
    formErrors.value.contrasena = 'Debe tener al menos 6 caracteres.'
    valido = false
  }
  if (!rol) {
    formErrors.value.rol = 'Debe seleccionar un rol.'
    valido = false
  }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    formErrors.value.correo = 'El correo no es válido.'
    valido = false
  }

  if (!valido) return

  try {
    await axios.post(`${API}/usuarios/crear`, form.value)
     mensaje.value = response.data.message || 'Usuario creado correctamente.'
    setTimeout(() => {
      mensaje.value = null
      router.push('/tech-view')
    }, 3000)
  } catch (err) {
    console.error('Error al crear usuario:', err)
    if (err.response?.status === 409) {
      formErrors.value.nombre_usuario = 'El nombre de usuario ya está en uso.'
    } else {
      mensaje.value = 'No se pudo crear el usuario.'
    }
  }
}

// Protege esta vista para uso exclusivo del administrador
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('usuarioLogeado'))
  if (user?.rol !== 'administrador') {
    alert('Solo los administradores pueden acceder a esta página.')
    router.push('/')
  }
})
</script>

<style scoped>
.form-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.95rem;
}
input,
select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.feedback {
  margin-top: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #15803d;
}
.error-text {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 4px;
}
  /* ─────────────── Responsive ─────────────── */

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions .btn {
    width: 100%;
  }

  input,
  select {
    font-size: 1rem;
    padding: 10px;
  }

  .form-group label {
    font-size: 1rem;
  }

  .card.form-section {
    padding: 1.5rem;
  }
}

</style>
