<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TodoItem from './TodoItem.vue'
import { ArrowUp, ArrowDown, Copy, Trash2, ThumbsUp, ThumbsDown, Calendar, Users, ChevronRight, Edit, Plus, FileText, X, ChevronUp, ChevronDown } from 'lucide-vue-next'

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

interface TodoGroup {
  id: string
  title: string
  description?: string
  items: TodoItemType[]
  totalItems: number
  votes: number
  createdAt: string
  processedString?: string
}

interface Props {
  groupId: string
  todoList: TodoGroup
  groupIndex: number
  totalGroups: number
  isCollapsed: boolean
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
  deleteGroup: []
  copyTodoGroupAsJson: []
  voteGroupUp: []
  voteGroupDown: []
  moveGroupUp: []
  moveGroupDown: []
  toggleGroupCollapse: []
  editGroupTitle: [newTitle: string]
  editGroupDescription: [newDescription: string]
  addTaskToGroup: [taskData: any]
  'update:editingValue': [value: string]
}

import { ref } from 'vue'

defineProps<Props>()
defineEmits<Emits>()

const isEditingTitle = ref(false)
const isEditingDescription = ref(false)
const isAddingTask = ref(false)
const editTitleValue = ref('')
const editDescriptionValue = ref('')
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskPriority = ref('medium')

const startEditingTitle = (currentTitle) => {
  editTitleValue.value = currentTitle
  isEditingTitle.value = true
}

const saveTitle = () => {
  if (editTitleValue.value.trim()) {
    $emit('editGroupTitle', editTitleValue.value)
  }
  isEditingTitle.value = false
}

const cancelEditingTitle = () => {
  isEditingTitle.value = false
  editTitleValue.value = ''
}

const startEditingDescription = (currentDescription) => {
  editDescriptionValue.value = currentDescription || ''
  isEditingDescription.value = true
}

const saveDescription = () => {
  $emit('editGroupDescription', editDescriptionValue.value)
  isEditingDescription.value = false
}

const cancelEditingDescription = () => {
  isEditingDescription.value = false
  editDescriptionValue.value = ''
}

const startAddingTask = () => {
  newTaskTitle.value = ''
  newTaskDescription.value = ''
  newTaskPriority.value = 'medium'
  isAddingTask.value = true
}

const saveNewTask = () => {
  if (newTaskTitle.value.trim()) {
    $emit('addTaskToGroup', {
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      priority: newTaskPriority.value
    })
  }
  isAddingTask.value = false
}

const cancelAddingTask = () => {
  isAddingTask.value = false
}

const copyProcessedString = async (processedString) => {
  if (processedString) {
    try {
      await navigator.clipboard.writeText(processedString)
      alert('Processed string đã được sao chép!')
    } catch (err) {
      alert('Không thể sao chép processed string!')
    }
  }
}
</script>

<template>
  <!-- Todo Group Header -->
  <div class="bg-muted/30 border border-border/40 rounded-lg p-4">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-start gap-2 flex-1">
        <!-- Collapse/Expand Button -->
        <Button 
          size="sm" 
          variant="ghost" 
          @click="$emit('toggleGroupCollapse')" 
          class="h-6 w-6 p-0 mt-0.5 flex-shrink-0"
        >
          <ChevronRight class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-90': !isCollapsed }" />
        </Button>
        
        <div class="flex-1 min-w-0">
          <!-- Title Section -->
          <div class="flex items-center gap-2 mb-1.5">
            <div v-if="!isEditingTitle" class="flex items-center gap-1">
              <h3 class="text-lg font-semibold">{{ todoList.title }}</h3>
              <Button size="sm" variant="ghost" @click="startEditingTitle(todoList.title)" class="h-5 w-5 p-0">
                <Edit class="w-2.5 h-2.5" />
              </Button>
            </div>
            <div v-else class="flex items-center gap-1">
              <Input 
                v-model="editTitleValue" 
                @keyup.enter="saveTitle" 
                @keyup.escape="cancelEditingTitle"
                class="text-lg font-semibold h-7"
                placeholder="Group title"
              />
              <Button size="sm" @click="saveTitle" class="h-7 px-2 text-xs">Save</Button>
              <Button size="sm" variant="outline" @click="cancelEditingTitle" class="h-7 px-2 text-xs">Cancel</Button>
            </div>
            
            <div class="flex items-center gap-1">
              <Badge variant="outline" class="flex items-center gap-1 text-xs px-1.5 py-0.5">
                <ThumbsUp class="w-2.5 h-2.5" />
                {{ todoList.votes }}
              </Badge>
              <Badge variant="secondary" class="flex items-center gap-1 text-xs px-1.5 py-0.5">
                <Calendar class="w-2.5 h-2.5" />
                {{ new Date(todoList.createdAt).toLocaleDateString('vi-VN') }}
              </Badge>
              <Badge variant="outline" class="flex items-center gap-1 text-xs px-1.5 py-0.5">
                <Users class="w-2.5 h-2.5" />
                #{{ groupIndex + 1 }}
              </Badge>
            </div>
          </div>
          
          <!-- Description Section -->
          <div v-if="!isEditingDescription && todoList.description" class="flex items-start gap-1 mb-1.5">
            <p class="text-sm text-muted-foreground leading-relaxed flex-1">{{ todoList.description }}</p>
            <Button size="sm" variant="ghost" @click="startEditingDescription(todoList.description)" class="h-5 w-5 p-0">
              <Edit class="w-2.5 h-2.5" />
            </Button>
          </div>
          <div v-else-if="!isEditingDescription && !todoList.description" class="mb-1.5">
            <Button size="sm" variant="outline" @click="startEditingDescription('')" class="text-xs h-6 px-2">
              <Plus class="w-2.5 h-2.5 mr-1" />
              Add Description
            </Button>
          </div>
          <div v-else class="mb-1.5">
            <Textarea 
              v-model="editDescriptionValue" 
              @keyup.ctrl.enter="saveDescription" 
              @keyup.escape="cancelEditingDescription"
              placeholder="Group description"
              class="mb-1.5 text-sm h-16"
            />
            <div class="flex gap-1">
              <Button size="sm" @click="saveDescription" class="h-6 px-2 text-xs">Save</Button>
              <Button size="sm" variant="outline" @click="cancelEditingDescription" class="h-6 px-2 text-xs">Cancel</Button>
            </div>
          </div>
          
          <!-- Processed String Section -->
          <div v-if="todoList.processedString" class="mb-2">
            <div class="flex items-center gap-2 p-2 bg-muted/50 rounded border">
              <span class="text-xs text-muted-foreground font-mono flex-1 truncate">{{ todoList.processedString }}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                @click="copyProcessedString(todoList.processedString)" 
                class="h-6 w-6 p-0 flex-shrink-0"
                title="Copy original text"
              >
                <Copy class="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-0.5 ml-3">
        <!-- Voting buttons -->
        <Button size="sm" variant="outline" @click="$emit('voteGroupUp')" title="Vote Up" class="h-6 w-6 p-0 text-green-600 hover:text-green-700">
          <ThumbsUp class="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" @click="$emit('voteGroupDown')" title="Vote Down" class="h-6 w-6 p-0 text-red-600 hover:text-red-700">
          <ThumbsDown class="w-3 h-3" />
        </Button>
        <!-- Position controls -->
        <Button size="sm" variant="ghost" @click="$emit('moveGroupUp')" title="Di chuyển lên" class="h-6 w-6 p-0" :disabled="groupIndex === 0">
          <ChevronUp class="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" @click="$emit('moveGroupDown')" title="Di chuyển xuống" class="h-6 w-6 p-0" :disabled="groupIndex === totalGroups - 1">
          <ChevronDown class="w-3 h-3" />
        </Button>
        <!-- Action buttons -->
        <Button size="sm" variant="outline" @click="$emit('clearCompletedTasks')" title="Xóa task hoàn thành" class="h-6 w-6 p-0">
          <Trash2 class="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" @click="$emit('copyTodoGroupAsJson')" title="Sao chép JSON" class="h-6 w-6 p-0">
          <Copy class="w-3 h-3" />
        </Button>
        <Button size="sm" variant="destructive" @click="$emit('deleteGroup')" title="Xóa nhóm" class="h-6 w-6 p-0">
          <X class="w-3 h-3" />
        </Button>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Badge variant="secondary" class="font-medium px-2 py-0.5 text-xs">
          {{ todoList.items.filter(item => !item.completed).length }}/{{ todoList.totalItems }} tasks
        </Badge>
        <Badge variant="outline" class="font-medium px-2 py-0.5 text-xs">
          {{ Math.round((todoList.items.filter(item => item.completed).length / todoList.totalItems) * 100) }}% hoàn thành
        </Badge>
      </div>
      <div class="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        Đã lưu tự động
      </div>
    </div>
  </div>

  <!-- Collapsible Content -->
  <div v-if="!isCollapsed">
    <!-- Add Task Section -->
    <div class="bg-muted/20 border border-border/30 rounded-lg p-3 mb-3">
      <div v-if="!isAddingTask" class="flex items-center justify-center">
        <Button size="sm" variant="outline" @click="startAddingTask" class="flex items-center gap-1 h-7 px-3 text-xs">
          <Plus class="w-3 h-3" />
          Add New Task
        </Button>
      </div>
      <div v-else class="space-y-2">
        <Input 
          v-model="newTaskTitle" 
          placeholder="Task title"
          @keyup.enter="saveNewTask"
          @keyup.escape="cancelAddingTask"
          class="h-7 text-sm"
        />
        <Textarea 
          v-model="newTaskDescription" 
          placeholder="Task description (optional)"
          @keyup.ctrl.enter="saveNewTask"
          @keyup.escape="cancelAddingTask"
          class="h-12 text-sm resize-none"
        />
        <div class="flex items-center gap-1">
          <select v-model="newTaskPriority" class="px-2 py-1 border rounded text-xs h-7">
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <Button size="sm" @click="saveNewTask" class="h-7 px-2 text-xs">Add Task</Button>
          <Button size="sm" variant="outline" @click="cancelAddingTask" class="h-7 px-2 text-xs">Cancel</Button>
        </div>
      </div>
    </div>

    <!-- Todo Items -->
    <div class="space-y-2">
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
  </div>
</template>