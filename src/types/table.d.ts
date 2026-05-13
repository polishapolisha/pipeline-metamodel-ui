// src/types/table.d.ts

export type ColumnDataType = 'text' | 'number' | 'boolean' | 'enum' | 'date' | 'custom';

export interface ColumnConfig<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: string | number;
  formatter?: (value: any, row: T) => string;
  customRender?: (row: T, index: number) => any;
}

export interface TableAction {
  label: string;
  icon?: string;
  action: (row: any) => void;
  visible?: (row: any) => boolean;
  variant?: 'primary' | 'danger' | 'secondary';
}