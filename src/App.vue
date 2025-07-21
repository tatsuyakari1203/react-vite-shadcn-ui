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
    
    todoList.value = await generateTodoList(imageCodes, rawInput)
    saveTodoListToStorage() // Auto-save after generating
  } catch (error) {
    console.error('Error generating todo list:', error)
    alert('Có lỗi xảy ra khi tạo todo list. Vui lòng thử lại!')
  } finally {
    isGeneratingTodo.value = false
  }
}

const copyTodoListAsJSON = async () => {
  if (todoList.value) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(todoList.value, null, 2))
      alert('Todo list đã được sao chép dưới dạng JSON!')
    } catch (err) {
      alert('Không thể sao chép todo list!')
    }
  }
}

// Todo management functions
const toggleTaskComplete = (taskId) => {
  if (todoList.value) {
    const task = todoList.value.items.find(item => item.id === taskId)
    if (task) {
      task.completed = !task.completed
    }
  }
}

const moveTaskUp = (taskId) => {
  if (todoList.value) {
    const items = todoList.value.items
    const index = items.findIndex(item => item.id === taskId)
    if (index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]]
    }
  }
}

const moveTaskDown = (taskId) => {
  if (todoList.value) {
    const items = todoList.value.items
    const index = items.findIndex(item => item.id === taskId)
    if (index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]]
    }
  }
}

const startEditing = (taskId, field, value) => {
  editingTaskId.value = taskId
  editingField.value = field
  editingValue.value = value || ''
}

const saveEdit = () => {
  if (todoList.value && editingTaskId.value) {
    const task = todoList.value.items.find(item => item.id === editingTaskId.value)
    if (task) {
      if (editingField.value === 'tags') {
        task.tags = editingValue.value.split(',').map(tag => tag.trim()).filter(tag => tag)
      } else {
        task[editingField.value] = editingValue.value
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

const deleteTask = (taskId) => {
  if (todoList.value) {
    todoList.value.items = todoList.value.items.filter(item => item.id !== taskId)
    todoList.value.totalItems = todoList.value.items.length
    saveTodoListToStorage()
  }
}

const clearCompletedTasks = () => {
  if (todoList.value) {
    todoList.value.items = todoList.value.items.filter(item => !item.completed)
    todoList.value.totalItems = todoList.value.items.length
    saveTodoListToStorage()
  }
}

const clearAllTodoList = () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ todo list?')) {
    todoList.value = null
    localStorage.removeItem('todoList')
  }
}

const moveGroupUp = () => {
  // Placeholder for group priority increase
  console.log('Move group up')
}

const moveGroupDown = () => {
  // Placeholder for group priority decrease
  console.log('Move group down')
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

// Load theme and todo list on mount
onMounted(() => {
  loadTheme()
  loadTodoListFromStorage()
})

// Watch for changes in todoList and save to localStorage
watch(todoList, () => {
  saveTodoListToStorage()
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
        :todo-list="todoList"
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
        @copy-todo-list-as-json="copyTodoListAsJSON"
        @clear-all-todo-list="clearAllTodoList"
        @move-group-up="moveGroupUp"
        @move-group-down="moveGroupDown"
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
