'use client';

import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessages {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export function useToast() {
  const toast = (message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        sonnerToast.success(message);
        break;
      case 'error':
        sonnerToast.error(message);
        break;
      case 'warning':
        sonnerToast.warning(message);
        break;
      default:
        sonnerToast.info(message);
    }
  };

  return {
    toast,
    success: (message: string) => toast(message, 'success'),
    error: (message: string) => toast(message, 'error'),
    warning: (message: string) => toast(message, 'warning'),
    info: (message: string) => toast(message, 'info'),
    // Batch toast methods with i18n support
    fromMessages: (messages: ToastMessages) => {
      if (messages.success) toast(messages.success, 'success');
      if (messages.error) toast(messages.error, 'error');
      if (messages.warning) toast(messages.warning, 'warning');
      if (messages.info) toast(messages.info, 'info');
    },
  };
}
