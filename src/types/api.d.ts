// src/types/api.d.ts

// === ОБЩИЙ КОНТЕКСТ (встроен в каждый объект) ===
export interface MetamodelContext {
  repositoryId: string;
  repositoryName: string;
  branchId: string;
  branchName: string;
}

// === ОТВЕТ ЭНДПОИНТА /content ===
export interface BranchContentDto {
  branchId: string;
  branchName: string;
  repositoryId: string;
  repositoryName: string;
  objectTypes: ObjectTypeDto[];
  typeParameters: TypeParameterDto[];
  units: UnitDto[];
  images: ImageDto[];
}

// === РЕПОЗИТОРИИ ===
export interface RepositoryDto {
  id: string;
  name: string;
  description?: string | null;
  remoteUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateRepositoryRequest {
  name: string;
  description?: string | null;
  remoteUrl?: string | null;
}

// === ВЕТКИ ===
export interface BranchDto extends MetamodelContext {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  parentBranchId?: string | null;
  parentBranchName?: string | null;
  isMain: boolean;
}

export interface CreateBranchRequest {
  repositoryId: string;
  sourceBranchId?: string | null;
  name: string;
  description?: string | null;
}

export interface PublishBranchRequest {
  message: string;
}

export interface PublishBranchResponse {
  commitHash: string;
  message: string;
  publishedAt: string;
  isSyncedToGit: boolean;
}

// === ObjectType ===
export interface ObjectTypeDto extends MetamodelContext {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  parentId?: string | null;
  iconId?: string | null;
  isAbstract: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateObjectTypeRequest {
  branchId: string;
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  isAbstract?: boolean;
  parentId?: string | null;
  iconId?: string | null;
}

export interface UpdateObjectTypeRequest {
  code?: string;
  name?: string;
  description?: string | null;
  category?: string | null;
  isAbstract?: boolean;
  parentId?: string | null;
  iconId?: string | null;
}

// === TypeParameter ===
export type ParameterDataType = 'string' | 'int' | 'decimal' | 'boolean' | 'enum' | 'reference' | 'composite';

export interface TypeParameterDto extends MetamodelContext {
  id: string;
  objectTypeId: string;
  objectTypeName?: string | null; // Добавлено из ответа бэка
  code: string;
  name: string;
  description?: string | null;
  dataType: ParameterDataType;
  unitId?: string | null;
  unitName?: string | null;        // Добавлено
  unitSymbol?: string | null;      // Добавлено
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired: boolean;
  isReadonly: boolean;
  displayOrder: number;
  enumValues?: string | null;
  referenceTypeId?: string | null;
  compositeParameterId?: string | null;
  isCompositeRoot: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTypeParameterRequest {
  branchId: string;
  objectTypeId: string;
  code: string;
  name: string;
  description?: string | null;
  dataType: ParameterDataType;
  unitId?: string | null;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired: boolean;
  isReadonly: boolean;
  displayOrder: number;
  enumValues?: string | null;
  referenceTypeId?: string | null;
  compositeParameterId?: string | null;
  isCompositeRoot?: boolean;
}

export interface UpdateTypeParameterRequest {
  code?: string;
  name?: string;
  description?: string | null;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired?: boolean;
  isReadonly?: boolean;
  displayOrder?: number;
  enumValues?: string | null;
}

// === Unit ===
export interface UnitDto extends MetamodelContext {
  id: string;
  code: string;
  name: string;
  title?: string | null;           // Добавлено из ответа бэка
  symbol: string;
  dimension: string;
  siUnitId?: string | null;
  conversionFactor: number;
  isBase: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateUnitRequest {
  branchId: string;
  code: string;
  name: string;
  title?: string | null;
  symbol: string;
  dimension: string;
  siUnitId?: string | null;
  conversionFactor: number;
  isBase?: boolean;
}

// === Image ===
export interface ImageDto extends MetamodelContext {
  id: string;
  title?: string | null;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  usageType: 'icon' | 'diagram' | 'photo';
  uploadedAt: string;
}