<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copy, Save, Download, Upload, Trash2, Moon, Sun, ListTodo, ChevronUp, ChevronDown, Edit, Check, X, ChevronLeft, ChevronRight, Camera } from 'lucide-vue-next'
import { useGeminiAI } from '@/composables/useGeminiAI'

// Reactive data
const inputData = ref('')
const outputResult = ref('')
const copyButtonText = ref('Copy All')
const copyValidButtonText = ref('Copy Valid')
const isDark = ref(false)

// Todo list state
const isGeneratingTodo = ref(false)
const todoList = ref(null)
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

// LocalStorage functions for todo list
const saveTodoListToStorage = () => {
  if (todoList.value) {
    localStorage.setItem('todoList', JSON.stringify(todoList.value))
  }
}

const loadTodoListFromStorage = () => {
  const saved = localStorage.getItem('todoList')
  if (saved) {
    try {
      todoList.value = JSON.parse(saved)
    } catch (error) {
      console.error('Error loading todo list from localStorage:', error)
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
    <!-- Header -->
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
            @click="toggleImagePanel" 
            :class="{ 'bg-background shadow-sm': showImagePanel }"
            class="h-7 px-3 text-xs font-medium transition-all"
          >
            <Camera class="w-3.5 h-3.5 mr-1" />
            Xử lý ảnh
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            @click="toggleTodoPanel" 
            :class="{ 'bg-background shadow-sm': showTodoPanel }"
            class="h-7 px-3 text-xs font-medium transition-all"
          >
            <ListTodo class="w-3.5 h-3.5 mr-1" />
            Todo List
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" @click="toggleTheme" class="h-8 w-8 p-0">
          <Sun v-if="isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </Button>
      </div>
    </header>

    <!-- Main Layout: Two Panels -->
    <main class="flex h-[calc(100vh-73px)]">
      <!-- Image Processing Panel -->
      <section class="flex-1" :class="{ 'hidden': !showImagePanel, 'border-r border-border/40': showTodoPanel }">
        <div class="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-muted/20">
          <h2 class="text-lg font-semibold text-foreground">Xử lý tên ảnh</h2>
        </div>
        <div class="p-6 h-full overflow-y-auto" v-show="showImagePanel">
          <div class="max-w-4xl mx-auto space-y-8">
             <div class="text-center">
               <h1 class="text-3xl font-bold tracking-tight mb-3">Xử lý tên ảnh</h1>
               <p class="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                 Nhập dãy số vào ô bên dưới. Tool sẽ xử lý để trả về dãy số cùng một hàng, cách nhau bởi dấu cách.
               </p>
             </div>

            <!-- Input area -->
             <Card class="border-border/40">
               <CardContent class="p-6">
                 <Textarea
                   v-model="inputData"
                   placeholder="Nhập dãy số ở đây..."
                   class="min-h-[150px] resize-y border-border/40 focus:border-primary/40 transition-colors"
                 />
                 
                 <div class="flex flex-wrap gap-2 mt-6">
                  <Button @click="processData" class="font-medium">
                     Xử Lý
                   </Button>
                   
                   <Button 
                     v-if="showResults" 
                     @click="copyToClipboard" 
                     variant="outline"
                     class="font-medium"
                   >
                     <Copy class="w-4 h-4 mr-2" />
                     {{ copyButtonText }}
                   </Button>
                   
                   <Button 
                     v-if="showCopyValid" 
                     @click="copyValidToClipboard" 
                     variant="outline"
                     class="font-medium"
                   >
                     <Copy class="w-4 h-4 mr-2" />
                     {{ copyValidButtonText }}
                   </Button>
                   
                   <Button 
                     v-if="showResults" 
                     @click="saveToBox" 
                     variant="outline"
                     class="font-medium"
                   >
                     <Save class="w-4 h-4 mr-2" />
                     Lưu
                   </Button>
                   
                   <Button 
                     v-if="showResults" 
                     @click="generateSmartTodoList" 
                     variant="outline"
                     :disabled="isGeneratingTodo"
                     class="font-medium"
                   >
                     <ListTodo class="w-4 h-4 mr-2" />
                     {{ isGeneratingTodo ? 'Đang tạo...' : 'Tạo Todo List' }}
                   </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Results -->
             <Card v-if="showResults" class="border-border/40">
               <CardHeader class="pb-3">
                 <CardTitle class="flex items-center justify-between text-lg">
                   Kết quả
                   <Badge variant="secondary" class="font-medium">{{ numberCount }} số</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div class="bg-muted/50 p-4 rounded-lg font-mono text-sm break-all border border-border/20">
                   {{ outputResult }}
                 </div>
               </CardContent>
             </Card>

            <!-- Warning -->
             <Alert v-if="hasWarning" class="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
               <AlertDescription class="text-amber-800 dark:text-amber-200 font-medium">
                 ⚠️ Có tên ảnh không phù hợp (số có 1, 2 hoặc từ 5 chữ số trở lên)
               </AlertDescription>
             </Alert>

            <!-- Instructions -->
             <div class="grid md:grid-cols-2 gap-6">
               <Card class="border-border/40">
                 <CardHeader class="pb-3">
                   <CardTitle class="text-base font-semibold">Adobe Lightroom</CardTitle>
                 </CardHeader>
                 <CardContent class="space-y-3 text-sm text-muted-foreground leading-relaxed">
                   <p>• Vào tab <strong class="text-foreground">Library</strong>, nhấn <kbd class="px-1.5 py-0.5 text-xs bg-muted border rounded">G</kbd>, sau đó nhấn <kbd class="px-1.5 py-0.5 text-xs bg-muted border rounded">\</kbd> để hiển thị Filter Bar</p>
                   <p>• Nhấn vào phần <strong class="text-foreground">Text</strong> để bắt đầu tìm kiếm</p>
                   <p>• Chọn <strong class="text-foreground">Any Searchable Field</strong> và <strong class="text-foreground">Contains</strong></p>
                   <p>• Dán chuỗi tên ảnh vào ô tìm kiếm và nhấn Enter</p>
                 </CardContent>
               </Card>

               <Card class="border-border/40">
                 <CardHeader class="pb-3">
                   <CardTitle class="text-base font-semibold">Hướng dẫn sử dụng</CardTitle>
                 </CardHeader>
                 <CardContent class="space-y-3 text-sm text-muted-foreground leading-relaxed">
                   <p>• Dán dãy số tên ảnh vào ô nhập liệu</p>
                   <p>• Công cụ sẽ xử lý và hiển thị dãy số đã được phân tách</p>
                   <p>• <strong class="text-amber-600 dark:text-amber-400">Chú ý:</strong> Tránh số có 1-2 hoặc 5+ chữ số</p>
                   <p>• Kiểm tra kết quả và điều chỉnh nếu có cảnh báo</p>
                 </CardContent>
               </Card>
             </div>
          </div>
        </div>
      </section>

      <!-- Todo Panel -->
      <section class="flex-1" :class="{ 'hidden': !showTodoPanel }">
        <div class="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-muted/20">
          <h2 class="text-lg font-semibold text-foreground">Todo List Manager</h2>
          <div class="flex items-center gap-2">
            <Button size="sm" variant="outline" @click="generateSmartTodoList" :disabled="isGeneratingTodo" v-if="showResults" class="font-medium">
              <ListTodo class="w-4 h-4 mr-1" />
              {{ isGeneratingTodo ? 'Tạo...' : 'Tạo Todo' }}
            </Button>
          </div>
        </div>
        <div class="h-full overflow-y-auto p-6" v-show="showTodoPanel">
          <div v-if="!todoList" class="flex flex-col items-center justify-center h-full text-center">
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
          
          <div v-else class="max-w-4xl mx-auto space-y-6">
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
                  <Button size="sm" variant="ghost" @click="moveGroupUp" title="Tăng độ ưu tiên" class="h-8 w-8 p-0">
                    <ChevronUp class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" @click="moveGroupDown" title="Giảm độ ưu tiên" class="h-8 w-8 p-0">
                    <ChevronDown class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="clearCompletedTasks" title="Xóa task hoàn thành" class="h-8 w-8 p-0">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="copyTodoListAsJSON" title="Sao chép JSON" class="h-8 w-8 p-0">
                    <Copy class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" @click="clearAllTodoList" title="Xóa nhóm" class="h-8 w-8 p-0">
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
              <div 
                v-for="(item, index) in todoList.items" 
                :key="item.id"
                class="group bg-card border border-border/40 rounded-xl p-4 hover:border-border/60 transition-all duration-200 hover:shadow-sm"
                :class="{ 'opacity-60': item.completed }"
              >
                <!-- Task Header -->
                <div class="flex items-start gap-3">
                  <input 
                    type="checkbox"
                    :checked="item.completed" 
                    @change="toggleTaskComplete(item.id)"
                    class="mt-1 w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  
                  <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <div class="flex items-center gap-2 mb-2">
                      <div v-if="editingTaskId === item.id && editingField === 'title'" class="flex-1 flex gap-1">
                        <input 
                          v-model="editingValue" 
                          class="text-base font-semibold h-7 px-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20" 
                          @keyup.enter="saveEdit"
                          @keyup.escape="cancelEdit"
                        />
                        <Button size="sm" variant="ghost" @click="saveEdit" class="h-7 w-7 p-0">
                          <Check class="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" @click="cancelEdit" class="h-7 w-7 p-0">
                          <X class="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div v-else class="flex-1 flex items-center gap-2">
                        <span 
                          class="text-base font-semibold cursor-pointer hover:text-primary transition-colors truncate"
                          :class="{ 'line-through': item.completed }"
                          @click="startEditing(item.id, 'title', item.title)"
                        >
                          {{ item.title }}
                        </span>
                        <Button size="sm" variant="ghost" @click="startEditing(item.id, 'title', item.title)" class="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit class="w-3 h-3" />
                        </Button>
                      </div>
                      <Badge 
                        :variant="item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'"
                        class="text-xs font-medium px-2 py-1"
                      >
                        {{ item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'TB' : 'Thấp' }}
                      </Badge>
                    </div>
                    
                    <!-- Description -->
                    <div class="mb-3">
                      <div v-if="editingTaskId === item.id && editingField === 'description'" class="flex gap-1">
                        <textarea 
                          v-model="editingValue" 
                          class="text-sm px-2 py-1 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 resize-none flex-1" 
                          rows="2"
                          @keyup.enter="saveEdit"
                          @keyup.escape="cancelEdit"
                          placeholder="Thêm mô tả cho task này..."
                        ></textarea>
                        <div class="flex flex-col gap-1">
                          <Button size="sm" variant="ghost" @click="saveEdit" class="h-6 w-6 p-0">
                            <Check class="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" @click="cancelEdit" class="h-6 w-6 p-0">
                            <X class="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p v-else-if="item.description" 
                         class="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors leading-relaxed"
                         :class="{ 'line-through': item.completed }"
                         @click="startEditing(item.id, 'description', item.description)"
                      >
                        {{ item.description }}
                      </p>
                      <p v-else 
                         class="text-sm text-muted-foreground/60 cursor-pointer italic hover:text-muted-foreground transition-colors"
                         @click="startEditing(item.id, 'description', '')"
                      >
                        Thêm mô tả...
                      </p>
                    </div>
                    
                    <!-- Task Meta -->
                    <div class="flex items-center flex-wrap gap-2 mb-2">
                      <Badge v-if="item.imageCode" variant="outline" class="text-xs font-mono px-2 py-1">
                        📷 {{ item.imageCode }}
                      </Badge>
                      
                      <span v-if="item.dueDate" class="inline-flex items-center gap-1 bg-muted/60 px-2 py-1 rounded-md text-xs font-medium">
                        📅 {{ new Date(item.dueDate).toLocaleDateString('vi-VN') }}
                      </span>
                    </div>
                    
                    <!-- Tags -->
                    <div class="flex flex-wrap gap-1 items-center">
                      <div v-if="editingTaskId === item.id && editingField === 'tags'" class="flex gap-1 flex-1">
                        <input 
                          v-model="editingValue" 
                          placeholder="tag1, tag2, tag3"
                          class="text-xs h-6 flex-1 px-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20" 
                          @keyup.enter="saveEdit"
                          @keyup.escape="cancelEdit"
                        />
                        <Button size="sm" variant="ghost" @click="saveEdit" class="h-6 w-6 p-0">
                          <Check class="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" @click="cancelEdit" class="h-6 w-6 p-0">
                          <X class="w-3 h-3" />
                        </Button>
                      </div>
                      <div v-else class="flex flex-wrap gap-1 items-center">
                        <Badge 
                          v-for="tag in item.tags" 
                          :key="tag" 
                          variant="outline" 
                          class="text-xs cursor-pointer hover:bg-muted transition-colors px-2 py-1"
                          @click="startEditing(item.id, 'tags', item.tags.join(', '))"
                        >
                          #{{ tag }}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          @click="startEditing(item.id, 'tags', item.tags ? item.tags.join(', ') : '')"
                          class="h-6 text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
                        >
                          + tag
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Task Controls -->
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      @click="moveTaskUp(item.id)" 
                      :disabled="index === 0"
                      class="h-7 w-7 p-0"
                      title="Di chuyển lên"
                    >
                      <ChevronUp class="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      @click="moveTaskDown(item.id)" 
                      :disabled="index === todoList.items.length - 1"
                      class="h-7 w-7 p-0"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown class="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      @click="deleteTask(item.id)" 
                      class="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Xóa task"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
/* Custom Scrollbar Override */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

::-webkit-scrollbar-corner {
  background: hsl(var(--muted));
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.3) hsl(var(--muted));
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom focus styles for better accessibility */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
