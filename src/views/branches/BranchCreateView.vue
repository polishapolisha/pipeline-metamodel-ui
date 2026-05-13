<!-- src/views/branches/BranchCreateView.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBranchStore } from '@/stores/branch.store';
import { useReturnUrl } from '@/composables/useReturnUrl';
import SuccessReturnModal from '@/components/editor/SuccessReturnModal.vue';

const router = useRouter();
const route = useRoute();
const branchStore = useBranchStore();
const { returnUrl, isExternalFlow, redirectToReturn } = useReturnUrl();

const form = ref({
  name: '',
  description: '',
  sourceBranchId: '00000000-0000-0000-0000-000000000000' // копируем из main
});

const loading = ref(false);
const error = ref<string | null>(null);
const showSuccess = ref(false);
const createdBranchId = ref<string | null>(null);

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    error.value = 'Введите название ветки';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const newId = await branchStore.createBranch(
      form.value.sourceBranchId,
      form.value.name.trim(),
      form.value.description.trim()
    );
    
    createdBranchId.value = newId;
    
    if (isExternalFlow.value) {
      // Если пришли от Леры — показываем модалку возврата
      showSuccess.value = true;
    } else {
      // Иначе переходим в редактор созданной ветки
      router.push(`/branches/${newId}/edit`);
    }
  } catch (err: any) {
    console.error('Create branch error:', err);
    error.value = err.response?.data?.message || 'Не удалось создать ветку';
  } finally {
    loading.value = false;
  }
};

const handleReturn = () => {
  if (createdBranchId.value) {
    // Можно передать ID созданной ветки обратно
    const url = new URL(returnUrl.value);
    url.searchParams.set('createdBranchId', createdBranchId.value);
    window.location.href = url.toString();
  } else {
    redirectToReturn();
  }
};
</script>

<template>
  <div class="branch-create-view">
    <header class="view-header">
      <h1>✨ Создание новой ветки</h1>
      <p class="subtitle">Новая ветка будет создана на основе копии главной</p>
    </header>

    <div class="form-card">
      <form @submit.prevent="handleSubmit" class="create-form">
        <div class="form-group">
          <label for="name">Название ветки *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Например: feature/new-pump-type"
            :disabled="loading"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Краткое описание изменений..."
            :disabled="loading"
            rows="4"
          />
        </div>

        <div class="form-group">
          <label>Источник копирования</label>
          <div class="source-info">
            🌿 main (основная ветка)
          </div>
        </div>

        <div v-if="error" class="form-error">
          ⚠️ {{ error }}
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel"
            @click="router.back()"
            :disabled="loading"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            class="btn-create"
            :disabled="loading || !form.name.trim()"
          >
            {{ loading ? 'Создание...' : 'Создать ветку' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Модалка успеха для интеграции с Лерой -->
    <SuccessReturnModal 
      v-if="showSuccess"
      :model-name="form.name"
      @return="handleReturn"
    />

    <div class="view-footer">
      <router-link to="/branches/select" class="btn-back">
        ← К списку веток
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.branch-create-view {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 1.5rem;
  color: #1a365d;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #334155;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.source-info {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.form-error {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #1e293b;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-create {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-create:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-create:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.view-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-back {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.btn-back:hover {
  text-decoration: underline;
}
</style>