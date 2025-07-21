<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sun, Moon, Camera, ListTodo } from 'lucide-vue-next'

interface Props {
  isDark: boolean
  showImagePanel: boolean
  showTodoPanel: boolean
}

interface Emits {
  toggleTheme: []
  toggleImagePanel: []
  toggleTodoPanel: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <header class="flex justify-between items-center px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
    <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
      ← Về trang chủ
    </a>
    
    <!-- Panel Toggle Menu -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Button 
          variant="ghost" 
          size="sm" 
          @click="$emit('toggleImagePanel')" 
          :class="{ 'bg-background shadow-sm': showImagePanel }"
          class="h-7 px-3 text-xs font-medium transition-all"
        >
          <Camera class="w-3.5 h-3.5 mr-1" />
          Xử lý ảnh
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="$emit('toggleTodoPanel')" 
          :class="{ 'bg-background shadow-sm': showTodoPanel }"
          class="h-7 px-3 text-xs font-medium transition-all"
        >
          <ListTodo class="w-3.5 h-3.5 mr-1" />
          Todo List
        </Button>
      </div>
      
      <Button variant="ghost" size="sm" @click="$emit('toggleTheme')" class="h-8 w-8 p-0">
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </Button>
    </div>
  </header>
</template>