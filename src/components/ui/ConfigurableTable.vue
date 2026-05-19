<!-- src/components/ui/ConfigurableTable.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue';
import type { ColumnConfig, TableAction } from '@/types/table';

const props = defineProps<{
  columns: ColumnConfig<T>[];
  data: T[];
  loading?: boolean;
  actions?: TableAction[];
  selectable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'row-click', row: T): void;
  (e: 'action', action: string, row: T): void;
}>();

// Сортировка
const sortKey = ref<keyof T | null>(null);
const sortAsc = ref(true);

const sortedData = computed(() => {
  if (!sortKey.value) return props.data;
  
  return [...props.data].sort((a, b) => {
    const valA = a[sortKey.value!];
    const valB = b[sortKey.value!];
    
    if (valA === valB) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    
    const comparison = valA > valB ? 1 : -1;
    return sortAsc.value ? comparison : -comparison;
  });
});

const handleSort = (key: keyof T) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
};

const visibleColumns = computed(() => 
  props.columns.filter(col => col.visible !== false)
);

const formatValue = (col: ColumnConfig<T>, row: T) => {
  const value = row[col.key as keyof T];
  if (col.formatter) return col.formatter(value, row);
  if (typeof value === 'boolean') return value ? '✅' : '—';
  if (value instanceof Date) return value.toLocaleDateString('ru-RU');
  return value ?? '—';
};
</script>

<template>
  <div class="table-wrapper">
    <!-- Toolbar slot -->
    <div v-if="$slots.toolbar" class="table-toolbar">
      <slot name="toolbar" />
    </div>

    <!-- Table -->
    <div class="table-container" :class="{ loading }">
      <table class="metamodel-table">
        <thead>
          <tr>
            <th v-if="selectable" class="col-select"></th>
            <th 
              v-for="col in visibleColumns" 
              :key="String(col.key)"
              :style="{ width: col.width }"
              :class="{ sortable: col.sortable }"
              @click="col.sortable && handleSort(col.key as keyof T)"
            >
              {{ col.title }}
              <span v-if="sortKey === col.key" class="sort-icon">
                {{ sortAsc ? '▲' : '▼' }}
              </span>
            </th>
            <th v-if="actions?.length" class="col-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, idx) in sortedData" 
            :key="row.id || idx"
            class="table-row"
            @click="emit('row-click', row)"
          >
            <td v-if="selectable" @click.stop>
              <input type="checkbox" />
            </td>
            <td 
              v-for="col in visibleColumns" 
              :key="String(col.key)"
              class="table-cell"
            >
              <component 
                v-if="col.customRender" 
                :is="col.customRender(row, idx)" 
              />
              <span v-else class="cell-content">
                {{ formatValue(col, row) }}
              </span>
            </td>
            <td v-if="actions?.length" class="cell-actions" @click.stop>
              <button 
                v-for="action in actions.filter(a => !a.visible || a.visible(row))"
                :key="action.label"
                :class="['btn-action', action.variant || 'secondary']"
                @click="emit('action', action.label, row)"
                :title="action.label"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
          <tr v-if="!sortedData.length && !loading">
            <td :colspan="visibleColumns.length + (actions?.length ? 1 : 0) + (selectable ? 1 : 0)" class="empty-cell">
              Нет данных для отображения
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>Загрузка...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-toolbar {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.table-container {
  overflow-x: auto;
  position: relative;
  min-height: 200px;
}

.table-container.loading {
  opacity: 0.6;
  pointer-events: none;
}

.metamodel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.metamodel-table th {
  background: #f8fafc;
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

.metamodel-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.metamodel-table th.sortable:hover {
  background: #f1f5f9;
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.metamodel-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
}

.table-row:hover {
  background: #f8fafc;
}

.cell-content {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.col-actions {
  width: 1%;
  white-space: nowrap;
}

.cell-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.25rem 0.5rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-action.danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-action:hover {
  filter: brightness(0.95);
}

.empty-cell {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #64748b;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>