// src/api/entities.ts
import apiClient from './client';
import type { ObjectTypeDto, TypeParameterDto, UnitDto, ImageDto } from '@/types/api';

// === ObjectType ===
export const objectTypesApi = {
  getAll: (branchId: string): Promise<ObjectTypeDto[]> => 
    apiClient.get('/ObjectTypes', { params: { branchId } }),
  
  getById: (id: string): Promise<ObjectTypeDto> => 
    apiClient.get(`/ObjectTypes/${id}`),
  
  create: (data: Omit<ObjectTypeDto, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post('/ObjectTypes', data),
  
  update: (id: string, data: Partial<ObjectTypeDto>) => 
    apiClient.put(`/ObjectTypes/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/ObjectTypes/${id}`),
};

// === TypeParameter ===
export const parametersApi = {
  getAll: (branchId: string, objectTypeId?: string): Promise<TypeParameterDto[]> => 
    apiClient.get('/TypeParameters', { 
      params: objectTypeId 
        ? { branchId, objectTypeId }
        : { branchId }
    }),
  
  getByObject: (objectTypeId: string): Promise<TypeParameterDto[]> => 
    apiClient.get(`/TypeParameters/by-object/${objectTypeId}`),
  
  create: (data: Omit<TypeParameterDto, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post('/TypeParameters', data),
  
  update: (id: string, data: Partial<TypeParameterDto>) => 
    apiClient.put(`/TypeParameters/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/TypeParameters/${id}`),
};

// === Unit ===
export const unitsApi = {
  getAll: (branchId: string): Promise<UnitDto[]> => 
    apiClient.get('/Units', { params: { branchId } }),
  
  create: (data: Omit<UnitDto, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post('/Units', data),
  
  update: (id: string, data: Partial<UnitDto>) => 
    apiClient.put(`/Units/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/Units/${id}`),
};

// === Image ===
export const imagesApi = {
  getAll: (branchId: string): Promise<ImageDto[]> => 
    apiClient.get('/Images', { params: { branchId } }),
  
  upload: (formData: FormData) => 
    apiClient.post('/Images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: string) => 
    apiClient.delete(`/Images/${id}`),
};