<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.push('/branches/select');
};
</script>

<template>
  <div class="repo-create">
    <header class="page-header">
      <h1>Создание репозитория</h1>
      <button class="btn-back" @click="goBack">← Назад</button>
    </header>
    
    <div class="placeholder">
      <p>🚧 Функционал создания репозитория в разработке</p>
      <button @click="goBack" class="btn-primary">Вернуться к списку</button>
    </div>
  </div>
</template>

<style scoped>
.repo-create { padding: 2rem; }
.page-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
.placeholder { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 12px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; margin-top: 1rem; }
</style>