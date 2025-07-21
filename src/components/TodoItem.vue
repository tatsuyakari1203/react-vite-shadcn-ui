<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, Trash2, Edit, Check, X } from 'lucide-vue-next'

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

interface Props {
  item: TodoItem
  index: number
  totalItems: number
  editingTaskId: string | null
  editingField: string | null
  editingValue: string
}

interface Emits {
  toggleComplete: []
  moveUp: []
  moveDown: []
  startEditing: [data: { field: string, value: string }]
  saveEdit: []
  cancelEdit: []
  delete: []
  'update:editingValue': [value: string]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div 
    class="group bg-card border border-border/40 rounded-xl p-4 hover:border-border/60 transition-all duration-200 hover:shadow-sm"
    :class="{ 'opacity-60': item.completed }"
  >
    <!-- Task Header -->
    <div class="flex items-start gap-3">
      <input 
        type="checkbox"
        :checked="item.completed" 
        @change="$emit('toggleComplete')"
        class="mt-1 w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary/20 transition-colors"
      />
      
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <div class="flex items-center gap-2 mb-2">
          <div v-if="editingTaskId === item.id && editingField === 'title'" class="flex-1 flex gap-1">
            <input 
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
              class="text-base font-semibold h-7 px-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20" 
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            />
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-7 w-7 p-0">
              <Check class="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-7 w-7 p-0">
              <X class="w-3.5 h-3.5" />
            </Button>
          </div>
          <div v-else class="flex-1 flex items-center gap-2">
            <span 
              class="text-base font-semibold cursor-pointer hover:text-primary transition-colors truncate"
              :class="{ 'line-through': item.completed }"
              @click="$emit('startEditing', { field: 'title', value: item.title })"
            >
              {{ item.title }}
            </span>
            <Button size="sm" variant="ghost" @click="$emit('startEditing', { field: 'title', value: item.title })" class="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLTextAreaElement).value)"
              class="text-sm px-2 py-1 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 resize-none flex-1" 
              rows="2"
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
              placeholder="Thêm mô tả cho task này..."
            ></textarea>
            <div class="flex flex-col gap-1">
              <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-6 w-6 p-0">
                <Check class="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-6 w-6 p-0">
                <X class="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p v-else-if="item.description" 
             class="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors leading-relaxed"
             :class="{ 'line-through': item.completed }"
             @click="$emit('startEditing', { field: 'description', value: item.description })"
          >
            {{ item.description }}
          </p>
          <p v-else 
             class="text-sm text-muted-foreground/60 cursor-pointer italic hover:text-muted-foreground transition-colors"
             @click="$emit('startEditing', { field: 'description', value: '' })"
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
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
              placeholder="tag1, tag2, tag3"
              class="text-xs h-6 flex-1 px-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20" 
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            />
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-6 w-6 p-0">
              <Check class="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-6 w-6 p-0">
              <X class="w-3 h-3" />
            </Button>
          </div>
          <div v-else class="flex flex-wrap gap-1 items-center">
            <Badge 
              v-for="tag in item.tags" 
              :key="tag" 
              variant="outline" 
              class="text-xs cursor-pointer hover:bg-muted transition-colors px-2 py-1"
              @click="$emit('startEditing', { field: 'tags', value: item.tags?.join(', ') || '' })"
            >
              #{{ tag }}
            </Badge>
            <Button 
              size="sm" 
              variant="ghost" 
              @click="$emit('startEditing', { field: 'tags', value: item.tags?.join(', ') || '' })"
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
          @click="$emit('moveUp')" 
          :disabled="index === 0"
          class="h-7 w-7 p-0"
          title="Di chuyển lên"
        >
          <ChevronUp class="w-3.5 h-3.5" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          @click="$emit('moveDown')" 
          :disabled="index === totalItems - 1"
          class="h-7 w-7 p-0"
          title="Di chuyển xuống"
        >
          <ChevronDown class="w-3.5 h-3.5" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          @click="$emit('delete')" 
          class="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Xóa task"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>