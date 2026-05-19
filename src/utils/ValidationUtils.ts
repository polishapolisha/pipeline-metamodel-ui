// src/utils/ValidationUtils.ts

// Лёгкая реализация debounce без внешних зависимостей
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Проверка уникальности кода (с дебаунсом 300мс)
export const checkCodeUnique = debounce(async (
  code: string,
  branchId: string,
  entityType: string,
  onSuccess: (isUnique: boolean) => void,
  onError: (err: any) => void
) => {
  try {
    // 🔜 Заглушка: замени на реальный эндпоинт бэкенда
    // const response = await fetch(`/api/validate/code?code=${encodeURIComponent(code)}&branchId=${branchId}&type=${entityType}`);
    // const isUnique = await response.json();
    // onSuccess(isUnique);

    // Временная логика: код "TEST" всегда считается занятым
    const isUnique = code.trim().toUpperCase() !== 'TEST';
    onSuccess(isUnique);
  } catch (error) {
    console.error('Validation request failed:', error);
    onError(error);
  }
}, 300);

// Валидация формата кода (латиница, цифры, подчёркивание, начинается с буквы)
export const isValidCodeFormat = (code: string): boolean => {
  return /^[A-Z][A-Z0-9_]*$/.test(code.toUpperCase());
};

// Шаблоны ошибок
export const CODE_ERRORS = {
  required: 'Код обязателен',
  format: 'Код должен содержать только заглавные латинские буквы, цифры и _',
  unique: 'Этот код уже используется в ветке',
};