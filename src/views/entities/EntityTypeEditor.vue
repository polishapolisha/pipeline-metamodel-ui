<!-- src/views/entities/EntityTypeEditor.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBranchStore } from '@/stores/branch.store'
import ConfigurableTable from '@/components/ui/ConfigurableTable.vue'
import EntityCreateModal from '@/components/ui/EntityCreateModal.vue'
import EntityEditModal from '@/components/ui/EntityEditModal.vue'
import type { ColumnConfig, TableAction } from '@/types/table'
import type { ObjectTypeDto, TypeParameterDto, UnitDto, ImageDto } from '@/types/api'

const route = useRoute()
const router = useRouter()
const branchStore = useBranchStore()

const branchId = computed(() => route.params.branchId as string)
const entityType = computed(() => route.params.entityType as 'object-types' | 'parameters' | 'units' | 'images')

const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedEntity = ref<any>(null)

onMounted(async () => {
  try {
    await branchStore.loadBranchContent(branchId.value)
    loading.value = false
  } catch (err: any) {
    console.error('Failed to load branch content:', err)
    error.value = err.response?.status === 404 ? 'Ветка не найдена' : err.message || 'Ошибка загрузки данных'
    loading.value = false
  }
})

const tableData = computed(() => {
  switch (entityType.value) {
    case 'object-types': return branchStore.objectTypes
    case 'parameters': return branchStore.parameters
    case 'units': return branchStore.units
    case 'images': return branchStore.images
    default: return []
  }
})

const columns = computed((): ColumnConfig<any>[] => {
  const type = entityType.value
  
  if (type === 'object-types') {
    return [
      { key: 'code', title: 'Код', sortable: true, width: '150px' },
      { key: 'name', title: 'Название', sortable: true, width: '250px' },
      { key: 'category', title: 'Категория', width: '120px', formatter: (v: string) => v || '—' },
      { key: 'isAbstract', title: 'Абстрактный', width: '100px', formatter: (v: boolean) => v ? 'Да' : 'Нет' },
    ]
  }
  
  if (type === 'parameters') {
    return [
      { key: 'code', title: 'Код', sortable: true, width: '150px' },
      { key: 'name', title: 'Название', width: '200px' },
      { key: 'dataType', title: 'Тип', width: '100px' },
      { 
        key: 'unitId', 
        title: 'Единица', 
        width: '120px', 
        formatter: (_: any, row: TypeParameterDto) => branchStore.units.find(u => u.id === row.unitId)?.symbol || '—' 
      },
      { key: 'isRequired', title: 'Обязат.', width: '80px', formatter: (v: boolean) => v ? 'Да' : 'Нет' },
    ]
  }
  
  if (type === 'units') {
    return [
      { key: 'code', title: 'Код', sortable: true, width: '120px' },
      { key: 'name', title: 'Название', width: '200px' },
      { key: 'symbol', title: 'Символ', width: '80px' },
      { key: 'dimension', title: 'Размерность', width: '150px' },
      { key: 'isBase', title: 'Базовая', width: '90px', formatter: (v: boolean) => v ? 'Да' : 'Нет' },
    ]
  }
  
  if (type === 'images') {
    return [
      { key: 'fileName', title: 'Файл', width: '200px' },
      { key: 'title', title: 'Заголовок', width: '180px', formatter: (v: string) => v || '—' },
      { key: 'usageType', title: 'Тип', width: '100px' },
      { key: 'fileSize', title: 'Размер', width: '100px', formatter: (v: number) => v ? `${Math.round(v / 1024)} КБ` : '—' },
      { key: 'uploadedAt', title: 'Загружен', width: '120px', formatter: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
    ]
  }
  
  return []
})

// === ФУНКЦИИ ДЛЯ КНОПОК ===

function openEditModal(entity: any) {
  console.log('openEditModal called for:', entity)
  selectedEntity.value = markRaw(entity)
  showEditModal.value = true
}

function handleDeleteConfirm(entity: any) {
  console.log('handleDeleteConfirm called for:', entity)
  const name = entity.name || entity.code || entity.fileName || 'элемент'
  if (confirm(`Вы уверены, что хотите удалить "${name}"?\nЭто действие нельзя отменить.`)) {
    console.log('Delete confirmed for ID:', entity.id)
    executeDelete(entity.id)
  }
}

async function executeDelete(id: string) {
  console.log('executeDelete called for ID:', id, 'Type:', entityType.value)
  
  try {
    switch (entityType.value) {
      case 'object-types': await branchStore.deleteObjectType(id); break
      case 'parameters': await branchStore.deleteParameter(id); break
      case 'units': await branchStore.deleteUnit(id); break
      case 'images': await branchStore.deleteImage(id); break
    }
    
    console.log('Delete successful')
    alert('Сущность удалена')
    
    // 🔥 Перезагружаем данные после удаления
    await branchStore.loadBranchContent(branchId.value)
    
  } catch (err: any) {
    console.error('Delete failed:', err)
    
    // Умная обработка ошибок ссылочной целостности
    let errorMsg = 'Не удалось удалить сущность'
    
    if (err.response?.data) {
      const backendError = err.response.data
      const backendMsg = (backendError.message || '').toLowerCase()
      const errorTitle = (backendError.title || '').toLowerCase()
      const errorsObj = backendError.errors
      
      // 🔹 Вариант 1: Ошибка внешнего ключа (PostgreSQL / SQL Server)
      if (backendMsg.includes('ссылают') || 
          backendMsg.includes('reference') || 
          backendMsg.includes('foreign') || 
          backendMsg.includes('constraint') ||
          backendMsg.includes('нарушает') ||
          errorTitle.includes('conflict') ||
          errorTitle.includes('используется')) {
        
        if (entityType.value === 'object-types') {
          errorMsg = '⚠️ Невозможно удалить тип объекта:\n• На него ссылаются другие типы (через родительский тип)\n• Или на него ссылаются параметры\n\nСначала удалите или измените зависимые элементы.'
        } else if (entityType.value === 'units') {
          errorMsg = '⚠️ Невозможно удалить единицу измерения:\n• На неё ссылаются параметры\n• Или на неё ссылаются другие единицы (как базовая)\n\nСначала измените зависимые объекты.'
        } else if (entityType.value === 'parameters') {
          errorMsg = '⚠️ Невозможно удалить параметр:\n• На него могут ссылаться экземпляры объектов\n\nУбедитесь, что параметр не используется.'
        } else {
          errorMsg = '⚠️ Невозможно удалить:\nНа эту сущность есть ссылки в других записях.\nПроверьте зависимости перед удалением.'
        }
      }
      // 🔹 Вариант 2: Ошибки валидации (FluentValidation)
      else if (errorsObj && typeof errorsObj === 'object') {
        const messages: string[] = []
        for (const [field, msgs] of Object.entries(errorsObj)) {
          if (Array.isArray(msgs)) {
            messages.push(...msgs)
          }
        }
        if (messages.length) {
          errorMsg = messages.join('\n')
        }
      }
      // 🔹 Вариант 3: Простое сообщение
      else if (backendError.message) {
        errorMsg = backendError.message
      }
      // 🔹 Вариант 4: Заголовок из ProblemDetails
      else if (backendError.title) {
        errorMsg = backendError.title
      }
    }
    
    // 🔹 Фолбэк: если ничего не поняли
    if (errorMsg === 'Не удалось удалить сущность') {
      errorMsg = err.message || 'Произошла неизвестная ошибка при удалении'
    }
    
    alert(errorMsg)
  }
}
// ОБРАБОТЧИК ДЕЙСТВИЙ ИЗ ТАБЛИЦЫ
function handleTableAction(actionLabel: string, row: any) {
  console.log('Table action:', actionLabel, row)
  
  if (actionLabel === '✏️') {
    openEditModal(row)
  } else if (actionLabel === '🗑️') {
    handleDeleteConfirm(row)
  }
}

const actions = computed((): TableAction[] => [
  {
    label: '✏️',
    title: 'Редактировать',
    variant: 'primary'
  },
  {
    label: '🗑️',
    title: 'Удалить',
    variant: 'danger'
  }
])

const goBackToOverview = () => {
  router.push(`/branches/${branchId.value}/edit`)
}

function openCreateModal() {
  selectedEntity.value = null
  showCreateModal.value = true
}

async function executeCreate(data: any) {
  console.log('Create called with:', data)
  
  try {
    // 🔥 ФИЛЬТРУЕМ ПУСТЫЕ НЕОБЯЗАТЕЛЬНЫЕ ПОЛЯ перед отправкой
    const cleanData = { ...data }
    
    // Удаляем пустые строки для необязательных полей (чтобы бэкенд получил null)
    const optionalFields = ['description', 'category', 'parentId', 'iconId', 'unitId', 'defaultValue', 'baseUnitId']
    for (const field of optionalFields) {
      if (cleanData[field] === '' || cleanData[field] === null || cleanData[field] === undefined) {
        delete cleanData[field]  // 🔥 Удаляем поле совсем, а не отправляем пустую строку
      }
    }
    
    // 🔥 ВАЛИДАЦИЯ КОДА: только латиница, цифры, _ и -
    if (cleanData.code && !/^[A-Za-z0-9_-]+$/.test(cleanData.code)) {
      alert('⚠️ Ошибка в коде:\n• Код должен содержать только латинские буквы (A-Z, a-z)\n• Цифры (0-9)\n• Подчёркивание (_) и дефис (-)\n• Кириллица и пробелы не допускаются\n\nПример: PIPE-SEGMENT-001')
      return
    }
    
    switch (entityType.value) {
      case 'object-types': 
        await branchStore.addObjectType({ ...cleanData, branchId: branchId.value }); 
        break
      case 'parameters': 
        await branchStore.addParameter({ ...cleanData, branchId: branchId.value }); 
        break
      case 'units': 
        await branchStore.addUnit({ ...cleanData, branchId: branchId.value }); 
        break
      case 'images': 
        await branchStore.uploadImage(branchId.value, cleanData); 
        break
    }
    
    console.log('✅ Create successful')
    showCreateModal.value = false
    // Перезагружаем данные после создания
    await branchStore.loadBranchContent(branchId.value)
    
  } catch (err: any) {
    console.error('❌ Create failed FULL ERROR:', err)
    
    let errorMsg = 'Не удалось создать сущность'
    
    if (err.response?.data) {
      const backendError = err.response.data
      console.log('Backend error:', backendError)
      
      // FluentValidation: { errors: [{ field: 'Code', message: '...' }, ...] }
      if (Array.isArray(backendError.errors)) {
        const messages = backendError.errors.map((e: any) => {
          const fieldName = {
            'Code': 'Код',
            'Name': 'Название',
            'IconId': 'Иконка',
            'ParentId': 'Родительский тип',
            'DataType': 'Тип данных'
          }[e.field] || e.field
          return `${fieldName}: ${e.message}`
        })
        if (messages.length) {
          errorMsg = messages.join('\n')
        }
      }
      else if (backendError.errors && typeof backendError.errors === 'object') {
        const messages: string[] = []
        for (const [field, msgs] of Object.entries(backendError.errors)) {
          if (Array.isArray(msgs)) {
            const fieldName = {
              'Code': 'Код',
              'Name': 'Название',
              'IconId': 'Иконка',
              'ParentId': 'Родительский тип'
            }[field] || field
            messages.push(...msgs.map((m: any) => `${fieldName}: ${m}`))
          }
        }
        if (messages.length) {
          errorMsg = messages.join('\n')
        }
      }
      else if (backendError.message) {
        errorMsg = backendError.message
      }
    }
    
    // Специальные сообщения
    if (errorMsg.toLowerCase().includes('код') && (errorMsg.toLowerCase().includes('латиниц') || errorMsg.toLowerCase().includes('буквы'))) {
      errorMsg = '⚠️ Ошибка в коде:\n• Код должен содержать только латинские буквы (A-Z)\n• Цифры (0-9)\n• Подчёркивание (_) и дефис (-)\n• Кириллица не допускается'
    }
    
    alert(errorMsg)
  }
}

async function executeUpdate(id: string, data: any) {
  console.log('Update called with:', { id, data })
  
  try {
    const getUpdatePayload = (type: string, raw: any) => {
      const safe: Record<string, any> = {}
      
      if (type === 'object-types') {
        const allowed = ['id', 'code', 'name', 'description', 'category', 'isAbstract', 'parentId', 'iconId']
        for (const key of allowed) {
          if (raw[key] !== undefined && raw[key] !== null) {
            safe[key] = raw[key]
          }
        }
        if (!safe.id) safe.id = id
      }
      else if (type === 'parameters') {
        const allowed = ['id', 'code', 'name', 'description', 'defaultValue', 'minValue', 'maxValue', 'isRequired', 'isReadonly', 'displayOrder', 'enumValues']
        for (const key of allowed) {
          if (raw[key] !== undefined && raw[key] !== null) {
            safe[key] = raw[key]
          }
        }
        
        // 🔥 ВАЖНО: dataType всегда должен быть (берём из исходной сущности)
        if (selectedEntity.value?.dataType) {
          safe.dataType = selectedEntity.value.dataType
        }
        
        if (!safe.id) safe.id = id
      }
      else if (type === 'units') {
        const allowed = ['id', 'code', 'name', 'title', 'symbol', 'dimension', 'siUnitId', 'conversionFactor', 'isBase']
        for (const key of allowed) {
          if (raw[key] !== undefined && raw[key] !== null) {
            safe[key] = raw[key]
          }
        }
        if (!safe.id) safe.id = id
      }
      else if (type === 'images') {
        return null
      }
      
      return safe
    }

    const payload = getUpdatePayload(entityType.value, data)
    
    console.log('Prepared payload:', payload)
    console.log('Selected entity dataType:', selectedEntity.value?.dataType)
    
    if (!payload || Object.keys(payload).length === 0) {
      alert('Нет данных для обновления')
      return
    }

    // ПРОВЕРКА: код должен быть на латинице
    if (payload.code && !/^[A-Za-z0-9_-]+$/.test(payload.code)) {
      alert('⚠️ Ошибка: Код должен содержать только латинские буквы, цифры, подчёркивание и дефис.\n\nКириллица не допускается.\n\nПример: TEST-PIPE-001')
      return
    }

    switch (entityType.value) {
      case 'object-types': await branchStore.updateObjectType(id, payload); break
      case 'parameters': await branchStore.updateParameter(id, payload); break
      case 'units': await branchStore.updateUnit(id, payload); break
      case 'images': alert('Замена изображений через редактирование пока не поддерживается'); return
    }
    
    console.log('Update successful')
    
    // 🔥 ПЕРЕЗАГРУЖАЕМ ДАННЫЕ ВЕТКИ ПОСЛЕ УСПЕШНОГО ОБНОВЛЕНИЯ
    await branchStore.loadBranchContent(branchId.value)
    
    showEditModal.value = false
    
  } catch (err: any) {
    console.error('❌ Update failed:', err)
    
    // УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК (RFC 7807 ProblemDetails)
    let errorMsg = 'Не удалось обновить сущность'
    
    if (err.response?.data) {
      const backendError = err.response.data
      console.log('Backend error full:', backendError)
      
      // Вариант 1: FluentValidation внутри ProblemDetails
      if (backendError.errors && typeof backendError.errors === 'object') {
        const messages: string[] = []
        const fieldNames: Record<string, string> = {
          'Code': 'Код',
          'Name': 'Название', 
          'Description': 'Описание',
          'DefaultValue': 'Значение по умолчанию',
          'IsRequired': 'Обязательность',
          'IsReadonly': 'Только для чтения',
          'DataType': 'Тип данных',
          'DisplayOrder': 'Порядок отображения',
          'EnumValues': 'Список значений',
          'Symbol': 'Символ',
          'Dimension': 'Размерность',
          'ConversionFactor': 'Коэффициент пересчёта'
        }
        
        for (const [field, msgs] of Object.entries(backendError.errors)) {
          if (Array.isArray(msgs)) {
            const fieldName = fieldNames[field] || field
            messages.push(...msgs.map((m: string) => `${fieldName}: ${m}`))
          }
        }
        if (messages.length) {
          errorMsg = messages.join('\n')
        }
      }
      // Вариант 2: Простое сообщение
      else if (backendError.message) {
        errorMsg = backendError.message
      }
      // Вариант 3: Заголовок из ProblemDetails
      else if (backendError.title) {
        errorMsg = backendError.title
      }
    }
    
    // Специальные сообщения для частых ошибок
    if (errorMsg.toLowerCase().includes('код') && errorMsg.toLowerCase().includes('уже')) {
      errorMsg = '⚠️ Этот код уже используется в ветке.\nВыберите другой уникальный код.'
    }
    
    if (errorMsg.toLowerCase().includes('латиниц') || errorMsg.toLowerCase().includes('matches')) {
      errorMsg = '⚠️ Код должен содержать только:\n• Латинские буквы (A-Z)\n• Цифры (0-9)\n• Подчёркивание (_) и дефис (-)'
    }
    
    alert(errorMsg)
  }
}

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    'object-types': 'Типы объектов',
    'parameters': 'Типы параметров',
    'units': 'Единицы измерения',
    'images': 'Изображения'
  }
  return map[entityType.value] || 'Редактор'
})
</script>

<template>
  <div class="entity-editor">
    <header class="editor-header">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p v-if="branchStore.currentContent">
          <strong>Репозиторий:</strong> {{ branchStore.currentContent.repositoryName }} • 
          <strong>Ветка:</strong> {{ branchStore.currentContent.branchName }}
        </p>
      </div>
      
      <div class="header-actions">
        <button class="btn-back" @click="goBackToOverview">Назад к обзору</button>
      </div>
    </header>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="goBackToOverview">Вернуться к обзору</button>
    </div>

    <ConfigurableTable
      v-else-if="!loading"
      :columns="columns"
      :data="tableData"
      :actions="actions"
      :loading="loading"
      @row-click="openEditModal"
      @action="handleTableAction"
    >
      <template #toolbar>
        <button class="btn-add" @click="openCreateModal">
          + Добавить
        </button>
        <button class="btn-export" title="Экспорт в JSON">Экспорт</button>
      </template>
    </ConfigurableTable>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка данных ветки...</p>
    </div>

    <EntityCreateModal
      v-if="showCreateModal"
      :entity-type="entityType"
      :branch-id="branchId"
      @submit="executeCreate"
      @cancel="showCreateModal = false"
    />
    
    <EntityEditModal
      v-if="showEditModal"
      :entity-type="entityType"
      :entity="selectedEntity"
      @submit="executeUpdate"
      @cancel="showEditModal = false"
    />
  </div>
</template>

<style scoped>
.entity-editor { padding: 2rem; max-width: 1400px; margin: 0 auto }
.editor-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0; flex-wrap: wrap; gap: 1rem }
.editor-header h1 { font-size: 1.5rem; color: #1a365d; margin-bottom: 0.25rem }
.editor-header p { color: #64748b; font-size: 0.95rem }
.header-actions { display: flex; gap: 0.75rem }
.btn-back { background: #f1f5f9; color: #1e293b; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 500; cursor: pointer }
.btn-back:hover { background: #e2e8f0 }
.error-banner { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem }
.error-banner button { margin-left: auto; background: #dc2626; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer }
.loading-state { text-align: center; padding: 4rem 2rem; color: #64748b }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite }
@keyframes spin { to { transform: rotate(360deg) } }
:deep(.table-toolbar) { display: flex; gap: 0.5rem }
.btn-add { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer }
.btn-add:hover { background: #1d4ed8 }
.btn-export { background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 1.1rem }
.btn-export:hover { background: #e2e8f0 }
</style>