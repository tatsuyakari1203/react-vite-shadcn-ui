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
    class="group bg-card border border-border rounded-lg p-2 hover:border-border transition-colors"
    :class="{ 'opacity-60': item.completed }"
  >
    <!-- Task Header -->
    <div class="flex items-start gap-1.5">
      <input 
        type="checkbox"
        :checked="item.completed" 
        @change="$emit('toggleComplete')"
        class="mt-0.5 w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary/20 transition-colors"
      />
      
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <div class="flex items-center gap-1 mb-0.5">
          <div v-if="editingTaskId === item.id && editingField === 'title'" class="flex-1 flex gap-0.5">
            <input 
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
              class="text-xs font-semibold h-5 px-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary/20" 
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            />
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-5 w-5 p-0">
              <Check class="w-2.5 h-2.5" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-5 w-5 p-0">
              <X class="w-2.5 h-2.5" />
            </Button>
          </div>
          <div v-else class="flex-1 flex items-center gap-0.5">
            <span 
              class="text-xs font-semibold cursor-pointer hover:text-primary transition-colors truncate"
              :class="{ 'line-through': item.completed }"
              @click="$emit('startEditing', { field: 'title', value: item.title })"
            >
              {{ item.title }}
            </span>
            <Button size="sm" variant="ghost" @click="$emit('startEditing', { field: 'title', value: item.title })" class="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit class="w-2 h-2" />
            </Button>
          </div>
          <div v-if="editingTaskId === item.id && editingField === 'priority'" class="flex gap-0.5">
            <select 
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLSelectElement).value)"
              class="h-5 px-1 text-xs border border-border rounded bg-background focus:ring-1 focus:ring-primary/20"
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            >
              <option value="high">Cao</option>
              <option value="medium">TB</option>
              <option value="low">Thấp</option>
            </select>
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-5 w-5 p-0">
              <Check class="w-2.5 h-2.5" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-5 w-5 p-0">
              <X class="w-2.5 h-2.5" />
            </Button>
          </div>
          <Badge v-else
            :variant="item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'"
            class="text-xs font-medium px-1.5 py-0.5 cursor-pointer hover:bg-muted transition-colors"
            @click="$emit('startEditing', { field: 'priority', value: item.priority })"
          >
            {{ item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'TB' : 'Thấp' }}
          </Badge>
        </div>
        
        <!-- Description -->
        <div class="mb-1">
          <div v-if="editingTaskId === item.id && editingField === 'description'" class="flex gap-0.5">
            <textarea 
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLTextAreaElement).value)"
              class="text-xs px-1.5 py-0.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary/20 resize-none flex-1" 
              rows="1"
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
              placeholder="Thêm mô tả cho task này..."
            ></textarea>
            <div class="flex flex-col gap-0.5">
              <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-4 w-4 p-0">
                <Check class="w-2 h-2" />
              </Button>
              <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-4 w-4 p-0">
                <X class="w-2 h-2" />
              </Button>
            </div>
          </div>
          <p v-else-if="item.description" 
             class="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors leading-relaxed"
             :class="{ 'line-through': item.completed }"
             @click="$emit('startEditing', { field: 'description', value: item.description })"
          >
            {{ item.description }}
          </p>
          <p v-else 
             class="text-xs text-muted-foreground/60 cursor-pointer italic hover:text-muted-foreground transition-colors"
             @click="$emit('startEditing', { field: 'description', value: '' })"
          >
            Thêm mô tả...
          </p>
        </div>
        
        <!-- Task Meta & Tags - Compact Layout -->
        <div class="flex items-center flex-wrap gap-1 text-xs">
          <!-- Image Code -->
          <div v-if="editingTaskId === item.id && editingField === 'imageCode'" class="flex gap-1">
            <input 
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
              placeholder="IMG_001"
              class="h-5 w-18 px-1.5 text-xs border border-border rounded bg-background focus:ring-1 focus:ring-primary/20" 
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            />
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-5 w-5 p-0">
              <Check class="w-2.5 h-2.5" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-5 w-5 p-0">
              <X class="w-2.5 h-2.5" />
            </Button>
          </div>
          <Badge v-else-if="item.imageCode" 
                 variant="outline" 
                 class="cursor-pointer hover:bg-muted transition-colors px-1.5 py-0.5 text-xs"
                 @click="$emit('startEditing', { field: 'imageCode', value: item.imageCode })">
            📷 {{ item.imageCode }}
          </Badge>
          <Button v-else
                  size="sm" 
                  variant="ghost" 
                  @click="$emit('startEditing', { field: 'imageCode', value: '' })"
                  class="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground">
            + 📷
          </Button>
          
          <!-- Due Date -->
          <div v-if="editingTaskId === item.id && editingField === 'dueDate'" class="flex gap-1">
            <input 
              type="date"
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
              class="h-5 px-1.5 text-xs border border-border rounded bg-background focus:ring-1 focus:ring-primary/20" 
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            />
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-5 w-5 p-0">
              <Check class="w-2.5 h-2.5" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-5 w-5 p-0">
              <X class="w-2.5 h-2.5" />
            </Button>
          </div>
          <Badge v-else-if="item.dueDate" 
                 variant="secondary" 
                 class="cursor-pointer hover:bg-muted transition-colors px-1.5 py-0.5 text-xs"
                 @click="$emit('startEditing', { field: 'dueDate', value: item.dueDate })">
            📅 {{ new Date(item.dueDate).toLocaleDateString('vi-VN') }}
          </Badge>
          <Button v-else
                  size="sm" 
                  variant="ghost" 
                  @click="$emit('startEditing', { field: 'dueDate', value: '' })"
                  class="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground">
            + 📅
          </Button>
          
          <!-- Tags -->
          <div v-if="editingTaskId === item.id && editingField === 'tags'" class="flex gap-1">
            <input 
              :value="editingValue"
              @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
              placeholder="tag1, tag2, tag3"
              class="h-5 w-28 px-1.5 text-xs border border-border rounded bg-background focus:ring-1 focus:ring-primary/20" 
              @keyup.enter="$emit('saveEdit')"
              @keyup.escape="$emit('cancelEdit')"
            />
            <Button size="sm" variant="ghost" @click="$emit('saveEdit')" class="h-5 w-5 p-0">
              <Check class="w-2.5 h-2.5" />
            </Button>
            <Button size="sm" variant="ghost" @click="$emit('cancelEdit')" class="h-5 w-5 p-0">
              <X class="w-2.5 h-2.5" />
            </Button>
          </div>
          <template v-else>
            <Badge 
              v-for="tag in item.tags" 
              :key="tag" 
              variant="outline" 
              class="cursor-pointer hover:bg-muted transition-colors px-1.5 py-0.5 text-xs"
              @click="$emit('startEditing', { field: 'tags', value: item.tags?.join(', ') || '' })"
            >
              #{{ tag }}
            </Badge>
            <Button 
              size="sm" 
              variant="ghost" 
              @click="$emit('startEditing', { field: 'tags', value: item.tags?.join(', ') || '' })"
              class="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
              :class="{ 'opacity-0 group-hover:opacity-100 transition-opacity': item.tags && item.tags.length > 0 }"
            >
              + 🏷️
            </Button>
          </template>
        </div>
      </div>
      
      <!-- Task Controls - Vertical Layout -->
      <div class="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        <Button 
          size="sm" 
          variant="ghost" 
          @click="$emit('moveUp')" 
          :disabled="index === 0"
          class="h-4 w-4 p-0"
          title="Di chuyển lên"
        >
          <ChevronUp class="w-2 h-2" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          @click="$emit('moveDown')" 
          :disabled="index === totalItems - 1"
          class="h-4 w-4 p-0"
          title="Di chuyển xuống"
        >
          <ChevronDown class="w-2 h-2" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          @click="$emit('delete')" 
          class="h-4 w-4 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Xóa task"
        >
          <Trash2 class="w-2 h-2" />
        </Button>
      </div>
    </div>
  </div>
</template>