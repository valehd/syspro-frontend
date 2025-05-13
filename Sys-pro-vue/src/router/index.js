import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '@/utils/auth'

// Vistas generales
import LoginView from '../views/LoginView.vue'

// Layout principal con menú lateral
import MainLayout from '../layouts/MainLayout.vue'

// Vistas para administrador
import DashboardView from '../views/Dashboard.vue'
import ProjectList from '../views/ProjectList.vue'
import NewProject from '../views/NewProject.vue'
import ProjectDetails from '../views/ProjectDetails.vue'
import GlobalView from '../views/GlobalView.vue'
import Suggestions from '../views/Suggestions.vue'
import Statistics from '../views/Statistics.vue'
import TechView from '../views/TechView.vue'
import AddUser from '../views/AddUser.vue'

// Vista del técnico
import TechDashboard from '../views/TechDashboard.vue'

// Definición de rutas del sistema
const routes = [
  // Ruta pública: login
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },

  // Rutas protegidas bajo layout principal
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'project-list',
        component: ProjectList,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'new-project',
        component: NewProject,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'project-details/:id',
        component: ProjectDetails,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'project-details',
        name: 'ProjectDetailsSearch',
        component: ProjectDetails,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'global-view',
        component: GlobalView,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'suggestions',
        component: Suggestions,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'statistics',
        component: Statistics,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'tech-view',
        component: TechView,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'add-user',
        name: 'AddUser',
        component: AddUser,
        meta: { requiresAuth: true, role: 'administrador' }
      },
      {
        path: 'tech-dashboard',
        name: 'TechDashboard',
        component: TechDashboard,
          meta: { requiresAuth: true } // sin restricción de rol
      }
    ]
  }
]

// Crear instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Middleware global para proteger rutas según autenticación y rol
 */
router.beforeEach((to, from, next) => {
  const user = getCurrentUser()

  // Permitir acceso libre al login
  if (to.path === '/') return next()

  // Redirigir si no está autenticado
  if (!user) return next('/')

  // Verificar si la ruta requiere autenticación y rol
  if (to.meta.requiresAuth && to.meta.role && user.rol !== to.meta.role) {
    // Si el técnico intenta acceder a rutas de admin, se redirige a su dashboard
    if (user.rol === 'tecnico') return next('/tech-dashboard')

    // Si el admin intenta acceder a rutas no permitidas (según el meta), también se protege
    return next('/dashboard')
  }

  // Acceso permitido
  next()
})

export default router
