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

interface TodoGroup {
  id: string
  title: string
  description?: string
  items: TodoItem[]
  totalItems: number
  votes: number
  createdAt: string
  processedString?: string
}

interface Props {
  todoGroups: TodoGroup[]
  collapsedGroups: Set<string>
  showResults: boolean
  isGeneratingTodo: boolean
  showTodoPanel: boolean
  editingTaskId: string | null
  editingField: string | null
  editingValue: string
}

interface Emits {
  generateSmartTodoList: []
  toggleTaskComplete: [groupId: string, taskId: string]
  moveTaskUp: [groupId: string, taskId: string]
  moveTaskDown: [groupId: string, taskId: string]
  startEditing: [groupId: string, taskId: string, field: string, value: string]
  saveEdit: []
  cancelEdit: []
  deleteTask: [groupId: string, taskId: string]
  clearCompletedTasks: [groupId: string]
  deleteGroup: [groupId: string]
  copyTodoGroupAsJSON: [groupId: string]
  copyAllTodoGroupsAsJSON: []
  clearAllTodoGroups: []
  voteGroupUp: [groupId: string]
  voteGroupDown: [groupId: string]
  moveGroupUp: [groupId: string]
  moveGroupDown: [groupId: string]
  toggleGroupCollapse: [groupId: string]
  editGroupTitle: [groupId: string, newTitle: string]
  editGroupDescription: [groupId: string, newDescription: string]
  addTaskToGroup: [groupId: string, taskData: any]
  'update:editingValue': [value: string]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <section class="flex-1" :class="{ 'hidden': !showTodoPanel }">
    <div class="h-full overflow-y-auto p-6" v-show="showTodoPanel">
      <TodoEmptyState v-if="todoGroups.length === 0" />
      
      <div v-else class="max-w-4xl mx-auto space-y-6">
        <div v-if="todoGroups.length > 1" class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-muted-foreground">{{ todoGroups.length }} Todo Groups</h3>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" @click="$emit('copyAllTodoGroupsAsJSON')">
              Copy All Groups
            </Button>
            <Button size="sm" variant="destructive" @click="$emit('clearAllTodoGroups')">
              Clear All
            </Button>
          </div>
        </div>
        
        <TodoGroup 
          v-for="(group, index) in todoGroups"
          :key="group.id"
          :group-id="group.id"
          :todo-list="group"
          :group-index="index"
          :total-groups="todoGroups.length"
          :is-collapsed="collapsedGroups.has(group.id)"
          :editing-task-id="editingTaskId"
          :editing-field="editingField"
          :editing-value="editingValue"
          @toggle-task-complete="$emit('toggleTaskComplete', group.id, $event)"
          @move-task-up="$emit('moveTaskUp', group.id, $event)"
          @move-task-down="$emit('moveTaskDown', group.id, $event)"
          @start-editing="$emit('startEditing', group.id, $event.taskId, $event.field, $event.value)"
          @save-edit="$emit('saveEdit')"
          @cancel-edit="$emit('cancelEdit')"
          @delete-task="$emit('deleteTask', group.id, $event)"
          @clear-completed-tasks="$emit('clearCompletedTasks', group.id)"
          @delete-group="$emit('deleteGroup', group.id)"
          @copy-todo-group-as-json="$emit('copyTodoGroupAsJSON', group.id)"
          @vote-group-up="$emit('voteGroupUp', group.id)"
          @vote-group-down="$emit('voteGroupDown', group.id)"
          @move-group-up="$emit('moveGroupUp', group.id)"
          @move-group-down="$emit('moveGroupDown', group.id)"
          @toggle-group-collapse="$emit('toggleGroupCollapse', group.id)"
          @edit-group-title="$emit('editGroupTitle', group.id, $event)"
          @edit-group-description="$emit('editGroupDescription', group.id, $event)"
          @add-task-to-group="$emit('addTaskToGroup', group.id, $event)"
          @update:editing-value="$emit('update:editingValue', $event)"
        />
      </div>
    </div>
  </section>
</template>