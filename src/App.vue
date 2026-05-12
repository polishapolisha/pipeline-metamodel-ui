<!-- src/App.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useBranchStore } from '@/stores/branch.store';

const branchStore = useBranchStore();

// Загружаем список веток при старте приложения
onMounted(async () => {
  try {
    await branchStore.fetchBranches();
    console.log('✓ Ветки загружены:', branchStore.branches.length);
  } catch (error) {
    console.error('✗ Не удалось загрузить ветки:', error);
  }
});
</script>

<template>
  <div class="app-layout">
    <!-- Шапка приложения -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🛢️ Pipeline Metamodel Editor</h1>
        
        <!-- Селектор веток (базовая версия) -->
        <div class="branch-selector" v-if="branchStore.branches.length">
          <label for="branch-select">Ветка:</label>
          <select 
            id="branch-select"
            v-model="branchStore.currentBranchId"
            @change="branchStore.switchBranch(branchStore.currentBranchId)"
          >
            <option 
              v-for="branch in branchStore.branches" 
              :key="branch.id" 
              :value="branch.id"
            >
              {{ branch.name }}{{ branch.id === '00000000-0000-0000-0000-000000000000' ? ' (main)' : '' }}
            </option>
          </select>
        </div>
        <span v-else class="loading">Загрузка веток...</span>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Футер -->
    <footer class="app-footer">
      <small>Дипломный проект • Редактор метамодели трубопроводного транспорта</small>
    </footer>
  </div>
</template>

<style>
/* Глобальные сбросы */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
  color: #2c3e50;
  line-height: 1.5;
}
</style>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #1a365d;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.branch-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.branch-selector label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.branch-selector select {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: none;
  background: #2d4a7c;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.branch-selector select:focus {
  outline: 2px solid #63b3ed;
}

.loading {
  font-size: 0.9rem;
  opacity: 0.8;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: #e2e8f0;
  padding: 0.75rem 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}
</style>