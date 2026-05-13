<!-- src/components/editor/SuccessReturnModal.vue -->
<script setup lang="ts">
import { useReturnUrl } from '@/composables/useReturnUrl';

defineProps<{
  modelName?: string;
}>();

const emit = defineEmits<{
  (e: 'return'): void;
}>();

const { returnUrl, isExternalFlow, redirectToReturn } = useReturnUrl();

const handleReturn = () => {
  emit('return');
  redirectToReturn();
};
</script>

<template>
  <div class="modal-overlay">
    <div class="success-card">
      <div class="success-icon">✅</div>
      
      <h2 class="success-title">Метамодель успешно создана!</h2>
      
      <p v-if="modelName" class="success-details">
        <strong>{{ modelName }}</strong>
      </p>
      
      <p class="success-hint">
        {{ isExternalFlow 
          ? 'Вы можете вернуться к редактору схем' 
          : 'Продолжите работу в редакторе метамодели' 
        }}
      </p>

      <div class="modal-actions">
        <button 
          v-if="isExternalFlow"
          class="btn-return"
          @click="handleReturn"
        >
          ← Вернуться к редактору схем
        </button>
        
        <router-link 
          v-else
          to="/"
          class="btn-dashboard"
        >
          Перейти на главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.success-card {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.success-details {
  color: #64748b;
  margin-bottom: 1rem;
}

.success-hint {
  color: #475569;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-return {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-return:hover {
  background: #1d4ed8;
}

.btn-dashboard {
  background: #f1f5f9;
  color: #1e293b;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-dashboard:hover {
  background: #e2e8f0;
}
</style>