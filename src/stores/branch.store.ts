// src/stores/branch.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { branchesApi } from '@/api/branches';
import type { BranchDto } from '@/types/api';

export const useBranchStore = defineStore('branch', () => {
  // Состояние
  const branches = ref<BranchDto[]>([]);
  const currentBranchId = ref<string>('00000000-0000-0000-0000-000000000000'); // main по умолчанию
  const isLoading = ref(false);

  // Геттеры
  const currentBranch = computed(() => 
    branches.value.find(b => b.id === currentBranchId.value)
  );

  const isMainBranch = computed(() => 
    currentBranchId.value === '00000000-0000-0000-0000-000000000000'
  );

  // Действия
  async function fetchBranches() {
    isLoading.value = true;
    try {
      branches.value = await branchesApi.getAll();
      // Если текущая ветка не в списке — переключаемся на main
      if (!branches.value.find(b => b.id === currentBranchId.value)) {
        currentBranchId.value = '00000000-0000-0000-0000-000000000000';
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function createBranch(sourceBranchId: string, name: string, description?: string) {
    const response = await branchesApi.create({ sourceBranchId, name, description });
    await fetchBranches(); // Обновляем список
    return response.branchId;
  }

  function switchBranch(branchId: string) {
    currentBranchId.value = branchId;
    // Здесь можно вызвать событие или обновить данные в других store
    console.log(`Switched to branch: ${branchId}`);
  }

  return {
    branches,
    currentBranchId,
    currentBranch,
    isMainBranch,
    isLoading,
    fetchBranches,
    createBranch,
    switchBranch,
  };
});