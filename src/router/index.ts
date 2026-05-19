// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/repositories/create',
      name: 'RepositoryCreate',
      component: () => import('@/views/repositories/RepositoryCreateView.vue'),
      meta: { requiresAuth: true }
    },
    // === ВЕТКИ ===
    {
      path: '/branches/select',
      name: 'branch-select',
      component: () => import('@/views/branches/BranchListView.vue'),
    },
    {
      path: '/branches/create',
      name: 'branch-create',
      component: () => import('@/views/branches/BranchCreateView.vue'),
    },
    
    // ОБЗОР ВСЕХ СУЩНОСТЕЙ (главная страница редактирования ветки)
    {
      path: '/branches/:branchId/edit',
      name: 'branch-overview',
      component: () => import('@/views/entities/BranchOverview.vue'),
      props: true,
    },
    
    // ДЕТАЛЬНЫЙ РЕДАКТОР КОНКРЕТНОЙ СУЩНОСТИ
    {
      path: '/branches/:branchId/edit/:entityType',
      name: 'entity-editor',
      component: () => import('@/views/entities/EntityTypeEditor.vue'),
      props: true,
    },
    
    // === ВХОД ОТ ЛЕРЫ ===
    {
      path: '/metamodel-editor',
      name: 'external-entry',
      component: Dashboard,
      props: (route) => ({ returnTo: route.query.returnTo }),
    },
  ],
});

export default router;