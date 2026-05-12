import apiClient from './client';
import type { BranchDto, CreateBranchRequest, PublishBranchRequest } from '@/types/api';

export const branchesApi = {
  // Получить все ветки
  getAll: (): Promise<BranchDto[]> => {
    return apiClient.get<BranchDto[]>('/Branches');
  },

  // Создать новую ветку (с копированием данных)
  create: (data: CreateBranchRequest): Promise<{ branchId: string }> => {
    return apiClient.post<{ branchId: string }>('/Branches', data);
  },

  // Опубликовать версию в Git
  publish: (branchId: string, data: PublishBranchRequest): Promise<{ commitHash: string; message: string }> => {
    return apiClient.post<{ commitHash: string; message: string }>(`/Branches/${branchId}/publish`, data);
  },

  // Сравнить две версии (diff)
  getDiff: (commitA: string, commitB: string): Promise<any> => {
    return apiClient.get('/Branches/versions/diff', { params: { commitA, commitB } });
  },
};