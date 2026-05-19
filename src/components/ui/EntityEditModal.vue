<!-- src/components/ui/EntityEditModal.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ParameterDataType, UnitDto } from '@/types/api';
import { isValidCodeFormat, CODE_ERRORS, checkCodeUnique } from '@/utils/ValidationUtils';

const props = defineProps<{
  entityType: 'object-types' | 'parameters' | 'units' | 'images';
  entity: any; // Предзаполненные данные
}>();

const emit = defineEmits<{
  (e: 'submit', id: string, data: any): void;
  (e: 'cancel'): void;
}>();

// Состояние формы
const form = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});
const submitting = ref(false);
const isCheckingCode = ref(false);

// Заголовки и поля в зависимости от типа сущности
const config = computed(() => {
  switch (props.entityType) {
    case 'object-types':
      return {
        title: 'Редактирование типа объекта',
        fields: [
          { key: 'code', label: 'Код *', type: 'text', required: true, readonly: true }, // Код не меняем
          { key: 'name', label: 'Название *', type: 'text', required: true },
          { key: 'description', label: 'Описание', type: 'textarea', rows: 3 },
          { key: 'category', label: 'Категория', type: 'text' },
          { key: 'isAbstract', label: 'Абстрактный тип', type: 'checkbox' },
        ]
      };
    case 'parameters':
      return {
        title: 'Редактирование параметра',
        fields: [
          { key: 'code', label: 'Код *', type: 'text', required: true, readonly: true },
          { key: 'name', label: 'Название *', type: 'text', required: true },
          { key: 'dataType', label: 'Тип данных', type: 'text', readonly: true },
          { key: 'description', label: 'Описание', type: 'textarea', rows: 2 },
          { key: 'defaultValue', label: 'Значение по умолчанию', type: 'text' },
          { key: 'isRequired', label: 'Обязательный', type: 'checkbox' },
          { key: 'isReadonly', label: 'Только для чтения', type: 'checkbox' },
        ]
      };
    case 'units':
      return {
        title: 'Редактирование единицы измерения',
        fields: [
          { key: 'code', label: 'Код *', type: 'text', required: true, readonly: true },
          { key: 'name', label: 'Название *', type: 'text', required: true },
          { key: 'symbol', label: 'Символ *', type: 'text', required: true },
          { key: 'dimension', label: 'Размерность *', type: 'text', required: true },
          { key: 'conversionFactor', label: 'Коэффициент пересчёта', type: 'number', step: '0.001' },
          { key: 'isBase', label: 'Базовая единица (СИ)', type: 'checkbox' },
          { key: 'baseUnitId', label: 'Ссылается на базовую (СИ)', type: 'select', options: baseUnitsOptions.value, hint: 'Обязательно для производных единиц' },
        ]
      };
    case 'images':
      return {
        title: 'Редактирование изображения',
        fields: [
          { key: 'title', label: 'Заголовок', type: 'text' },
          { key: 'usageType', label: 'Тип использования', type: 'select', options: [
            { value: 'icon', label: 'Иконка' },
            { value: 'diagram', label: 'Схема' },
            { value: 'photo', label: 'Фотография' },
          ]},
          { key: 'fileName', label: 'Имя файла', type: 'text', readonly: true },
          { key: 'fileSize', label: 'Размер', type: 'text', readonly: true, formatter: (v: number) => v ? `${Math.round(v / 1024)} КБ` : '—' },
        ]
      };
    default:
      return { title: '', fields: [] };
  }
});

// Инициализация формы данными сущности
onMounted(() => {
  if (props.entity) {
    // Копируем только редактируемые поля
    for (const field of config.value.fields) {
      const value = props.entity[field.key];
      form.value[field.key] = field.formatter && value !== undefined 
        ? field.formatter(value) 
        : value;
    }
  }
});

// Валидация
function validate(): boolean {
  errors.value = {};
  let valid = true;
  
  for (const field of config.value.fields) {
    if (field.required && !form.value[field.key]) {
      errors.value[field.key] = 'Это поле обязательно';
      valid = false;
    }
    // Проверка формата кода (если поле не readonly)
    if (field.key === 'code' && !field.readonly && form.value[field.key]) {
      if (!isValidCodeFormat(form.value[field.key])) {
        errors.value[field.key] = CODE_ERRORS.format;
        valid = false;
      }
    }
  }
  
  return valid;
}

// Проверка уникальности кода (с дебаунсом)
const onCodeInput = (newCode: string) => {
  if (!newCode || !isValidCodeFormat(newCode)) return;
  
  isCheckingCode.value = true;
  checkCodeUnique(
    newCode,
    props.entity.branchId,
    props.entityType,
    (isUnique) => {
      isCheckingCode.value = false;
      if (!isUnique && newCode !== props.entity.code) {
        errors.value.code = CODE_ERRORS.unique;
      } else if (errors.value.code === CODE_ERRORS.unique) {
        delete errors.value.code;
      }
    },
    () => { isCheckingCode.value = false; }
  );
};

// Отправка формы
// Отправка формы
const handleSubmit = async () => {
  if (!validate()) return;
  
  submitting.value = true;
  try {
    // Собираем ВСЕ редактируемые поля (не только изменённые)
    const payload: Record<string, any> = {};
    for (const field of config.value.fields) {
      if (!field.readonly) {
        payload[field.key] = form.value[field.key];
      }
    }
    
    // Для object-types, parameters, units всегда добавляем code и name (даже если readonly)
    if (props.entityType !== 'images') {
      payload.code = props.entity.code;
      payload.name = props.entity.name;
    }
    
    // Добавляем id для надёжности
    payload.id = props.entity.id;
    
    console.log('Modal submitting:', { id: props.entity.id, payload });
    
    emit('submit', props.entity.id, payload);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-card">
      <header class="modal-header">
        <h3>{{ config.title }}</h3>
        <button class="btn-close" @click="emit('cancel')">&times;</button>
      </header>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-for="field in config.fields" :key="field.key" class="form-group">
          <label :for="field.key">{{ field.label }}</label>
          
          <!-- Text / Textarea / Number (с поддержкой readonly) -->
          <input
            v-if="field.type === 'text' || field.type === 'number'"
            :id="field.key"
            v-model="form[field.key]"
            :type="field.type"
            :placeholder="field.placeholder"
            :step="field.step"
            :required="field.required && !field.readonly"
            :readonly="field.readonly"
            :disabled="submitting"
            class="form-input"
            :class="{ error: errors[field.key], readonly: field.readonly }"
            @input="field.key === 'code' && !field.readonly && onCodeInput(form[field.key])"
          />
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.key"
            v-model="form[field.key]"
            :placeholder="field.placeholder"
            :rows="field.rows || 3"
            :required="field.required"
            :disabled="submitting"
            class="form-input"
            :class="{ error: errors[field.key] }"
          />
          
          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.key"
            v-model="form[field.key]"
            :disabled="submitting || field.readonly"
            class="form-select"
            :class="{ error: errors[field.key], readonly: field.readonly }"
          >
            <option value="" disabled>Выберите...</option>
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          
          <!-- Checkbox -->
          <label v-else-if="field.type === 'checkbox'" class="form-checkbox">
            <input
              type="checkbox"
              v-model="form[field.key]"
              :disabled="submitting"
            />
            <span>{{ field.label.replace(' *', '') }}</span>
          </label>
          
          <!-- Ошибка валидации -->
          <span v-if="errors[field.key]" class="form-error">{{ errors[field.key] }}</span>
          <span v-if="field.key === 'code' && isCheckingCode" class="form-hint">Проверка уникальности...</span>
        </div>
        
        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="emit('cancel')" :disabled="submitting">
            Отмена
          </button>
          <button type="submit" class="btn-save" :disabled="submitting">
            {{ submitting ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-card {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  font-size: 1.1rem;
  color: #1a365d;
  margin: 0;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
}
.btn-close:hover { color: #1e293b; }
.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-weight: 500;
  color: #334155;
  font-size: 0.9rem;
}
.form-input, .form-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  background: #fff;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.form-input.error, .form-select.error {
  border-color: #ef4444;
}
.form-input.readonly, .form-select.readonly {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}
.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}
.form-checkbox input {
  width: 1rem;
  height: 1rem;
}
.form-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}
.form-hint {
  color: #64748b;
  font-size: 0.8rem;
  font-style: italic;
}
.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.btn-cancel {
  background: #f1f5f9;
  color: #1e293b;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
.btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
.btn-save {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
.btn-save:hover:not(:disabled) { background: #1d4ed8; }
.btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>