<!-- src/views/branches/BranchCreateView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBranchStore } from '@/stores/branch.store';
import type { CreateBranchRequest } from '@/types/api';
console.log('🟢 BranchCreateView компонент загрузился!');
console.log('📍 Текущий маршрут:', useRoute().path);
console.log('📦 ID репозитория из URL:', useRoute().params.repositoryId);

const router = useRouter();
const route = useRoute();
const branchStore = useBranchStore();

const repositoryId = ref<string>(route.query.repositoryId as string || '');
const form = ref<CreateBranchRequest>({
  name: '',
  description: '',
  repositoryId: repositoryId.value,
  sourceBranchId: null, // Будет установлен автоматически
});

const errors = ref<Record<string, string>>({});
const submitting = ref(false);
const mainBranch = ref<any>(null);
const isLoading = ref(true);

// 🔥 Загружаем Main ветку при монтировании
onMounted(async () => {
  if (!repositoryId.value) {
    errors.value.repositoryId = 'Репозиторий не указан';
    isLoading.value = false;
    return;
  }
  
  form.value.repositoryId = repositoryId.value;
  
  try {
    console.log('🔍 Loading branches for repository:', repositoryId.value);
    
    await branchStore.fetchBranches(repositoryId.value);
    
    console.log('📦 All branches loaded:', branchStore.branches);
    console.log('📦 Total branches:', branchStore.branches.length);
    
    // 🔥 Проверяем ВСЕ ветки
    branchStore.branches.forEach((branch: any, index: number) => {
      console.log(`\n📋 Branch #${index + 1}:`);
      console.log('  - ID:', branch.id);
      console.log('  - Name:', branch.name);
      console.log('  - RepositoryId:', branch.repositoryId);
      console.log('  - IsMain:', branch.isMain, `(type: ${typeof branch.isMain})`);
      console.log('  - Matches repositoryId?', branch.repositoryId === repositoryId.value);
      console.log('  - Is isMain === true?', branch.isMain === true);
    });
    
    // 🔥 Ищем main ветку
    const foundMain = branchStore.branches.find(
      (b: any) => {
        const isMainMatch = b.isMain === true;
        const repoMatch = b.repositoryId === repositoryId.value;
        console.log('\n🔍 Checking branch:', b.name, '→ isMain:', isMainMatch, 'repoMatch:', repoMatch);
        return isMainMatch && repoMatch;
      }
    );
    
    if (foundMain) {
      mainBranch.value = foundMain;
      form.value.sourceBranchId = foundMain.id;
      console.log('\n✅ FOUND Main branch:', foundMain.name, foundMain.id);
    } else {
      console.warn('\n❌ No Main branch found!');
      console.warn('Expected repositoryId:', repositoryId.value);
      console.warn('Available branches:', branchStore.branches.map((b: any) => ({
        name: b.name,
        isMain: b.isMain,
        repoId: b.repositoryId
      })));
      
      // Временное решение
      form.value.sourceBranchId = null;
    }
  } catch (err) {
    console.error('Failed to load branches:', err);
    form.value.sourceBranchId = null;
  } finally {
    isLoading.value = false;
  }
});

function validate(): boolean {
  errors.value = {};
  let valid = true;
  
  if (!form.value.name?.trim()) {
    errors.value.name = 'Название ветки обязательно';
    valid = false;
  }
  if (!form.value.repositoryId) {
    errors.value.repositoryId = 'Репозиторий не указан';
    valid = false;
  }
  if (!form.value.sourceBranchId) {
    errors.value.sourceBranchId = 'Источник копирования не найден';
    valid = false;
  }
  
  return valid;
}

const handleSubmit = async () => {
  if (!validate()) return;
  
  submitting.value = true;
  try {
    // 🔥 Отправляем ТОЛЬКО с Main как источником
    const payload: Record<string, any> = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      repositoryId: form.value.repositoryId,
      sourceBranchId: form.value.sourceBranchId, // ВСЕГДА Main
    };
    
    console.log('📤 Creating branch with Main as source:', payload);
    
    const newBranchId = await branchStore.createBranch(payload as CreateBranchRequest);
    
    alert('✅ Ветка создана!');
    router.push(`/branches/${newBranchId}/edit`);
    
  } catch (err: any) {
    console.error('❌ Create branch error:', err);
    
    let errorMsg = 'Не удалось создать ветку';
    
    if (err.response?.data?.errors) {
      const messages = err.response.data.errors.map((e: any) => {
        const fieldName: Record<string, string> = {
          'Name': 'Название',
          'RepositoryId': 'Репозиторий',
          'SourceBranchId': 'Исходная ветка'
        };
        return `${fieldName[e.field] || e.field}: ${e.message}`;
      });
      if (messages.length) errorMsg = messages.join('\n');
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    }
    
    alert(errorMsg);
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push('/branches/select');
};
</script>

<template>
  <div class="branch-create">
    <header class="page-header">
      <h1>Создание ветки</h1>
      <button class="btn-back" @click="goBack">← Назад</button>
    </header>

    <!-- Загрузка -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка данных репозитория...</p>
    </div>

    <!-- Ошибка: нет Main ветки -->
    <div v-else-if="errors.general" class="error-banner">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ errors.general }}</div>
      <button class="btn-back" @click="goBack">Вернуться к репозиторию</button>
    </div>

    <!-- Форма -->
    <form v-else @submit.prevent="handleSubmit" class="create-form">
      <div class="form-group">
        <label for="name">Название ветки *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="feature/new-pipeline"
          :disabled="submitting"
          class="form-input"
          :class="{ error: errors.name }"
        />
        <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="description">Описание</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Описание изменений..."
          :disabled="submitting"
          rows="3"
          class="form-input"
        />
      </div>

      <!-- 🔥 Источник копирования (ТОЛЬКО Main, без выбора) -->
      <div class="form-group">
        <label>Источник копирования</label>
        <div class="source-branch-info">
          <div class="branch-badge">
            <span class="branch-icon">🌿</span>
            <span class="branch-name">{{ mainBranch?.name }}</span>
            <span class="branch-label">основная ветка</span>
          </div>
          <p class="form-hint">
            Новая ветка будет создана на основе <strong>{{ mainBranch?.name }}</strong> 
            и унаследует все её объекты
          </p>
        </div>
        <!-- Скрытое поле для отправки -->
        <input type="hidden" v-model="form.sourceBranchId" />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="goBack" :disabled="submitting">
          Отмена
        </button>
        <button type="submit" class="btn-primary" :disabled="submitting || !mainBranch">
          {{ submitting ? 'Создание...' : 'Создать ветку' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.branch-create { padding: 2rem; max-width: 600px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.5rem; color: #1a365d; }
.btn-back { background: none; border: none; color: #2563eb; cursor: pointer; font-weight: 500; padding: 0.5rem 1rem; }
.btn-back:hover { background: #f1f5f9; border-radius: 4px; }

/* Loading state */
.loading-state { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 12px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Error banner */
.error-banner { background: #fef2f2; border: 2px solid #fecaca; color: #dc2626; padding: 1.5rem; border-radius: 12px; display: flex; align-items: flex-start; gap: 1rem; }
.error-icon { font-size: 1.5rem; }
.error-message { flex: 1; font-weight: 500; }
.error-banner .btn-back { background: #dc2626; color: white; padding: 0.5rem 1rem; border-radius: 6px; }
.error-banner .btn-back:hover { background: #b91c1c; }

/* Form */
.create-form { background: #fff; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
.form-input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; transition: all 0.2s; }
.form-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.form-input.error { border-color: #ef4444; }
.form-error { color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; }

/* Source branch info (read-only) */
.source-branch-info { background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 1rem; }
.branch-badge { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.branch-icon { font-size: 1.25rem; }
.branch-name { font-weight: 700; color: #166534; font-size: 1.1rem; }
.branch-label { background: #86efac; color: #166534; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.form-hint { color: #15803d; font-size: 0.875rem; margin: 0; }
.form-hint strong { color: #166534; }

/* Actions */
.form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
.btn-cancel { background: #f1f5f9; color: #1e293b; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.2s; }
.btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
</style>