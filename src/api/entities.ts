// src/api/entities.ts
import apiClient from './client';
import type { 
  ObjectTypeDto, CreateObjectTypeRequest, UpdateObjectTypeRequest,
  TypeParameterDto, CreateTypeParameterRequest, UpdateTypeParameterRequest,
  UnitDto, CreateUnitRequest, ImageDto 
} from '@/types/api';

export const entitiesApi = {
  createObjectType: (data: CreateObjectTypeRequest) => apiClient.post<ObjectTypeDto>('/ObjectTypes', data),
  updateObjectType: (id: string, data: UpdateObjectTypeRequest) => apiClient.put<ObjectTypeDto>(`/ObjectTypes/${id}`, data),
  deleteObjectType: (id: string) => apiClient.delete<void>(`/ObjectTypes/${id}`),
  
  createParameter: (data: CreateTypeParameterRequest) => apiClient.post<TypeParameterDto>('/TypeParameters', data),
  updateParameter: (id: string, data: UpdateTypeParameterRequest) => apiClient.put<TypeParameterDto>(`/TypeParameters/${id}`, data),
  deleteParameter: (id: string) => apiClient.delete<void>(`/TypeParameters/${id}`),
  
  createUnit: (data: CreateUnitRequest) => apiClient.post<UnitDto>('/Units', data),
  updateUnit: (id: string, data: Partial<UnitDto>) => apiClient.put<UnitDto>(`/Units/${id}`, data),
  deleteUnit: (id: string) => apiClient.delete<void>(`/Units/${id}`),
  
  //  ИСПРАВЛЕНА ФУНКЦИЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ
  uploadImage: (branchId: string, formData: FormData) => {
    formData.append('branchId', branchId);
    return apiClient.post<ImageDto>('/Images', formData);
  },
  deleteImage: (id: string) => apiClient.delete<void>(`/Images/${id}`),
};