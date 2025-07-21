<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, Trash2, Copy, X } from 'lucide-vue-next'
import TodoItem from './TodoItem.vue'

interface TodoItemType {
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
  items: TodoItemType[]
  totalItems: number
}

interface Props {
  todoList: TodoList
  editingTaskId: string | null
  editingField: string | null
  editingValue: string
}

interface Emits {
  toggleTaskComplete: [taskId: string]
  moveTaskUp: [taskId: string]
  moveTaskDown: [taskId: string]
  startEditing: [data: { taskId: string, field: string, value: string }]
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
  <!-- Todo Group Header -->
  <div class="bg-muted/30 border border-border/40 rounded-xl p-6">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-semibold mb-2">{{ todoList.title }}</h3>
        <p v-if="todoList.description" class="text-muted-foreground leading-relaxed">
          {{ todoList.description }}
        </p>
      </div>
      <div class="flex items-center gap-1 ml-4">
        <Button size="sm" variant="ghost" @click="$emit('moveGroupUp')" title="Tăng độ ưu tiên" class="h-8 w-8 p-0">
          <ChevronUp class="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" @click="$emit('moveGroupDown')" title="Giảm độ ưu tiên" class="h-8 w-8 p-0">
          <ChevronDown class="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" @click="$emit('clearCompletedTasks')" title="Xóa task hoàn thành" class="h-8 w-8 p-0">
          <Trash2 class="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" @click="$emit('copyTodoListAsJSON')" title="Sao chép JSON" class="h-8 w-8 p-0">
          <Copy class="w-4 h-4" />
        </Button>
        <Button size="sm" variant="destructive" @click="$emit('clearAllTodoList')" title="Xóa nhóm" class="h-8 w-8 p-0">
          <X class="w-4 h-4" />
        </Button>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Badge variant="secondary" class="font-medium px-3 py-1">
          {{ todoList.items.filter(item => !item.completed).length }}/{{ todoList.totalItems }} tasks
        </Badge>
        <Badge variant="outline" class="font-medium px-3 py-1">
          {{ Math.round((todoList.items.filter(item => item.completed).length / todoList.totalItems) * 100) }}% hoàn thành
        </Badge>
      </div>
      <div class="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
        Đã lưu tự động
      </div>
    </div>
  </div>

  <!-- Todo Items -->
  <div class="space-y-3">
    <TodoItem 
      v-for="(item, index) in todoList.items" 
      :key="item.id"
      :item="item"
      :index="index"
      :total-items="todoList.items.length"
      :editing-task-id="editingTaskId"
      :editing-field="editingField"
      :editing-value="editingValue"
      @toggle-complete="$emit('toggleTaskComplete', item.id)"
      @move-up="$emit('moveTaskUp', item.id)"
      @move-down="$emit('moveTaskDown', item.id)"
      @start-editing="$emit('startEditing', { taskId: item.id, field: $event.field, value: $event.value })"
      @save-edit="$emit('saveEdit')"
      @cancel-edit="$emit('cancelEdit')"
      @delete="$emit('deleteTask', item.id)"
      @update:editing-value="$emit('update:editingValue', $event)"
    />
  </div>
</template>