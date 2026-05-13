<script setup lang="ts">
import type { BranchDto } from '@/types/api';

defineProps<{ branch: BranchDto }>();
</script>

<template>
  <div class="branch-name-cell">
    <span class="icon">{{ branch.id === '00000000-0000-0000-0000-000000000000' ? '🌿' : '🔀' }}</span>
    <strong>{{ branch.name }}</strong>
    <span v-if="branch.id === '00000000-0000-0000-0000-000000000000'" class="badge">main</span>
  </div>
</template>

<style scoped>
.branch-name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon { font-size: 1.1rem; }
.badge {
  color: #10b981;
  font-size: 0.8rem;
  background: #ecfdf5;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}
</style>