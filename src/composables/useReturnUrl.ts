// src/composables/useReturnUrl.ts
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export const DEFAULT_RETURN_URL = 'http://localhost:3000';

export function useReturnUrl() {
  const route = useRoute();

  const returnUrl = computed(() => {
    const raw = route.query.returnTo as string | undefined;
    if (!raw) return DEFAULT_RETURN_URL;
    
    try {
      const decoded = decodeURIComponent(raw);
      return new URL(decoded).toString();
    } catch {
      console.warn('Invalid returnTo URL, using default:', raw);
      return DEFAULT_RETURN_URL;
    }
  });

  const isExternalFlow = computed(() => {
    return route.query.returnTo !== undefined;
  });

  const redirectToReturn = () => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    
    const url = new URL(returnUrl.value);
    if (!allowedOrigins.includes(url.origin) && import.meta.env.PROD) {
      console.error('Redirect to untrusted origin blocked:', returnUrl.value);
      window.location.href = DEFAULT_RETURN_URL;
      return;
    }
    
    window.location.href = returnUrl.value;
  };

  return {
    returnUrl,
    isExternalFlow,
    redirectToReturn,
  };
}