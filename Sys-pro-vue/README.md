# SYS-PRO Frontend

Este repositorio contiene el frontend del sistema SYS-PRO, una plataforma web para la gestión y monitoreo de proyectos técnicos. Está desarrollado en **Vue 3 + Vite**, con una interfaz moderna, responsiva y diseñada para técnicos y administradores.

## Tecnologías Utilizadas

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- CSS puro (con estructura modular definida en `base.css` y `style.css`)

## Estructura del Proyecto

src/
├── assets/ # Imágenes, logos, etc.
├── components/ # Componentes reutilizables
├── views/ # Vistas principales del sistema (Dashboard, ProjectList, etc.)
├── router/ # Rutas del sistema (Vue Router)
├── utils/ # Utilidades como manejo de sesión o validaciones
├── App.vue # Root component
├── main.js # Punto de entrada de la app


URL de producción
Puedes acceder al sistema desplegado aquí:
https://sys-pro.netlify.app

Roles del sistema
Administrador: acceso a todas las funciones, asignaciones y bitácora.
Técnico: acceso a sus tareas asignadas, cronograma y registro de horas.
