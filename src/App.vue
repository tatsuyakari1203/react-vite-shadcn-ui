<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGeminiAI } from '@/composables/useGeminiAI'
import AppHeader from '@/components/AppHeader.vue'
import ImageProcessingPanel from '@/components/ImageProcessingPanel.vue'
import TodoPanel from '@/components/TodoPanel.vue'

// Reactive data
const inputData = ref('')
const outputResult = ref('')
const copyButtonText = ref('Copy All')
const copyValidButtonText = ref('Copy Valid')
const isDark = ref(false)

// Todo list state
const isGeneratingTodo = ref(false)
const todoGroups = ref([])
const collapsedGroups = ref(new Set())
const { generateTodoList } = useGeminiAI()

// Todo management state
const editingTaskId = ref(null)
const editingField = ref(null)
const editingValue = ref('')

// Panel visibility state
const showImagePanel = ref(true)
const showTodoPanel = ref(true)

const toggleImagePanel = () => {
  if (!showImagePanel.value && !showTodoPanel.value) {
    showImagePanel.value = true
  } else {
    showImagePanel.value = !showImagePanel.value
  }
}

const toggleTodoPanel = () => {
  if (!showImagePanel.value && !showTodoPanel.value) {
    showTodoPanel.value = true
  } else {
    showTodoPanel.value = !showTodoPanel.value
  }
}

// LocalStorage functions for todo groups
const saveTodoGroupsToStorage = () => {
  if (todoGroups.value.length > 0) {
    localStorage.setItem('todoGroups', JSON.stringify(todoGroups.value))
  }
}

const loadTodoGroupsFromStorage = () => {
  const saved = localStorage.getItem('todoGroups')
  if (saved) {
    try {
      todoGroups.value = JSON.parse(saved)
    } catch (error) {
      console.error('Error loading todo groups from localStorage:', error)
    }
  }
  // Migration from old single todoList
  const oldTodoList = localStorage.getItem('todoList')
  if (oldTodoList && todoGroups.value.length === 0) {
    try {
      const oldData = JSON.parse(oldTodoList)
      if (oldData) {
        todoGroups.value = [{ ...oldData, id: Date.now().toString(), votes: 0, createdAt: new Date().toISOString() }]
        saveTodoGroupsToStorage()
        localStorage.removeItem('todoList')
      }
    } catch (error) {
      console.error('Error migrating old todo list:', error)
    }
  }
}

// Theme management
const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

// Data processing
const processData = () => {
  const input = inputData.value
  const numbers = input.match(/\d+/g) || []
  const result = numbers.join(' ')
  outputResult.value = result
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputResult.value)
    copyButtonText.value = 'Copied!'
    setTimeout(() => {
      copyButtonText.value = 'Copy All'
    }, 1000)
  } catch (err) {
    alert('Không thể sao chép. Vui lòng thử lại!')
  }
}

const copyValidToClipboard = async () => {
  const numbers = (inputData.value.match(/\d+/g) || [])
  const validNumbers = numbers.filter(num => num.length > 2 && num.length < 5)
  const cleanedValidData = [...new Set(validNumbers)].join(' ')
  
  if (cleanedValidData) {
    try {
      await navigator.clipboard.writeText(cleanedValidData)
      copyValidButtonText.value = 'Copied!'
      setTimeout(() => {
        copyValidButtonText.value = 'Copy Valid'
      }, 1000)
    } catch (err) {
      alert('Không thể sao chép. Vui lòng thử lại!')
    }
  } else {
    alert('Không có số hợp lệ để sao chép!')
  }
}

const saveToBox = () => {
  alert('Tính năng lưu đã được thay thế bằng Todo List Manager!')
}

const generateSmartTodoList = async () => {
  if (!showResults.value) {
    alert('Vui lòng xử lý dữ liệu trước khi tạo todo list!')
    return
  }

  isGeneratingTodo.value = true
  try {
    const imageCodes = validNumbers.value
    const rawInput = inputData.value
    
    const newTodoGroup = await generateTodoList(imageCodes, rawInput)
    if (newTodoGroup) {
      // Add group metadata
      newTodoGroup.id = Date.now().toString()
      newTodoGroup.votes = 0
      newTodoGroup.createdAt = new Date().toISOString()
      newTodoGroup.processedString = outputResult.value // Save the processed string
      
      // Add to beginning of array (newest first)
      todoGroups.value.unshift(newTodoGroup)
      saveTodoGroupsToStorage() // Auto-save after generating
    }
  } catch (error) {
    console.error('Error generating todo list:', error)
    alert('Có lỗi xảy ra khi tạo todo list. Vui lòng thử lại!')
  } finally {
    isGeneratingTodo.value = false
  }
}

const copyTodoGroupAsJSON = async (groupId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(group, null, 2))
      alert('Todo group đã được sao chép dưới dạng JSON!')
    } catch (err) {
      alert('Không thể sao chép todo group!')
    }
  }
}

const copyAllTodoGroupsAsJSON = async () => {
  if (todoGroups.value.length > 0) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(todoGroups.value, null, 2))
      alert('Tất cả todo groups đã được sao chép dưới dạng JSON!')
    } catch (err) {
      alert('Không thể sao chép todo groups!')
    }
  }
}

// Todo management functions
const toggleTaskComplete = (groupId, taskId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    const task = group.items.find(item => item.id === taskId)
    if (task) {
      task.completed = !task.completed
      saveTodoGroupsToStorage()
    }
  }
}

const moveTaskUp = (groupId, taskId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    const items = group.items
    const index = items.findIndex(item => item.id === taskId)
    if (index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]]
      saveTodoGroupsToStorage()
    }
  }
}

const moveTaskDown = (groupId, taskId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    const items = group.items
    const index = items.findIndex(item => item.id === taskId)
    if (index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]]
      saveTodoGroupsToStorage()
    }
  }
}

const startEditing = (groupId, taskId, field, value) => {
  editingTaskId.value = taskId
  editingField.value = field
  editingValue.value = value || ''
}

const saveEdit = () => {
  if (editingTaskId.value) {
    // Find the task across all groups
    for (const group of todoGroups.value) {
      const task = group.items.find(item => item.id === editingTaskId.value)
      if (task) {
        if (editingField.value === 'tags') {
          task.tags = editingValue.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        } else {
          task[editingField.value] = editingValue.value
        }
        saveTodoGroupsToStorage()
        break
      }
    }
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingTaskId.value = null
  editingField.value = null
  editingValue.value = ''
}

const deleteTask = (groupId, taskId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    group.items = group.items.filter(item => item.id !== taskId)
    group.totalItems = group.items.length
    saveTodoGroupsToStorage()
  }
}

const clearCompletedTasks = (groupId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    group.items = group.items.filter(item => !item.completed)
    group.totalItems = group.items.length
    saveTodoGroupsToStorage()
  }
}

const deleteGroup = (groupId) => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ group này?')) {
    todoGroups.value = todoGroups.value.filter(g => g.id !== groupId)
    collapsedGroups.value.delete(groupId)
    saveTodoGroupsToStorage()
  }
}

const clearAllTodoGroups = () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ todo groups?')) {
    todoGroups.value = []
    collapsedGroups.value.clear()
    localStorage.removeItem('todoGroups')
  }
}

// Group collapse/expand functions
const toggleGroupCollapse = (groupId) => {
  if (collapsedGroups.value.has(groupId)) {
    collapsedGroups.value.delete(groupId)
  } else {
    collapsedGroups.value.add(groupId)
  }
}

const isGroupCollapsed = (groupId) => {
  return collapsedGroups.value.has(groupId)
}

// Group editing functions
const editGroupTitle = (groupId, newTitle) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group && newTitle.trim()) {
    group.title = newTitle.trim()
    saveTodoGroupsToStorage()
  }
}

const editGroupDescription = (groupId, newDescription) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    group.description = newDescription.trim()
    saveTodoGroupsToStorage()
  }
}

const addTaskToGroup = (groupId, taskData) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      dueDate: taskData.dueDate || ''
    }
    group.items.push(newTask)
    group.totalItems = group.items.length
    saveTodoGroupsToStorage()
  }
}

// Group management functions
const voteGroupUp = (groupId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    group.votes = (group.votes || 0) + 1
    sortGroupsByVotes()
    saveTodoGroupsToStorage()
  }
}

const voteGroupDown = (groupId) => {
  const group = todoGroups.value.find(g => g.id === groupId)
  if (group) {
    group.votes = (group.votes || 0) - 1
    sortGroupsByVotes()
    saveTodoGroupsToStorage()
  }
}

const sortGroupsByVotes = () => {
  todoGroups.value.sort((a, b) => {
    // Sort by votes (descending), then by creation date (newest first)
    if (b.votes !== a.votes) {
      return b.votes - a.votes
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
}

const moveGroupUp = (groupId) => {
  const index = todoGroups.value.findIndex(g => g.id === groupId)
  if (index > 0) {
    [todoGroups.value[index], todoGroups.value[index - 1]] = [todoGroups.value[index - 1], todoGroups.value[index]]
    saveTodoGroupsToStorage()
  }
}

const moveGroupDown = (groupId) => {
  const index = todoGroups.value.findIndex(g => g.id === groupId)
  if (index < todoGroups.value.length - 1) {
    [todoGroups.value[index], todoGroups.value[index + 1]] = [todoGroups.value[index + 1], todoGroups.value[index]]
    saveTodoGroupsToStorage()
  }
}

// Computed properties
const showResults = computed(() => outputResult.value.length > 0)
const showCopyValid = computed(() => hasWarning.value)
const numberCount = computed(() => {
  if (!outputResult.value) return 0
  return outputResult.value.split(' ').filter(item => item.trim()).length
})
const validNumbers = computed(() => {
  const numbers = (inputData.value.match(/\d+/g) || [])
  return numbers.filter(num => num.length > 2 && num.length < 5)
})
const hasWarning = computed(() => {
  const numbers = (inputData.value.match(/\d+/g) || [])
  return numbers.some(num => num.length <= 2 || num.length >= 5)
})

const currentGroup = computed(() => {
  return todoGroups.value.length > 0 ? todoGroups.value[0] : null
})

// Load theme and todo list on mount
onMounted(() => {
  loadTheme()
  loadTodoGroupsFromStorage()
})

// Watch for changes in todoGroups and save to localStorage
watch(todoGroups, () => {
  saveTodoGroupsToStorage()
}, { deep: true })
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader 
      :is-dark="isDark"
      :show-image-panel="showImagePanel"
      :show-todo-panel="showTodoPanel"
      @toggle-theme="toggleTheme"
      @toggle-image-panel="toggleImagePanel"
      @toggle-todo-panel="toggleTodoPanel"
    />

    <!-- Main Layout: Two Panels -->
    <main class="flex h-[calc(100vh-73px)]">
      <ImageProcessingPanel 
         v-model:input-data="inputData"
         :output-result="outputResult"
         :copy-button-text="copyButtonText"
         :copy-valid-button-text="copyValidButtonText"
         :show-results="showResults"
         :show-copy-valid="showCopyValid"
         :has-warning="hasWarning"
         :number-count="numberCount"
         :is-generating-todo="isGeneratingTodo"
         :show-image-panel="showImagePanel"
         :show-todo-panel="showTodoPanel"
         @process-data="processData"
         @copy-to-clipboard="copyToClipboard"
         @copy-valid-to-clipboard="copyValidToClipboard"
         @save-to-box="saveToBox"
         @generate-smart-todo-list="generateSmartTodoList"
       />

      <TodoPanel 
        :todo-groups="todoGroups"
        :collapsed-groups="collapsedGroups"
        :editing-task-id="editingTaskId"
        :editing-field="editingField"
        :editing-value="editingValue"
        :show-todo-panel="showTodoPanel"
        :show-results="showResults"
        :is-generating-todo="isGeneratingTodo"
        @toggle-task-complete="toggleTaskComplete"
        @move-task-up="moveTaskUp"
        @move-task-down="moveTaskDown"
        @start-editing="startEditing"
        @save-edit="saveEdit"
        @cancel-edit="cancelEdit"
        @delete-task="deleteTask"
        @clear-completed-tasks="clearCompletedTasks"
        @delete-group="deleteGroup"
        @clear-all-todo-groups="clearAllTodoGroups"
        @copy-todo-group-as-json="copyTodoGroupAsJSON"
        @copy-all-todo-groups-as-json="copyAllTodoGroupsAsJSON"
        @vote-group-up="voteGroupUp"
        @vote-group-down="voteGroupDown"
        @move-group-up="moveGroupUp"
        @move-group-down="moveGroupDown"
        @toggle-group-collapse="toggleGroupCollapse"
        @edit-group-title="editGroupTitle"
        @edit-group-description="editGroupDescription"
        @add-task-to-group="addTaskToGroup"
        @generate-smart-todo-list="generateSmartTodoList"
        @update:editing-value="editingValue = $event"
      />
    </main>
  </div>
</template>

<style>
/* Custom scrollbar styles with dark mode support */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:active {
  background: hsl(var(--muted-foreground) / 0.7);
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Dark mode specific styles using class selector */
.dark ::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.4);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.6);
}

.dark ::-webkit-scrollbar-thumb:active {
  background: hsl(var(--muted-foreground) / 0.8);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
}

.dark * {
  scrollbar-color: hsl(var(--muted-foreground) / 0.4) transparent;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 6px;
}
</style>
