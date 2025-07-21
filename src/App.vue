<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Upload, Copy, Save, Trash2, Sun, Moon } from 'lucide-vue-next'

// Reactive data
const inputData = ref('')
const outputResult = ref('')
const numberCount = ref(0)
const hasWarning = ref(false)
const savedBoxes = ref<Record<string, string>>({})
const copyButtonText = ref('Copy')
const copyValidButtonText = ref('Copy Valid')
const isDark = ref(true)

// Load saved data from localStorage
const loadSavedBoxes = () => {
  const saved = localStorage.getItem('savedBoxes')
  if (saved) {
    savedBoxes.value = JSON.parse(saved)
  }
}

// Save data to localStorage
const saveSavedBoxes = () => {
  localStorage.setItem('savedBoxes', JSON.stringify(savedBoxes.value))
}

// Theme management
const loadTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  }
  updateTheme()
}

const saveTheme = () => {
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  saveTheme()
  updateTheme()
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Process input data
const processData = () => {
  const input = inputData.value
  // Find all number sequences in the string
  const numbers = (input.match(/\d+/g) || []).filter(item => item.length > 0)
  // Remove duplicates
  const uniqueNumbers = [...new Set(numbers)]
  
  // Add leading zero to 3-digit numbers
  const formattedNumbers = uniqueNumbers.map(num => 
    num.length === 3 ? num.padStart(4, '0') : num
  )
  const cleanedData = formattedNumbers.join(' ')
  
  outputResult.value = cleanedData
  numberCount.value = uniqueNumbers.length
  
  // Check for warnings: numbers with 1, 2 or 5+ digits
  hasWarning.value = numbers.some(num => 
    num.length === 1 || num.length === 2 || num.length >= 5
  )
}

// Copy to clipboard
const copyToClipboard = async () => {
  if (outputResult.value) {
    try {
      await navigator.clipboard.writeText(outputResult.value)
      copyButtonText.value = 'Copied!'
      setTimeout(() => {
        copyButtonText.value = 'Copy'
      }, 1000)
    } catch (err) {
      alert('Không thể sao chép. Vui lòng thử lại!')
    }
  } else {
    alert('Không có dữ liệu để sao chép!')
  }
}

// Copy valid numbers only
const copyValidToClipboard = async () => {
  const input = inputData.value
  const numbers = (input.match(/\d+/g) || []).filter(item => item.length > 0)
  // Only get numbers with 3-4 digits
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

// Save to box
const saveToBox = () => {
  const input = inputData.value
  const numbers = (input.match(/\d+/g) || []).filter(item => 
    item.length > 2 && item.length < 5
  )
  const validNumbers = [...new Set(numbers)].join(' ')
  
  if (!validNumbers) {
    alert('Không có chuỗi hợp lệ để lưu!')
    return
  }
  
  const boxName = `Box ${Date.now()}`
  savedBoxes.value[boxName] = validNumbers
  saveSavedBoxes()
}

// Copy box content
const copyBoxContent = async (boxName: string) => {
  const content = savedBoxes.value[boxName]
  if (content) {
    try {
      await navigator.clipboard.writeText(content)
      alert('Nội dung đã được sao chép!')
    } catch (err) {
      alert('Không thể sao chép nội dung!')
    }
  }
}

// Delete box
const deleteBox = (boxName: string) => {
  delete savedBoxes.value[boxName]
  saveSavedBoxes()
}

// Rename box
const renameBox = (oldName: string) => {
  const newName = prompt('Nhập tên mới cho box:', oldName)
  if (!newName || newName === oldName) return
  
  if (savedBoxes.value[newName]) {
    alert('Tên box đã tồn tại!')
    return
  }
  
  savedBoxes.value[newName] = savedBoxes.value[oldName]
  delete savedBoxes.value[oldName]
  saveSavedBoxes()
}

// Export history
const exportHistory = () => {
  const blob = new Blob([JSON.stringify(savedBoxes.value, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'history.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import history
const importHistory = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target?.result as string)
      if (importedData && typeof importedData === 'object') {
        savedBoxes.value = { ...savedBoxes.value, ...importedData }
        saveSavedBoxes()
        alert('Import thành công!')
      } else {
        alert('File không hợp lệ!')
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi đọc file!')
    }
  }
  reader.readAsText(file)
}

// Computed properties
const showResults = computed(() => outputResult.value.length > 0)
const showCopyValid = computed(() => hasWarning.value)

// Initialize
onMounted(() => {
  loadTheme()
  loadSavedBoxes()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <a href="/" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Về trang chủ
      </a>
      
      <Button variant="outline" size="sm" @click="toggleTheme">
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </Button>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Main content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main processing area -->
        <div class="lg:col-span-2 space-y-6">
          <div>
            <h1 class="text-4xl font-bold mb-4">Xử lý tên ảnh</h1>
            <p class="text-muted-foreground mb-6">
              Nhập dãy số vào ô bên dưới. Tool sẽ xử lý để trả về dãy số cùng một hàng, cách nhau bởi dấu cách.
            </p>
          </div>

          <!-- Input area -->
          <Card>
            <CardContent class="p-6">
              <Textarea
                v-model="inputData"
                placeholder="Nhập dãy số ở đây..."
                class="min-h-[150px] resize-y"
              />
              
              <div class="flex flex-wrap gap-3 mt-4">
                <Button @click="processData">
                  Xử Lý
                </Button>
                
                <Button 
                  v-if="showResults" 
                  @click="copyToClipboard" 
                  variant="outline"
                >
                  <Copy class="w-4 h-4 mr-2" />
                  {{ copyButtonText }}
                </Button>
                
                <Button 
                  v-if="showCopyValid" 
                  @click="copyValidToClipboard" 
                  variant="outline"
                >
                  <Copy class="w-4 h-4 mr-2" />
                  {{ copyValidButtonText }}
                </Button>
                
                <Button 
                  v-if="showResults" 
                  @click="saveToBox" 
                  variant="outline"
                >
                  <Save class="w-4 h-4 mr-2" />
                  Lưu
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Results -->
          <Card v-if="showResults">
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                Kết quả
                <Badge variant="secondary">{{ numberCount }} số</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                {{ outputResult }}
              </div>
            </CardContent>
          </Card>

          <!-- Warning -->
          <Alert v-if="hasWarning" class="border-yellow-500/50 bg-yellow-500/10">
            <AlertDescription class="text-yellow-400">
              ⚠️ Warning: Có tên ảnh không phù hợp (số có 1, 2 hoặc từ 5 chữ số trở lên).
            </AlertDescription>
          </Alert>

          <!-- Instructions -->
          <div class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng trong Adobe Lightroom</CardTitle>
              </CardHeader>
              <CardContent class="space-y-2 text-sm text-muted-foreground">
                <p>• Vào tab <strong class="text-foreground">Library</strong>, nhấn phím <strong class="text-foreground">G</strong>, sau đó nhấn phím <strong class="text-foreground">"\"</strong> để hiển thị <em>Filter Bar</em>.</p>
                <p>• Nhấn vào phần <strong class="text-foreground">Text</strong> để bắt đầu tìm kiếm.</p>
                <p>• Chọn <strong class="text-foreground">Any Searchable Field</strong> và <strong class="text-foreground">Contains</strong>.</p>
                <p>• Dán chuỗi tên ảnh vào ô tìm kiếm và nhấn Enter để tìm kiếm.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng công cụ</CardTitle>
              </CardHeader>
              <CardContent class="space-y-2 text-sm text-muted-foreground">
                <p>• Dán dãy số tên ảnh vào ô nhập liệu.</p>
                <p>• Công cụ sẽ xử lý và hiển thị dãy số đã được phân tách, cách nhau bằng dấu cách.</p>
                <p>• <strong class="text-yellow-400">Chú ý:</strong> Tránh sử dụng các số có 1, 2 hoặc 3 chữ số, hoặc các số có từ 5 chữ số trở lên.</p>
                <p>• Kiểm tra kết quả và nếu có thông báo cảnh báo, hãy điều chỉnh lại dãy số để đảm bảo tính chính xác.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Saved boxes sidebar -->
        <div class="lg:col-span-1">
          <Card class="sticky top-8">
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                Lịch sử lưu
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="() => document.getElementById('importFile')?.click()">
                    <Upload class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="exportHistory">
                    <Download class="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent class="max-h-[600px] overflow-y-auto space-y-3">
              <div v-if="Object.keys(savedBoxes).length === 0" class="text-center text-muted-foreground py-8">
                Chưa có dữ liệu được lưu
              </div>
              
              <div v-for="(content, boxName) in savedBoxes" :key="boxName" class="border border-border rounded-lg p-3 space-y-2">
                <div class="flex items-center justify-between">
                  <button 
                    @click="renameBox(boxName)" 
                    class="text-sm font-medium text-primary hover:text-primary/80 truncate flex-1 text-left"
                  >
                    {{ boxName }}
                  </button>
                  <div class="flex gap-1">
                    <Button size="sm" variant="ghost" @click="copyBoxContent(boxName)">
                      <Copy class="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" @click="deleteBox(boxName)">
                      <Trash2 class="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div class="bg-muted p-2 rounded text-xs font-mono break-all text-muted-foreground">
                  {{ content }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input 
      id="importFile" 
      type="file" 
      accept=".json" 
      @change="importHistory" 
      class="hidden"
    />
  </div>
</template>
