<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, Camera, ListTodo, FileText, CheckCircle, Clock, Sparkles } from 'lucide-vue-next'

interface Props {
  isDark: boolean
  showImagePanel: boolean
  showTodoPanel: boolean
  numberCount: number
  todoGroupsCount: number
  totalTasks: number
  completedTasks: number
  isGeneratingTodo: boolean
  hasResults: boolean
}

interface Emits {
  toggleTheme: []
  toggleImagePanel: []
  toggleTodoPanel: []
  generateSmartTodoList: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20">
    <div class="flex items-center gap-4">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        ← Về trang chủ
      </a>
      
      <!-- Statistics -->
      <div class="flex items-center gap-3">
        <div v-if="hasResults" class="flex items-center gap-1">
          <FileText class="w-3.5 h-3.5 text-blue-600" />
          <Badge variant="secondary" class="text-xs px-2 py-0.5">
            {{ numberCount }} ảnh
          </Badge>
        </div>
        
        <div v-if="todoGroupsCount > 0" class="flex items-center gap-1">
          <ListTodo class="w-3.5 h-3.5 text-green-600" />
          <Badge variant="secondary" class="text-xs px-2 py-0.5">
            {{ todoGroupsCount }} nhóm
          </Badge>
        </div>
        
        <div v-if="totalTasks > 0" class="flex items-center gap-1">
          <CheckCircle class="w-3.5 h-3.5 text-emerald-600" />
          <Badge variant="secondary" class="text-xs px-2 py-0.5">
            {{ completedTasks }}/{{ totalTasks }} hoàn thành
          </Badge>
        </div>
        
        <div v-if="isGeneratingTodo" class="flex items-center gap-1">
          <Clock class="w-3.5 h-3.5 text-orange-600 animate-spin" />
          <Badge variant="outline" class="text-xs px-2 py-0.5 text-orange-600">
            Đang tạo todo...
          </Badge>
        </div>
      </div>
    </div>
    
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
      
      <Button 
        v-if="hasResults && showTodoPanel"
        @click="$emit('generateSmartTodoList')"
        :disabled="isGeneratingTodo"
        size="sm"
        class="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Sparkles class="w-4 h-4 mr-2" />
        {{ isGeneratingTodo ? 'Đang tạo...' : 'Tạo Todo' }}
      </Button>
      
      <Button variant="ghost" size="sm" @click="$emit('toggleTheme')" class="h-8 w-8 p-0">
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </Button>
    </div>
  </header>
</template>