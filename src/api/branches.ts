// src/api/branches.ts
import apiClient from './client';
import type { 
  BranchDto, BranchContentDto, 
  CreateBranchRequest, PublishBranchRequest, PublishBranchResponse 
} from '@/types/api';

export const branchesApi = {
  getContent: (branchId: string) => apiClient.get<BranchContentDto>(`/Branches/${branchId}/content`),
  getAll: (repositoryId: string) => apiClient.get<BranchDto[]>(`/Repositories/${repositoryId}/branches`),
  getById: (id: string) => apiClient.get<BranchDto>(`/Branches/${id}`),
  create: (data: CreateBranchRequest) => apiClient.post<{ branchId: string }>('/Branches', data),
  update: (id: string, data: { name?: string; description?: string }) => apiClient.put<BranchDto>(`/Branches/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/Branches/${id}`),
  publish: (branchId: string, data: PublishBranchRequest) => apiClient.post<PublishBranchResponse>(`/Branches/${branchId}/publish`, data),
};