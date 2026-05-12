// === ВЕТКИ ===
export interface BranchDto {
  id: string;
  name: string;
  description?: string;
  parentBranchId?: string;
  createdAt: string; // ISO 8601
}

export interface CreateBranchRequest {
  sourceBranchId: string;
  name: string;
  description?: string;
}

export interface PublishBranchRequest {
  message: string;
}

// === ТИПЫ ОБЪЕКТОВ ===
export interface ObjectTypeDto {
  id: string;
  branchId: string;
  code: string;          // бизнес-ключ, например "PIPE-STEEL"
  name: string;
  description?: string;
  category?: string;
  parentId?: string;
  iconId?: string;
  isAbstract: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateObjectTypeRequest {
  branchId: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isAbstract?: boolean;
  parentId?: string;
  iconId?: string;
}

// === ПАРАМЕТРЫ ===
export type ParameterDataType = 'string' | 'int' | 'decimal' | 'boolean' | 'enum' | 'reference' | 'composite';

export interface TypeParameterDto {
  id: string;
  branchId: string;
  objectTypeId: string;
  code: string;
  name: string;
  description?: string;
  dataType: ParameterDataType;
  unitId?: string;
  defaultValue?: string;
  minValue?: number;
  maxValue?: number;
  isRequired: boolean;
  isReadonly: boolean;
  displayOrder: number;
  enumValues?: string; // JSON string: [{value: "x", label: "Y"}]
  referenceTypeId?: string;
  compositeParameterId?: string;
  isCompositeRoot: boolean;
  createdAt: string;
  updatedAt?: string;
}

// === ЕДИНИЦЫ ИЗМЕРЕНИЯ ===
export interface UnitDto {
  id: string;
  branchId: string;
  code: string;
  name: string;
  symbol: string;
  dimension: string;
  siUnitId?: string;
  conversionFactor: number;
  isBase: boolean;
  createdAt: string;
  updatedAt?: string;
}

// === ИЗОБРАЖЕНИЯ ===
export interface ImageDto {
  id: string;
  branchId: string;
  title?: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  usageType: 'icon' | 'diagram' | 'photo';
  uploadedAt: string;
}