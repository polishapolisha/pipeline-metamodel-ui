<!-- src/views/branches/BranchListView.vue -->
<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useBranchStore } from '@/stores/branch.store';
import ConfigurableTable from '@/components/ui/ConfigurableTable.vue';
import type { BranchDto } from '@/types/api';
import type { ColumnConfig, TableAction } from '@/types/table';

const router = useRouter();
const branchStore = useBranchStore();
const loading = ref(false);

// 🔥 Конфигурация колонок таблицы
const columns: ColumnConfig<BranchDto>[] = [
  { 
    key: 'name', 
    title: 'Название', 
    sortable: true, 
    width: '250px',
    // ✅ Исправлено: используем h() для рендеринга VNode
    customRender: (row) => {
      const isMain = row.id === '00000000-0000-0000-0000-000000000000';
      
      // Собираем массив детей, исключая пустые значения
      const children = [
        h('span', { style: { marginRight: '0.25rem' }}, isMain ? '🌿' : '🔀'),
        h('strong', {}, row.name)
      ];
      
      // Добавляем бейдж (main) только если это главная ветка
      if (isMain) {
        children.push(
          h('span', { 
            style: { 
              color: '#10b981', 
              fontSize: '0.8rem',
              marginLeft: '0.5rem',
              background: '#ecfdf5',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px'
            } 
          }, '(main)')
        );
      }
      
      return h('div', { 
        style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } 
      }, children);
    }
  },
  { 
    key: 'description', 
    title: 'Описание', 
    width: '300px',
    formatter: (val: string) => val ? val : '—'
  },
  { 
    key: 'createdAt', 
    title: 'Создана', 
    sortable: true,
    formatter: (val: string) => {
      if (!val) return '—';
      return new Date(val).toLocaleDateString('ru-RU', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
];

// 🔥 Действия (кнопки) в таблице
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
      if (confirm(`Вы действительно хотите удалить ветку "${row.name}"?\n\nЭто действие нельзя отменить.`)) {
        // 🔜 Здесь будет вызов API удаления
        console.log('Delete branch:', row.id);
        alert('Функция удаления в разработке');
      }
    },
    variant: 'danger',
    visible: (row) => row.id !== '00000000-0000-0000-0000-000000000000'
  }
];

// 🔥 Загрузка данных
const fetchBranches = async () => {
  loading.value = true;
  try {
    await branchStore.fetchBranches();
  } catch (error: any) {
    console.error('Failed to load branches:', error);
    // Не показываем alert при 404/502, если бэкенд просто выключен
    if (error?.response?.status !== 404 && error?.response?.status !== 502) {
      alert('Не удалось загрузить список веток');
    }
  } finally {
    loading.value = false;
  }
};

// 🔥 Обработчик клика по строке
const handleRowClick = (row: BranchDto) => {
  router.push(`/branches/${row.id}/edit`);
};

onMounted(fetchBranches);
</script>

<template>
  <div class="branch-list-view">
    <header class="view-header">
      <h1>📂 Ветки метамодели</h1>
      <p class="subtitle">Выберите ветку для редактирования</p>
    </header>

    <!-- Универсальная таблица -->
    <ConfigurableTable
      :columns="columns"
      :data="branchStore.branches"
      :loading="loading"
      :actions="actions"
      @row-click="handleRowClick"
    >
      <!-- Тулбар с кнопками -->
      <template #toolbar>
        <button class="btn-create" @click="router.push('/branches/create')">
          + Создать ветку
        </button>
        <button 
          class="btn-refresh" 
          @click="fetchBranches" 
          :disabled="loading"
          title="Обновить список"
        >
          🔄
        </button>
      </template>
    </ConfigurableTable>

    <!-- Футер с навигацией -->
    <div class="view-footer">
      <router-link to="/" class="btn-back">← На главную</router-link>
    </div>
  </div>
</template>

<style scoped>
.branch-list-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 1.5rem;
}

.view-header h1 {
  font-size: 1.5rem;
  color: #1a365d;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Кнопки тулбара */
:deep(.table-toolbar) {
  display: flex;
  gap: 0.5rem;
}

.btn-create {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create:hover {
  background: #1d4ed8;
}

.btn-refresh {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.view-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-back {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  color: #1e293b;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s;
  font-weight: 500;
}

.btn-back:hover {
  background: #e2e8f0;
}
</style>