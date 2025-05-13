<template>
  <section class="card resume-section">
    <h3 class="section-title">Resumen de Proyectos</h3>
    <div class="resume-items">
      <!-- Resumen total de proyectos -->
      <div class="resume-block total">
        <i data-lucide="folder"></i>
        <div class="info">
          <span class="count">{{ total }}</span>
          <span class="label">Total</span>
        </div>
      </div>

      <!-- Resumen de proyectos en progreso -->
      <div class="resume-block enprogreso">
        <i data-lucide="play-circle"></i>
        <div class="info">
          <span class="count">{{ enProgreso }}</span>
          <span class="label">En progreso</span>
        </div>
      </div>

      <!-- Resumen de proyectos finalizados -->
      <div class="resume-block finalizado">
        <i data-lucide="check-circle"></i>
        <div class="info">
          <span class="count">{{ finalizado }}</span>
          <span class="label">Finalizados</span>
        </div>
      </div>

      <!-- Resumen de proyectos detenidos -->
      <div class="resume-block detenido">
        <i data-lucide="pause-circle"></i>
        <div class="info">
          <span class="count">{{ detenido }}</span>
          <span class="label">Detenidos</span>
        </div>
      </div>

      <!-- Resumen de proyectos cancelados -->
      <div class="resume-block cancelado">
        <i data-lucide="x-circle"></i>
        <div class="info">
          <span class="count">{{ cancelado }}</span>
          <span class="label">Cancelados</span>
        </div>
      </div>

      <!-- Resumen de proyectos atrasados -->
      <div class="resume-block atrasado">
        <i data-lucide="clock"></i>
        <div class="info">
          <span class="count">{{ atrasado }}</span>
          <span class="label">Atrasados</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

// Props que se recibirán para mostrar los totales por estado de proyecto
defineProps({
  enProgreso: { type: Number, required: true },
  finalizado: { type: Number, required: true },
  detenido: { type: Number, required: true },
  cancelado: { type: Number, required: true },
  atrasado: { type: Number, required: true },
  total: { type: Number, required: true }
})

// Inicializa los íconos de Lucide cuando se monta el componente
onMounted(() => {
  window.lucide?.createIcons() // Crea los íconos de Lucide (si están disponibles)
})
</script>

<style scoped>
/* Estilo principal de la sección de resumen */
.resume-section {
  padding: 20px;
}

/* Título de la sección */
.section-title {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #1f2937;
  font-weight: 600;
}

/* Contenedor de los bloques del resumen */
.resume-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
}

/* Estilo base para cada bloque del resumen */
.resume-block {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  min-width: 200px;
  border-left: 5px solid transparent;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease; /* Efecto al pasar el mouse sobre el bloque */
}

.resume-block:hover {
  transform: translateY(-3px); /* Eleva ligeramente el bloque cuando se pasa el mouse */
}

/* Íconos de cada bloque */
.resume-block i {
  width: 28px;
  height: 28px;
  color: #374151;
}

/* Estilo para la cantidad de proyectos o etapas */
.count {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}

/* Estilo para las etiquetas que indican el tipo de estado */
.label {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Colores personalizados por tipo de estado */
.resume-block.total {
  border-left-color: #6b7280;
  background-color: #f3f4f6;
}

.resume-block.enprogreso {
  border-left-color: #3b82f6;
  background-color: #eff6ff;
}

.resume-block.finalizado {
  border-left-color: #10b981;
  background-color: #ecfdf5;
}

.resume-block.detenido {
  border-left-color: #f59e0b;
  background-color: #fff7ed;
}

.resume-block.cancelado {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

.resume-block.atrasado {
  border-left-color: #eab308;
  background-color: #fefce8;
}
</style>
