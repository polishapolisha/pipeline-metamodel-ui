<!-- src/views/entities/EntityTypeEditor.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const { branchId, entityType } = route.params;

console.log('Editing entity:', { branchId, entityType });
</script>

<template>
  <div class="entity-editor">
    <header class="editor-header">
      <h1>📝 Редактор: {{ entityType }}</h1>
      <p>Ветка: {{ branchId }}</p>
    </header>

    <div class="editor-content">
      <p> Здесь будет табличный редактор для {{ entityType }}</p>
      <ul>
        <li>ConfigurableTable с настраиваемыми колонками</li>
        <li>Toolbar с кнопками (+ Добавить, Экспорт, Фильтры)</li>
        <li>Возможность редактирования и удаления</li>
        <li>Сохранение в БД и публикация в Git</li>
      </ul>
    </div>

    <footer class="editor-footer">
      <button class="btn-back" @click="router.back()">
        ← Назад
      </button>
      <button class="btn-save" disabled>
        💾 Сохранить (в разработке)
      </button>
    </footer>
  </div>
</template>

<style scoped>
.entity-editor {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.editor-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.editor-header h1 {
  font-size: 1.5rem;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.editor-header p {
  color: #64748b;
}

.editor-content {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.editor-content p {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 1rem;
}

.editor-content ul {
  color: #64748b;
  padding-left: 1.5rem;
}

.editor-content li {
  margin-bottom: 0.5rem;
}

.editor-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

.btn-save {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>