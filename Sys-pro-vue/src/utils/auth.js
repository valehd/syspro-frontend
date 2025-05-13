// utils/auth.js


// Devuelve el usuario actual desde localStorage (ya parseado)
export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('usuarioLogeado'))
    if (!user || typeof user !== 'object') return null
    return user
  } catch {
    return null
  }
}



// Verifica si el usuario actual es administrador
export function isAdmin() {
  return getCurrentUser()?.rol === 'administrador'
}


// Verifica si el usuario actual es técnico
export function isTechnician() {
  return getCurrentUser()?.rol === 'tecnico'
}

// Cierra la sesión limpiando datos del usuario
export function logout() {
  localStorage.removeItem('usuarioLogeado')
  localStorage.removeItem('usuarioId')
  localStorage.removeItem('usuarioNombre')
  localStorage.removeItem('usuarioRol')
}