<!-- src/components/ui/EntityCreateModal.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useBranchStore } from '@/stores/branch.store';
import type { ParameterDataType, UnitDto } from '@/types/api';

const props = defineProps<{
  entityType: 'object-types' | 'parameters' | 'units' | 'images';
  branchId: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

// Подключаем стор для доступа к данным
const branchStore = useBranchStore();

// Состояние формы
const form = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});
const submitting = ref(false);
const dataLoaded = ref(false);

// Загружаем данные при открытии модалки
onMounted(async () => {
  if (!dataLoaded.value) {
    try {
      // Загружаем все необходимые данные
      if (!branchStore.units.length || !branchStore.objectTypes.length || !branchStore.images.length) {
        await branchStore.loadBranchContent(props.branchId);
      }
      dataLoaded.value = true;
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }
});

// Автоматически устанавливаем коэффициент = 1 для базовых единиц
watch(() => form.value.isBase, (isBase) => {
  if (isBase) {
    form.value.conversionFactor = 1
    form.value.baseUnitId = null
  }
})

// Скрываем/показываем ParentId в зависимости от IsAbstract
watch(() => form.value.isAbstract, (isAbstract) => {
  if (isAbstract) {
    // Если абстрактный — очищаем ParentId
    form.value.parentId = null
  }
})

// Динамический список единиц для select
const unitsOptions = computed(() => {
  return branchStore.units.map((u: UnitDto) => ({
    value: u.id,
    label: `${u.name} (${u.symbol})`
  }))
})

// Динамический список типов объектов для select (включая себя для ParentId)
const objectTypesOptions = computed(() => {
  return branchStore.objectTypes.map((ot: any) => ({
    value: ot.id,
    label: `${ot.name} (${ot.code})${ot.isAbstract ? ' [Абстрактный]' : ''}`
  }))
})

// Список только базовых единиц для выбора
const baseUnitsOptions = computed(() => {
  return branchStore.units.filter((u: any) => u.isBase).map((u: any) => ({
    value: u.id,
    label: `${u.name} (${u.symbol})`
  }))
})
// Динамический список изображений для иконок
const iconsOptions = computed(() => {
  return branchStore.images.map((img: any) => ({
    value: img.id,
    label: `${img.title || img.fileName} (${img.usageType})`
  }))
})

// Заголовки и поля в зависимости от типа сущности
const config = computed(() => {
  switch (props.entityType) {
    case 'object-types':
      return {
        title: 'Создание типа объекта',
        fields: [
          { key: 'code', label: 'Код *', type: 'text', required: true, placeholder: 'PIPE_SEGMENT' },
          { key: 'name', label: 'Название *', type: 'text', required: true, placeholder: 'Участок трубопровода' },
          { key: 'description', label: 'Описание', type: 'textarea', rows: 3 },
          { key: 'category', label: 'Категория', type: 'text', placeholder: 'equipment' },
          { key: 'isAbstract', label: 'Абстрактный тип', type: 'checkbox' },
          // 🔥 ПОЛЕ: Родительский тип (только для неабстрактных)
          { key: 'parentId', label: 'Родительский тип', type: 'select', options: objectTypesOptions.value, 
            placeholder: 'Выберите абстрактный тип...',
            hint: 'Выберите абстрактный тип, от которого наследуется этот объект' },
          // 🔥 ПОЛЕ: Иконка (из загруженных изображений)
          { key: 'iconId', label: 'Иконка', type: 'select', options: iconsOptions.value,
            placeholder: 'Выберите иконку...',
            hint: 'Изображение для визуализации объекта' },
        ]
      };
    case 'parameters':
      return {
        title: 'Создание параметра',
        fields: [
          { key: 'code', label: 'Код *', type: 'text', required: true, placeholder: 'DIAMETER' },
          { key: 'name', label: 'Название *', type: 'text', required: true, placeholder: 'Диаметр' },
          { key: 'objectTypeId', label: 'Тип объекта *', type: 'select', required: true, options: objectTypesOptions.value },
          { key: 'dataType', label: 'Тип данных *', type: 'select', required: true, options: [
            { value: 'string', label: 'Текст' },
            { value: 'int', label: 'Целое число' },
            { value: 'decimal', label: 'Дробное число' },
            { value: 'boolean', label: 'Да/Нет' },
            { value: 'enum', label: 'Список значений' },
          ]},
          { key: 'unitId', label: 'Единица измерения', type: 'select', options: unitsOptions.value },
          { key: 'defaultValue', label: 'Значение по умолчанию', type: 'text' },
          { key: 'isRequired', label: 'Обязательный', type: 'checkbox' },
          { key: 'isReadonly', label: 'Только для чтения', type: 'checkbox' },
        ]
      };
    case 'units':
      return {
        title: 'Создание единицы измерения',
        fields: [
          { key: 'code', label: 'Код *', type: 'text', required: true, placeholder: 'METER' },
          { key: 'name', label: 'Название *', type: 'text', required: true, placeholder: 'Метр' },
          { key: 'symbol', label: 'Символ *', type: 'text', required: true, placeholder: 'м' },
          { key: 'dimension', label: 'Размерность *', type: 'text', required: true, placeholder: 'L' },
          { key: 'conversionFactor', label: 'Коэффициент пересчёта', type: 'number', step: '0.001', value: 1 },
          { key: 'isBase', label: 'Базовая единица (СИ)', type: 'checkbox' },
          { key: 'baseUnitId', label: 'Ссылается на базовую (СИ)', type: 'select', options: baseUnitsOptions.value, 
            required: true, hint: 'Обязательно для производных единиц' },
        ]
      };
    case 'images':
      return {
        title: 'Загрузка изображения',
        fields: [
          { key: 'file', label: 'Файл *', type: 'file', accept: 'image/*', required: true },
          { key: 'title', label: 'Заголовок', type: 'text', placeholder: 'Схема насосной' },
          { key: 'usageType', label: 'Тип использования', type: 'select', options: [
            { value: 'icon', label: 'Иконка' },
            { value: 'diagram', label: 'Схема' },
            { value: 'photo', label: 'Фотография' },
          ], value: 'icon' },
        ]
      };
    default:
      return { title: '', fields: [] };
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
  }
  
  return valid;
}

// 🔥 ИСПРАВЛЕННАЯ ОТПРАВКА ФОРМЫ
// Отправка формы
const handleSubmit = async () => {
  if (!validate()) return;
  
  submitting.value = true;
  try {
    let payload: any = { ...form.value };
    
    // 🔥 ФИЛЬТРУЕМ ПУСТЫЕ НЕОБЯЗАТЕЛЬНЫЕ ПОЛЯ перед отправкой
    // Удаляем пустые строки для необязательных select-полей (чтобы бэкенд получил null, а не "")
    const optionalSelects = ['parentId', 'iconId', 'unitId', 'baseUnitId', 'description', 'category', 'defaultValue']
    for (const field of optionalSelects) {
      if (payload[field] === '' || payload[field] === null || payload[field] === undefined) {
        delete payload[field]  // 🔥 Удаляем поле совсем
      }
    }
    
    // 🔥 Для изображений нужен FormData с PascalCase именами полей (как в C#)
    if (props.entityType === 'images' && payload.file) {
      const formData = new FormData();
      
      // 🔥 ВАЖНО: Имена полей должны совпадать с C# моделью (PascalCase)
      formData.append('FileName', payload.file.name);
      formData.append('file', payload.file);
      if (payload.title) formData.append('Title', payload.title);
      if (payload.usageType) formData.append('UsageType', payload.usageType);
      formData.append('BranchId', props.branchId);
      
      payload = formData;
    } else {
      // Добавляем branchId для всех сущностей кроме изображений
      if (props.entityType !== 'images') {
        payload.branchId = props.branchId;
      }
    }
    
    console.log('Modal submitting payload:', payload)
    emit('submit', payload);
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
          
          <!-- Text / Number -->
          <input
            v-if="field.type === 'text' || field.type === 'number'"
            :id="field.key"
            v-model="form[field.key]"
            :type="field.type"
            :placeholder="field.placeholder"
            :step="field.step"
            :required="field.required"
            :disabled="submitting || (field.key === 'conversionFactor' && form.isBase)"
            class="form-input"
            :class="{ error: errors[field.key] }"
          />
          
          <!-- Textarea -->
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
          
          <!-- Select: Родительский тип (только для неабстрактных) -->
          <select
            v-else-if="field.type === 'select' && field.key === 'parentId'"
            :id="field.key"
            v-model="form[field.key]"
            :required="field.required"
            :disabled="submitting || form.isAbstract || !objectTypesOptions.length"
            class="form-select"
            :class="{ error: errors[field.key] }"
          >
            <option value="" disabled>{{ form.isAbstract ? 'Недоступно для абстрактных' : (objectTypesOptions.length ? field.placeholder : 'Загрузка...') }}</option>
            <!-- Показываем только абстрактные типы для выбора -->
            <option 
              v-for="ot in branchStore.objectTypes.filter((x: any) => x.isAbstract)" 
              :key="ot.id" 
              :value="ot.id"
            >
              {{ ot.name }} ({{ ot.code }})
            </option>
          </select>
          
          <!-- Select: Иконка (из изображений) -->
          <select
            v-else-if="field.type === 'select' && field.key === 'iconId'"
            :id="field.key"
            v-model="form[field.key]"
            :required="field.required"
            :disabled="submitting || !iconsOptions.length"
            class="form-select"
            :class="{ error: errors[field.key] }"
          >
            <option value="">{{ iconsOptions.length ? field.placeholder : 'Загрузка...' }}</option>
            <!-- Показываем только иконки (usageType = 'icon') -->
            <option 
              v-for="img in branchStore.images.filter((x: any) => x.usageType === 'icon')" 
              :key="img.id" 
              :value="img.id"
            >
              {{ img.title || img.fileName }}
            </option>
          </select>
          
          <!-- Select: Типы объектов (динамический) -->
          <select
            v-else-if="field.type === 'select' && field.key === 'objectTypeId'"
            :id="field.key"
            v-model="form[field.key]"
            :required="field.required"
            :disabled="submitting || !objectTypesOptions.length"
            class="form-select"
            :class="{ error: errors[field.key] }"
          >
            <option value="" disabled>{{ objectTypesOptions.length ? 'Выберите тип объекта' : 'Загрузка...' }}</option>
            <option v-for="opt in objectTypesOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          
          <!-- Select: Единицы измерения (динамический) -->
          <select
            v-else-if="field.type === 'select' && field.key === 'unitId'"
            :id="field.key"
            v-model="form[field.key]"
            :required="field.required"
            :disabled="submitting || !dataLoaded"
            class="form-select"
            :class="{ error: errors[field.key] }"
          >
            <option value="" disabled>{{ dataLoaded ? 'Выберите...' : 'Загрузка...' }}</option>
            <option v-for="opt in unitsOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          
          <!-- Select: обычные опции (dataType, usageType) -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.key"
            v-model="form[field.key]"
            :required="field.required"
            :disabled="submitting"
            class="form-select"
            :class="{ error: errors[field.key] }"
          >
            <option value="" disabled>Выберите...</option>
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <!-- Select: Базовая единица (только для не-базовых) -->
          <select
            v-else-if="field.type === 'select' && field.key === 'baseUnitId'"
            :id="field.key"
            v-model="form[field.key]"
            :required="field.required && !form.isBase"
            :disabled="submitting || form.isBase || !baseUnitsOptions.length"
            class="form-select"
            :class="{ error: errors[field.key] }"
          >
            <option value="" disabled>
              {{ form.isBase ? 'Не требуется для базовых' : (baseUnitsOptions.length ? 'Выберите базовую единицу' : 'Сначала создайте базовую единицу') }}
            </option>
            <option v-for="opt in baseUnitsOptions" :key="opt.value" :value="opt.value">
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
          
          <!-- File -->
          <input
            v-else-if="field.type === 'file'"
            :id="field.key"
            type="file"
            :accept="field.accept"
            :required="field.required"
            :disabled="submitting"
            class="form-file"
            :class="{ error: errors[field.key] }"
            @change="e => form[field.key] = (e.target as HTMLInputElement).files?.[0]"
          />
          
          <!-- Подсказка для поля -->
          <span v-if="field.hint" class="form-hint">{{ field.hint }}</span>
          
          <!-- Подсказка для коэффициента -->
          <span v-if="field.key === 'conversionFactor' && form.isBase" class="form-hint">
            Для базовых единиц коэффициент всегда равен 1
          </span>
          
          <!-- Ошибка валидации -->
          <span v-if="errors[field.key]" class="form-error">{{ errors[field.key] }}</span>
        </div>
        
        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="emit('cancel')" :disabled="submitting">
            Отмена
          </button>
          <button type="submit" class="btn-save" :disabled="submitting">
            {{ submitting ? 'Сохранение...' : 'Сохранить' }}
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
.form-input, .form-select, .form-file {
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.form-input.error, .form-select.error {
  border-color: #ef4444;
}
.form-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
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
  margin-top: 0.2rem;
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