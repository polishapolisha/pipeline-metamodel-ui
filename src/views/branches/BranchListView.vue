<!-- src/views/branches/BranchListView.vue -->
<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBranchStore } from '@/stores/branch.store';
import ConfigurableTable from '@/components/ui/ConfigurableTable.vue';
import type { BranchDto } from '@/types/api';
import type { ColumnConfig, TableAction } from '@/types/table';

const router = useRouter();
const branchStore = useBranchStore();

// Безопасные вычисляемые свойства
const branchesList = computed(() => branchStore.branches || []);
const repositoriesList = computed(() => branchStore.repositories || []);
const hasSelectedRepo = computed(() => !!branchStore.currentRepositoryId);
const showEmptyState = computed(() => 
  !loading.value && branchesList.value.length === 0 && hasSelectedRepo.value
);
const showHintState = computed(() => 
  !hasSelectedRepo.value && !repoLoading.value
);

// Состояния загрузки
const loading = ref(false);
const repoLoading = ref(false);
const error = ref<string | null>(null);

// Привязка селектора репозитория к стору
const selectedRepositoryId = computed({
  get: () => branchStore.currentRepositoryId || '',
  set: (val) => {
    if (val) {
      branchStore.currentRepositoryId = val;
      fetchBranches();
    }
  }
});

// Конфигурация колонок
const columns: ColumnConfig<BranchDto>[] = [
  { 
    key: 'repositoryName', 
    title: 'Репозиторий', 
    width: '180px',
    sortable: true,
    formatter: (val: string) => val || '—'
  },
  { 
    key: 'name', 
    title: 'Ветка', 
    sortable: true, 
    width: '250px',
    customRender: (row) => {
      const children = [
        h('span', { style: { marginRight: '0.25rem' }}, row.isMain ? '🌿' : '🔀'),
        h('strong', {}, row.name)
      ];
      
      if (row.isMain) {
        children.push(h('span', { 
          style: { 
            color: '#10b981', 
            fontSize: '0.8rem', 
            marginLeft: '0.5rem',
            background: '#ecfdf5',
            padding: '0.1rem 0.4rem',
            borderRadius: '4px'
          } 
        }, '(main)'));
      }
      
      if (row.parentBranchName && !row.isMain) {
        children.push(h('span', {
          style: { color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }
        }, `← ${row.parentBranchName}`));
      }
      
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } }, children);
    }
  },
  { 
    key: 'description', 
    title: 'Описание', 
    width: '300px',
    formatter: (val: string) => val || '—'
  },
  { 
    key: 'createdAt', 
    title: 'Создана', 
    sortable: true,
    width: '140px',
    formatter: (val: string) => val ? new Date(val).toLocaleDateString('ru-RU') : '—'
  },
];

// Действия
const actions: TableAction[] = [
  {
    label: '✏️',
    title: 'Редактировать',
    action: (_, row) => router.push(`/branches/${row.id}/edit`),
    variant: 'primary'
  },
  {
    label: '🗑️',
    title: 'Удалить',
    action: (_, row) => {
      if (row.id === '00000000-0000-0000-0000-000000000000') {
        alert('❌ Нельзя удалить основную ветку (main)');
        return;
      }
      if (confirm(`Удалить ветку "${row.name}"?`)) {
        console.log('Delete branch:', row.id);
        alert('Функция удаления в разработке');
      }
    },
    variant: 'danger',
    visible: (row) => row.id !== '00000000-0000-0000-0000-000000000000' && !row.isMain
  }
];

// Загрузка репозиториев
const fetchRepositories = async () => {
  repoLoading.value = true;
  try {
    await branchStore.fetchRepositories();
    if (!branchStore.currentRepositoryId && repositoriesList.value.length) {
      branchStore.currentRepositoryId = repositoriesList.value[0].id;
      await fetchBranches();
    }
  } catch (err: any) {
    console.error('Failed to load repositories:', err);
    error.value = 'Не удалось загрузить репозитории';
  } finally {
    repoLoading.value = false;
  }
};

// Загрузка веток
const fetchBranches = async () => {
  if (!branchStore.currentRepositoryId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    await branchStore.fetchBranches(branchStore.currentRepositoryId);
  } catch (err: any) {
    console.error('Failed to load branches:', err);
    if (err?.response?.status !== 404 && err?.response?.status !== 502) {
      error.value = 'Не удалось загрузить ветки';
    }
  } finally {
    loading.value = false;
  }
};

// Создание ветки
const handleCreateBranch = () => {
  if (!branchStore.currentRepositoryId) {
    alert('⚠️ Сначала выберите репозиторий');
    return;
  }
  router.push({ path: '/branches/create', query: { repositoryId: branchStore.currentRepositoryId } });
};

onMounted(fetchRepositories);
</script>

<template>
  <div class="branch-list-view">
    <header class="view-header">
      <h1>📂 Ветки метамодели</h1>
      <p class="subtitle">Выберите репозиторий и ветку для редактирования</p>
    </header>

    <!-- Селектор репозиториев -->
    <div class="repository-selector">
      <label for="repo-select">Репозиторий:</label>
      <select 
        id="repo-select"
        v-model="selectedRepositoryId"
        :disabled="repoLoading"
        class="repo-dropdown"
        autocomplete="off"
      >
        <option value="" disabled>Загрузка...</option>
        <option 
          v-for="repo in repositoriesList" 
          :key="repo.id" 
          :value="repo.id"
        >
          {{ repo.name }}
        </option>
      </select>
      <button class="btn-new-repo" @click="router.push('/repositories/create')">+ Репозиторий</button>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
      <button @click="fetchRepositories">Повторить</button>
    </div>

    <!-- Таблица -->
    <template v-if="!showHintState">
      <ConfigurableTable
        :columns="columns"
        :data="branchesList"
        :loading="loading"
        :actions="actions"
        @row-click="(row) => router.push(`/branches/${row.id}/edit`)"
      >
        <template #toolbar>
          <button class="btn-create" @click="handleCreateBranch" :disabled="!hasSelectedRepo">
            + Создать ветку
          </button>
          <button class="btn-refresh" @click="fetchBranches" :disabled="loading || !hasSelectedRepo">
            🔄
          </button>
        </template>
      </ConfigurableTable>

      <!-- Пустое состояние -->
      <div v-if="showEmptyState" class="empty-state">
        <p>📭 В этом репозитории ещё нет веток</p>
        <button class="btn-create" @click="handleCreateBranch">Создать первую ветку</button>
      </div>
    </template>

    <!-- Подсказка -->
    <div v-if="showHintState" class="hint-state">
      <p>👈 Выберите репозиторий выше, чтобы увидеть ветки</p>
    </div>

    <div class="view-footer">
      <router-link to="/" class="btn-back">← На главную</router-link>
    </div>
  </div>
</template>

<style scoped>
.branch-list-view { padding: 2rem; max-width: 1400px; margin: 0 auto; }
.view-header { margin-bottom: 1.5rem; }
.view-header h1 { font-size: 1.5rem; color: #1a365d; margin-bottom: 0.25rem; }
.subtitle { color: #64748b; font-size: 0.95rem; }
.repository-selector { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; flex-wrap: wrap; }
.repository-selector label { font-weight: 500; color: #334155; }
.repo-dropdown { flex: 1; min-width: 200px; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-new-repo { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.5rem 0.875rem; border-radius: 6px; cursor: pointer; }
.error-banner { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.875rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.error-banner button { background: #dc2626; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; }
:deep(.table-toolbar) { display: flex; gap: 0.5rem; }
.btn-create { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-create:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-refresh { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; }
.empty-state, .hint-state { text-align: center; padding: 3rem 2rem; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 1.5rem; }
.empty-state .btn-create { margin-top: 1rem; }
.view-footer { margin-top: 1.5rem; text-align: center; }
.btn-back { color: #2563eb; text-decoration: none; font-weight: 500; }
</style>