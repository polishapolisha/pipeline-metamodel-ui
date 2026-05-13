<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToEditExisting = () => {
  router.push('/branches/select');
};

const goToCreateNew = () => {
  router.push('/branches/create');
};
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>🛢️ Pipeline Metamodel Editor</h1>
      <p class="subtitle">Редактор метамодели трубопроводного транспорта нефти и газа</p>
    </div>

    <div class="dashboard-actions">
      <!-- Карточка 1: Редактировать -->
      <div class="action-card" @click="goToEditExisting">
        <div class="action-icon">📝</div>
        <h2>Редактировать существующую метамодель</h2>
        <p>Выберите ветку и версию для редактирования объектов:</p>
        <ul>
          <li>Типы объектов (ObjectType)</li>
          <li>Параметры (TypeParameter)</li>
          <li>Единицы измерения (Unit)</li>
          <li>Изображения (Image)</li>
        </ul>
        <button class="btn-action">Выбрать ветку →</button>
      </div>

      <!-- Карточка 2: Создать -->
      <div class="action-card" @click="goToCreateNew">
        <div class="action-icon">✨</div>
        <h2>Создать новую метамодель</h2>
        <p>Создайте новую ветку и заполните сущности:</p>
        <ul>
          <li>Табличный редактор для всех типов</li>
          <li>Валидация данных</li>
          <li>Публикация в Git</li>
        </ul>
        <button class="btn-action btn-primary">Создать метамодель →</button>
      </div>
    </div>

    <!-- Интеграция с Лерой: если есть returnTo -->
    <div v-if="$route.query.returnTo" class="external-flow-hint">
      <p>ℹ️ Вы перешли из графического редактора схем</p>
      <p>После создания метамодели вы сможете вернуться обратно</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  border-color: #2563eb;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h2 {
  font-size: 1.25rem;
  color: #1a365d;
  margin-bottom: 0.75rem;
}

.action-card p {
  color: #64748b;
  margin-bottom: 1rem;
}

.action-card ul {
  color: #475569;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.action-card li {
  margin-bottom: 0.4rem;
}

.btn-action {
  background: #f1f5f9;
  color: #1e293b;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.external-flow-hint {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #92400e;
}
</style>