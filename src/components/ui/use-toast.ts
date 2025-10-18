import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (toastId?: string) => void;
  toasts: Toast[];
}

export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toastData, id };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    } else {
      setToasts([]);
    }
  }, []);

  return { toast, dismiss, toasts };
}



