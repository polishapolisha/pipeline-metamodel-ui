import apiClient from './client';
import type { RepositoryDto, CreateRepositoryRequest } from '@/types/api';

export const repositoriesApi = {
  getAll: (): Promise<RepositoryDto[]> => 
    apiClient.get('/Repositories'),
  
  getById: (id: string): Promise<RepositoryDto> => 
    apiClient.get(`/Repositories/${id}`),
  
  create: (data: CreateRepositoryRequest): Promise<RepositoryDto> => 
    apiClient.post('/Repositories', data),
  
  update: (id: string, data: Partial<RepositoryDto>): Promise<RepositoryDto> => 
    apiClient.put(`/Repositories/${id}`, data),
  
  delete: (id: string): Promise<void> => 
    apiClient.delete(`/Repositories/${id}`),
};