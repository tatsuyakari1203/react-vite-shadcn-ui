<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ListTodo } from 'lucide-vue-next'
import TodoGroup from './TodoGroup.vue'
import TodoEmptyState from './TodoEmptyState.vue'

interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  imageCode?: string
  dueDate?: string
  tags?: string[]
}

interface TodoList {
  title: string
  description?: string
  items: TodoItem[]
  totalItems: number
}

interface Props {
  todoList: TodoList | null
  showResults: boolean
  isGeneratingTodo: boolean
  showTodoPanel: boolean
  editingTaskId: string | null
  editingField: string | null
  editingValue: string
}

interface Emits {
  generateSmartTodoList: []
  toggleTaskComplete: [taskId: string]
  moveTaskUp: [taskId: string]
  moveTaskDown: [taskId: string]
  startEditing: [taskId: string, field: string, value: string]
  saveEdit: []
  cancelEdit: []
  deleteTask: [taskId: string]
  clearCompletedTasks: []
  copyTodoListAsJSON: []
  clearAllTodoList: []
  moveGroupUp: []
  moveGroupDown: []
  'update:editingValue': [value: string]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <section class="flex-1" :class="{ 'hidden': !showTodoPanel }">
    <div class="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-muted/20">
      <h2 class="text-lg font-semibold text-foreground">Todo List Manager</h2>
      <div class="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          @click="$emit('generateSmartTodoList')" 
          :disabled="isGeneratingTodo" 
          v-if="showResults" 
          class="font-medium"
        >
          <ListTodo class="w-4 h-4 mr-1" />
          {{ isGeneratingTodo ? 'Tạo...' : 'Tạo Todo' }}
        </Button>
      </div>
    </div>
    
    <div class="h-full overflow-y-auto p-6" v-show="showTodoPanel">
      <TodoEmptyState v-if="!todoList" />
      
      <div v-else class="max-w-4xl mx-auto space-y-6">
        <TodoGroup 
          :todo-list="todoList"
          :editing-task-id="editingTaskId"
          :editing-field="editingField"
          :editing-value="editingValue"
          @toggle-task-complete="$emit('toggleTaskComplete', $event)"
          @move-task-up="$emit('moveTaskUp', $event)"
          @move-task-down="$emit('moveTaskDown', $event)"
          @start-editing="$emit('startEditing', $event.taskId, $event.field, $event.value)"
          @save-edit="$emit('saveEdit')"
          @cancel-edit="$emit('cancelEdit')"
          @delete-task="$emit('deleteTask', $event)"
          @clear-completed-tasks="$emit('clearCompletedTasks')"
          @copy-todo-list-as-json="$emit('copyTodoListAsJSON')"
          @clear-all-todo-list="$emit('clearAllTodoList')"
          @move-group-up="$emit('moveGroupUp')"
          @move-group-down="$emit('moveGroupDown')"
          @update:editing-value="$emit('update:editingValue', $event)"
        />
      </div>
    </div>
  </section>
</template>