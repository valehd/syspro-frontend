<template>
  <div class="login-body">
    <div class="login-container">
      <!-- Logo -->
      <div class="logo-box">
        <img :src="logo" alt="Logo SYS-PRO" />
      </div>

      <!-- Caja de login -->
      <div class="login-box">
        <h2>Iniciar sesión</h2>

        <!-- Campo de usuario -->
        <label for="username">Usuario</label>
        <div class="input-icon" :class="{ error: errors.username }">
          <i class="fas fa-user"></i>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Ingresa tu usuario"
            @blur="validateUsername"
          />
        </div>
        <p v-if="errors.username" class="error-text">{{ errors.username }}</p>

        <!-- Campo de contraseña -->
        <label for="password">Contraseña</label>
        <div class="input-icon" :class="{ error: errors.password }">
          <i class="fas fa-lock"></i>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Ingresa tu contraseña"
            @blur="validatePassword"
          />
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

        <!-- Botón de acceso -->
        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>

        <!-- Enlace para recuperar clave -->
        <a href="#" class="forgot" @click.prevent="showModal = true">¿Olvidaste tu contraseña?</a>
      </div>

      <!-- Modal de recuperación -->
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <h3>Recuperar contraseña</h3>
          <p>Ingresa tu correo electrónico para recibir instrucciones:</p>
          <input
            v-model="emailRecuperacion"
            type="email"
            placeholder="Correo electrónico"
            :class="{ invalid: emailInvalido }"
            @blur="validateEmail"
          />
          <p v-if="emailInvalido" class="error-text">Formato de correo no válido</p>
          <div class="modal-actions">
            <button class="btn gray" @click="showModal = false">Cancelar</button>
            <button class="btn btn-success" @click="enviarRecuperacion">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logo = '/logo.png'

// Datos del formulario de login
const username = ref('')
const password = ref('')
const errors = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const showModal = ref(false)
const emailRecuperacion = ref('')
const emailInvalido = ref(false)

// Validaciones
const validateUsername = () => {
  if (!username.value.trim()) {
    errors.value.username = 'El nombre de usuario es obligatorio'
  } else {
    errors.value.username = ''
  }
}

const validatePassword = () => {
  if (!password.value.trim()) {
    errors.value.password = 'La contraseña es obligatoria'
  } else {
    errors.value.password = ''
  }
}

const validateEmail = () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailInvalido.value = !regex.test(emailRecuperacion.value)
}

// Lógica de login
const handleLogin = async () => {
  // Validación de campos
  validateUsername()
  validatePassword()
  
  if (errors.value.username || errors.value.password) return

  loading.value = true

  try {
    const API = import.meta.env.VITE_API;
    const response = await fetch(`${API}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    
    const data = await response.json()

    if (data.success) {
      const user = {
        id: data.id,
        username: data.username,
        rol: data.role
      }
      localStorage.setItem('usuarioLogeado', JSON.stringify(user))

      // Redirige según el rol
      if (user.rol === 'administrador') {
        router.push('/dashboard')
      } else if (user.rol === 'tecnico') {
        router.push('/tech-dashboard')
      }
    } else {
      alert('Credenciales incorrectas')
    }
  } catch (error) {
    console.error('Error en login:', error)
    alert('Error de conexión con el servidor')
  } finally {
    loading.value = false
  }
}

// Recuperación de contraseña
const enviarRecuperacion = () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailInvalido.value = !regex.test(emailRecuperacion.value)

  if (!emailInvalido.value) {
    setTimeout(() => {
      alert('Si el correo existe, te enviaremos instrucciones.')
      showModal.value = false
      emailRecuperacion.value = ''
    }, 1000)
  }
}
</script>
<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.login-body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f4f6f8;
}

.login-container {
  text-align: center;
}

.logo-box img {
  max-width: 415px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 12px;
}

.login-box {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 360px;
}

.login-box h2 {
  margin-bottom: 20px;
}

.login-box label {
  display: block;
  margin-bottom: 6px;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.input-icon {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  padding: 0 10px;
  margin-bottom: 10px;
}

.input-icon.error {
  border-color: red;
}

.input-icon i {
  margin-right: 10px;
  color: #999;
}

.input-icon input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  padding: 10px 0;
  font-size: 1em;
}

.error-text {
  color: red;
  font-size: 0.85em;
  text-align: left;
  margin-bottom: 10px;
}

.login-btn {
  width: 100%;
  background-color: #2c3e90;
  color: white;
  padding: 12px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #1f2e6d;
}

.forgot {
  display: block;
  margin-top: 12px;
  font-size: 0.9em;
  color: #666;
  text-decoration: none;
}

.forgot:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  padding: 24px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.invalid {
  border: 1px solid red !important;
}
  /* ─────────────── Responsive ─────────────── */

@media (max-width: 480px) {
  .login-container {
    padding: 0 16px;
  }

  .logo-box img {
    max-width: 280px;
  }

  .login-box {
    padding: 20px;
    box-shadow: none;
    border-radius: 6px;
  }

  .login-btn {
    padding: 10px;
    font-size: 0.95rem;
  }

  .input-icon input {
    font-size: 0.95rem;
  }

  .modal-card {
    padding: 16px;
    width: 90%;
    max-width: 360px;
  }

  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-actions .btn {
    width: 100%;
  }
}

</style>
