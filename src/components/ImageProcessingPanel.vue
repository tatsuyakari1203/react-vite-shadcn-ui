<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copy, Save, ListTodo } from 'lucide-vue-next'

interface Props {
  inputData: string
  outputResult: string
  copyButtonText: string
  copyValidButtonText: string
  showResults: boolean
  showCopyValid: boolean
  hasWarning: boolean
  numberCount: number
  isGeneratingTodo: boolean
  showImagePanel: boolean
  showTodoPanel: boolean
}

interface Emits {
  'update:inputData': [value: string]
  processData: []
  copyToClipboard: []
  copyValidToClipboard: []
  saveToBox: []
  generateSmartTodoList: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
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
              :model-value="inputData"
              @update:model-value="$emit('update:inputData', $event)"
              placeholder="Nhập dãy số ở đây..."
              class="min-h-[150px] resize-y border-border/40 focus:border-primary/40 transition-colors"
            />
            
            <div class="flex flex-wrap gap-2 mt-6">
              <Button @click="$emit('processData')" class="font-medium">
                Xử Lý
              </Button>
              
              <Button 
                v-if="showResults" 
                @click="$emit('copyToClipboard')" 
                variant="outline"
                class="font-medium"
              >
                <Copy class="w-4 h-4 mr-2" />
                {{ copyButtonText }}
              </Button>
              
              <Button 
                v-if="showCopyValid" 
                @click="$emit('copyValidToClipboard')" 
                variant="outline"
                class="font-medium"
              >
                <Copy class="w-4 h-4 mr-2" />
                {{ copyValidButtonText }}
              </Button>
              
              <Button 
                v-if="showResults" 
                @click="$emit('saveToBox')" 
                variant="outline"
                class="font-medium"
              >
                <Save class="w-4 h-4 mr-2" />
                Lưu
              </Button>
              
              <Button 
                v-if="showResults" 
                @click="$emit('generateSmartTodoList')" 
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
</template>