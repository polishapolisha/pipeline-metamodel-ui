<!-- src/views/entities/BranchOverview.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBranchStore } from '@/stores/branch.store';

const route = useRoute();
const router = useRouter();
const branchStore = useBranchStore();
const loading = ref(true);
const error = ref<string | null>(null);

const branchId = computed(() => route.params.branchId as string);

const pluralize = (count: number, one: string, few: string, many: string) => {
  const n = count % 100;
  if (n >= 11 && n <= 19) return many;
  const i = n % 10;
  if (i === 1) return one;
  if (i >= 2 && i <= 4) return few;
  return many;
};
// Карточки сущностей
const entityCards = computed(() => [
  {
    type: 'object-types',
    title: '📋 Типы объектов',
    description: 'Основные сущности метамодели (трубы, задвижки, насосы)',
    count: branchStore.objectTypes.length,
    countText: pluralize(branchStore.objectTypes.length, 'экземпляр', 'экземпляра', 'экземпляров'),
    color: 'blue',
    icon: '📋'
  },
  {
    type: 'parameters',
    title: '⚙️ Типы параметров',  // Исправлено название
    description: 'Характеристики объектов (диаметр, давление, длина)',
    count: branchStore.parameters.length,
    countText: pluralize(branchStore.parameters.length, 'экземпляр', 'экземпляра', 'экземпляров'),
    color: 'purple',
    icon: '⚙️'
  },
  {
    type: 'units',
    title: '📏 Единицы измерения',
    description: 'Единицы измерения параметров (метры, паскали, литры)',
    count: branchStore.units.length,
    countText: pluralize(branchStore.units.length, 'единица', 'единицы', 'единиц'),
    color: 'green',
    icon: '📏'
  },
  {
    type: 'images',
    title: '🖼️ Изображения',
    description: 'Иконки, схемы и фотографии объектов',
    count: branchStore.images.length,
    countText: pluralize(branchStore.images.length, 'изображение', 'изображения', 'изображений'),
    color: 'orange',
    icon: '🖼️'
  }
]);

onMounted(async () => {
  try {
    await branchStore.loadBranchContent(branchId.value);
    loading.value = false;
  } catch (err: any) {
    console.error('Failed to load branch content:', err);
    error.value = err.message || 'Ошибка загрузки данных';
    loading.value = false;
  }
});

const goToEntityEditor = (entityType: string) => {
  router.push(`/branches/${branchId.value}/edit/${entityType}`);
};

const goBack = () => {
  router.push('/branches/select');
};

const publishBranch = async () => {
  const message = prompt('Сообщение коммита:', 'Обновление метамодели');
  if (!message) return;
  
  try {
    const result = await branchStore.publishBranch(branchId.value, message);
    alert(`✅ Версия опубликована!\n${result.commitHash?.slice(0, 7) || ''}: ${result.message}`);
  } catch (err) {
    console.error('Publish failed:', err);
    alert('❌ Не удалось опубликовать версию');
  }
};
</script>

<template>
  <div class="branch-overview">
    <!-- Шапка -->
    <header class="overview-header">
      <div>
        <h1>📂 Редактор ветки</h1>
        <p v-if="branchStore.currentContent">
          <strong>Репозиторий:</strong> {{ branchStore.currentContent.repositoryName }} • 
          <strong>Ветка:</strong> {{ branchStore.currentContent.branchName }}
        </p>
      </div>
      
      <div class="header-actions">
        <button class="btn-publish" @click="publishBranch" :disabled="loading">
          📦 Опубликовать версию
        </button>
        <button class="btn-back" @click="goBack">← Назад к веткам</button>
      </div>
    </header>

    <!-- Ошибка -->
    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
      <button @click="goBack">Вернуться</button>
    </div>

    <!-- Загрузка -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка данных ветки...</p>
    </div>

    <!-- Карточки сущностей -->
    <div v-else class="entity-grid">
      <div 
        v-for="card in entityCards" 
        :key="card.type"
        class="entity-card"
        :class="`card-${card.color}`"
        @click="goToEntityEditor(card.type)"
      >
        <div class="card-icon">{{ card.icon }}</div>
        <div class="card-content">
          <h3>{{ card.title }}</h3>
          <p class="card-description">{{ card.description }}</p>
          <div class="card-stats">
            <span class="count">{{ card.count }}</span>
            <span class="label">{{ card.countText }}</span>
          </div>
        </div>
        <div class="card-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.branch-overview {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;
}

.overview-header h1 {
  font-size: 1.75rem;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.overview-header p {
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-publish {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-publish:hover:not(:disabled) {
  background: #6d28d9;
}

.btn-publish:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-back {
  background: #f1f5f9;
  color: #1e293b;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e2e8f0;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-banner button {
  margin-left: auto;
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.entity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.entity-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.entity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  border-color: var(--card-color);
}

.entity-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--card-color);
}

.card-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1.25rem;
  color: #1a365d;
  margin-bottom: 0.4rem;
}

.card-description {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.card-stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.card-stats .count {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--card-color);
}

.card-stats .label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.card-arrow {
  font-size: 1.5rem;
  color: #cbd5e1;
  transition: all 0.2s;
}

.entity-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--card-color);
}

/* Цветовые схемы */
.card-blue {
  --card-color: #3b82f6;
}

.card-purple {
  --card-color: #8b5cf6;
}

.card-green {
  --card-color: #10b981;
}

.card-orange {
  --card-color: #f59e0b;
}
</style>