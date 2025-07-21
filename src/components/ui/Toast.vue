<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm',
            'min-w-[300px] max-w-[400px]',
            toastClasses[toast.type]
          ]"
        >
          <div class="flex-shrink-0">
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5" />
            <Info v-else-if="toast.type === 'info'" class="w-5 h-5" />
            <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5" />
          </div>
          
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="font-medium text-sm mb-1">{{ toast.title }}</p>
            <p class="text-sm opacity-90 break-words">{{ toast.message }}</p>
          </div>
          
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>