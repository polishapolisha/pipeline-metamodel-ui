// src/stores/branch.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { branchesApi } from '@/api/branches';
import { repositoriesApi } from '@/api/repositories';
import { entitiesApi } from '@/api/entities';

// 🔥 FIX 1: Добавлены недостающие типы
import type { 
  BranchDto, BranchContentDto, RepositoryDto, 
  CreateBranchRequest, PublishBranchResponse,
  CreateObjectTypeRequest, UpdateObjectTypeRequest,
  CreateTypeParameterRequest, UpdateTypeParameterRequest,
  CreateUnitRequest, UnitDto, ImageDto,
  ObjectTypeDto, TypeParameterDto
} from '@/types/api';

export const useBranchStore = defineStore('branch', () => {
  // === Состояние ===
  const repositories = ref<RepositoryDto[]>([]);
  const branches = ref<BranchDto[]>([]);
  const currentContent = ref<BranchContentDto | null>(null);
  const currentRepositoryId = ref<string | null>(null);
  const currentBranchId = ref<string | null>(null);
  const isLoading = ref(false);
  const isPublishing = ref(false);

  // === Геттеры ===
  const currentRepository = computed(() => repositories.value.find(r => r.id === currentRepositoryId.value));
  const hasContent = computed(() => currentContent.value !== null);
  const objectTypes = computed(() => currentContent.value?.objectTypes || []);
  const parameters = computed(() => currentContent.value?.typeParameters || []);
  const units = computed(() => currentContent.value?.units || []);
  const images = computed(() => currentContent.value?.images || []);
  
  // 🔥 НОВЫЙ ГЕТТЕР: Найти main ветку текущего репозитория
  const mainBranch = computed(() => {
    if (!currentRepositoryId.value || !branches.value.length) return null;
    return branches.value.find(b => b.isMain === true && b.repositoryId === currentRepositoryId.value) || null;
  });
  
  // 🔥 НОВЫЙ ГЕТТЕР: ID main ветки (удобно для form.sourceBranchId)
  const mainBranchId = computed(() => mainBranch.value?.id || null);

  // === Действия ===
  async function fetchRepositories() {
    repositories.value = await repositoriesApi.getAll() as unknown as RepositoryDto[];
    if (!currentRepositoryId.value && repositories.value.length) {
      currentRepositoryId.value = repositories.value[0].id;
    }
  }

  async function fetchBranches(repositoryId: string) {
    if (!repositoryId) return;
    isLoading.value = true;
    try {
      const response = await fetch(`/api/Repositories/${repositoryId}/branches`, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rawData = await response.json();
      branches.value = Array.isArray(rawData) ? rawData : [];
      
      // 🔥 FIX: Автоматически выбираем main ветку если есть
      const mainBranch = branches.value.find((b: BranchDto) => b.isMain === true);
      if (mainBranch && !currentBranchId.value) {
        currentBranchId.value = mainBranch.id;
      } else if (!currentBranchId.value && branches.value.length > 0) {
        currentBranchId.value = branches.value[0].id;
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      branches.value = [];
    } finally {
      isLoading.value = false;
    }
  }
  
  // 🔥 НОВЫЙ МЕТОД: Загрузить ветки и вернуть ID main ветки
  async function loadBranchesAndGetMainId(repositoryId: string): Promise<string | null> {
    if (!repositoryId) return null;
    
    try {
      // Загружаем все ветки репозитория
      await fetchBranches(repositoryId);
      
      // Ищем main ветку
      const mainBranch = branches.value.find((b: BranchDto) => 
        b.isMain === true && b.repositoryId === repositoryId
      );
      
      if (mainBranch) {
        console.log('✅ Found main branch:', mainBranch.name, mainBranch.id);
        return mainBranch.id;
      } else {
        console.warn('⚠️ No main branch found in repository:', repositoryId);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load branches:', error);
      return null;
    }
  }

  async function loadBranchContent(branchId: string) {
    isLoading.value = true;
    try {
      // 🔥 FIX 2: Безопасное приведение для строгого TS
      const content = await branchesApi.getContent(branchId) as unknown as BranchContentDto;
      
      if (!content || !content.branchId) throw new Error('Пустой ответ сервера');

      currentContent.value = content;
      currentBranchId.value = content.branchId;
      currentRepositoryId.value = content.repositoryId;
      return content;
    } catch (error: any) {
      console.error('❌ loadBranchContent failed:', error);
      currentContent.value = null;
      if (error.response?.status === 404) throw new Error('Ветка не найдена');
      throw new Error(error.message || 'Ошибка загрузки данных');
    } finally {
      isLoading.value = false;
    }
  }

  async function createBranch(data: CreateBranchRequest) {
    if (!data.repositoryId) throw new Error('repositoryId is required');
    const result = await branchesApi.create(data) as unknown as { branchId: string };
    await loadBranchContent(result.branchId);
    return result.branchId;
  }

  async function publishBranch(branchId: string, message: string): Promise<PublishBranchResponse> {
    isPublishing.value = true;
    try {
      const result = await branchesApi.publish(branchId, { message }) as unknown as PublishBranchResponse;
      if (branchId === currentBranchId.value) await loadBranchContent(branchId);
      return result;
    } finally {
      isPublishing.value = false;
    }
  }

  // === ObjectType CRUD ===
  async function addObjectType(data: CreateObjectTypeRequest) {
    const newItem = await entitiesApi.createObjectType(data) as unknown as ObjectTypeDto;
    if (currentContent.value) currentContent.value.objectTypes.push(newItem);
    return newItem;
  }
  async function updateObjectType(id: string, data: UpdateObjectTypeRequest) {
    const updated = await entitiesApi.updateObjectType(id, data) as unknown as ObjectTypeDto;
    if (currentContent.value) {
      const idx = currentContent.value.objectTypes.findIndex(o => o.id === id);
      if (idx !== -1) currentContent.value.objectTypes[idx] = updated;
    }
    return updated;
  }
  async function deleteObjectType(id: string) {
    await entitiesApi.deleteObjectType(id);
    if (currentContent.value) {
      currentContent.value.objectTypes = currentContent.value.objectTypes.filter(o => o.id !== id);
      currentContent.value.typeParameters = currentContent.value.typeParameters.filter(p => p.objectTypeId !== id);
    }
  }

  // === TypeParameter CRUD ===
  async function addParameter(data: CreateTypeParameterRequest) {
    const newItem = await entitiesApi.createParameter(data) as unknown as TypeParameterDto;
    if (currentContent.value) currentContent.value.typeParameters.push(newItem);
    return newItem;
  }
  async function updateParameter(id: string, data: UpdateTypeParameterRequest) {
    const updated = await entitiesApi.updateParameter(id, data) as unknown as TypeParameterDto;
    if (currentContent.value) {
      const idx = currentContent.value.typeParameters.findIndex(p => p.id === id);
      if (idx !== -1) currentContent.value.typeParameters[idx] = updated;
    }
    return updated;
  }
  async function deleteParameter(id: string) {
    await entitiesApi.deleteParameter(id);
    if (currentContent.value) currentContent.value.typeParameters = currentContent.value.typeParameters.filter(p => p.id !== id);
  }

  // === Unit CRUD ===
  async function addUnit(data: CreateUnitRequest) {
    const newItem = await entitiesApi.createUnit(data) as unknown as UnitDto;
    if (currentContent.value) currentContent.value.units.push(newItem);
    return newItem;
  }
  async function updateUnit(id: string, data: Partial<UnitDto>) {
    const updated = await entitiesApi.updateUnit(id, data) as unknown as UnitDto;
    if (currentContent.value) {
      const idx = currentContent.value.units.findIndex(u => u.id === id);
      if (idx !== -1) currentContent.value.units[idx] = updated;
    }
    return updated;
  }
  async function deleteUnit(id: string) {
    await entitiesApi.deleteUnit(id);
    if (currentContent.value) currentContent.value.units = currentContent.value.units.filter(u => u.id !== id);
  }

  // === Image CRUD ===
  async function uploadImage(branchId: string, formData: FormData) {
    const newItem = await entitiesApi.uploadImage(branchId, formData) as unknown as ImageDto;
    if (currentContent.value) currentContent.value.images.push(newItem);
    return newItem;
  }
  async function deleteImage(id: string) {
    await entitiesApi.deleteImage(id);
    if (currentContent.value) currentContent.value.images = currentContent.value.images.filter(img => img.id !== id);
  }

  function switchContext(repositoryId: string, branchId?: string) {
    currentRepositoryId.value = repositoryId;
    if (branchId && branchId !== currentBranchId.value) loadBranchContent(branchId);
  }

  function clearContent() {
    currentContent.value = null;
    currentBranchId.value = null;
  }

  return {
    repositories, branches, currentContent, currentRepositoryId, currentBranchId,
    isLoading, isPublishing,
    currentRepository, hasContent, objectTypes, parameters, units, images,
    mainBranch, mainBranchId,  // 🔥 Добавлено в return
    fetchRepositories, fetchBranches, loadBranchContent, createBranch, publishBranch,
    loadBranchesAndGetMainId,  // 🔥 Добавлено в return
    addObjectType, updateObjectType, deleteObjectType,
    addParameter, updateParameter, deleteParameter,
    addUnit, updateUnit, deleteUnit,
    uploadImage, deleteImage,
    switchContext, clearContent,
  };
});