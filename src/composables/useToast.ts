import { ref, reactive } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
const toastTimeouts = new Map<string, number>()

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    }
    
    toasts.value.push(newToast)
    
    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      const timeout = setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
      
      toastTimeouts.set(id, timeout)
    }
    
    return id
  }
  
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
      
      // Clear timeout if exists
      const timeout = toastTimeouts.get(id)
      if (timeout) {
        clearTimeout(timeout)
        toastTimeouts.delete(id)
      }
    }
  }
  
  const clearAllToasts = () => {
    // Clear all timeouts
    toastTimeouts.forEach(timeout => clearTimeout(timeout))
    toastTimeouts.clear()
    
    // Clear all toasts
    toasts.value = []
  }
  
  // Convenience methods
  const success = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'success', message, title, duration })
  }
  
  const error = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'error', message, title, duration })
  }
  
  const warning = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'warning', message, title, duration })
  }
  
  const info = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'info', message, title, duration })
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}