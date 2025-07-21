<script setup lang="ts">
import { ListTodo } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full text-center">
    <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
      <ListTodo class="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-medium mb-2">Chưa có todo list</h3>
    <p class="text-muted-foreground mb-4">Xử lý dữ liệu ảnh để tạo todo list đầu tiên</p>
    <div class="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
      Dữ liệu sẽ được lưu tự động
    </div>
  </div>
</template>