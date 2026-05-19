<!-- src/App.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useBranchStore } from '@/stores/branch.store';

const branchStore = useBranchStore();

// Загружаем репозитории при старте (для отображения контекста в шапке)
onMounted(async () => {
  try {
    await branchStore.fetchRepositories();
  } catch (error) {
    console.warn('⚠️ Не удалось загрузить репозитории:', error);
  }
});
</script>

<template>
  <div class="app-layout">
    <!-- Шапка -->
    <header class="app-header">
      <div class="header-content">
        <router-link to="/" class="app-title">
          🛢️ Pipeline Metamodel Editor
        </router-link>
        
        <!-- Безопасный вывод контекста (без ошибок undefined) -->
        <div class="context-badge" v-if="branchStore.currentRepository">
          <span class="repo">📁 {{ branchStore.currentRepository.name }}</span>
          <span 
            v-if="branchStore.currentContent?.branchName" 
            class="branch"
          >
            🔀 {{ branchStore.currentContent.branchName }}
          </span>
        </div>
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
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.app-title:hover {
  opacity: 0.9;
}

.context-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
}

.context-badge .repo {
  font-weight: 500;
}

.context-badge .branch {
  color: #93c5fd;
  border-left: 1px solid rgba(255,255,255,0.3);
  padding-left: 0.75rem;
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